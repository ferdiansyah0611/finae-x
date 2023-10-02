import { blue, cyan } from '../package/colors.ts';
import { sprintf } from '../package/printf.ts';
import { ArgumentType, CommandType, HelpType, OptionType, ProgramType } from '../../types.d.ts';

// deno-lint-ignore no-explicit-any
type ItemType = ArgumentType.Type | CommandType.Type | OptionType.Type | any;
type SectionCallbackReturn = { title: string; description: string };

export default class Help implements HelpType.Type {
	/**
	 * current program
	 */
	#program: ProgramType.Type;
	/**
	 * current command
	 */
	#command: CommandType.Type | null;
	#info: HelpType.Info;
	constructor(
		name: string,
		description: string,
		version: string,
		collection: HelpType.Collection,
		program: ProgramType.Type,
		command: CommandType.Type | null,
		isCommand: boolean = false,
	) {
		this.#program = program;
		this.#command = command;
		this.#info = { name, description, version, collection, isCommand };
	}
	compile(): string {
		const setup = this.#program.getSetup();
		if (setup.callbackHelpRaw) {
			return setup.callbackHelpRaw(this.#info, this.#command);
		}
		const { collection } = this.#info;
		const allowToMakeSection = (section: HelpType.ItemSection): boolean => {
			if (section.key === null) return true;
			if (section.key && section.key.length && this.#command) {
				const splitKey = section.key.split(' ');
				const splitName = this.#command.getInformation().name.split(' ');
				let count = 0;
				for (const item in splitKey) {
					if (splitKey[item] === splitName[item]) count += 1;
					if (count > 0) break;
				}
				if (count !== 0) return true;
				return false;
			}
			return false;
		};
		let usagePattern = /('command\.js)/;
		let nested: number[] = [];
		// custom usage
		if (setup.usage.name) {
			usagePattern = new RegExp('(\'' + setup.usage.name + ')');
		}
		// set [] for empty options
		collection.options = collection.options || [];
		if (setup.help) {
			collection.options.push(setup.help);
		}
		// append setup options
		collection.options = collection.options.concat(setup.options);
		// check hidden options
		if (collection.options) {
			collection.options = collection.options.filter((item) => !item.getInformation().config.isHidden);
		}
		// text help
		let appendText = '\n';
		let text = '';
		text += '$name v$version — $description\n\n';
		text += `Usage: \'${setup.usage.name}\'`;
		text = text.replaceAll('$name', this.#info.name).replaceAll(
			'$description',
			this.#info.description,
		).replaceAll('$version', this.#info.version);

		const len: HelpType.CountCollection = {
			arguments: [],
			commands: [],
			options: [],
			afterArgument: [],
			afterCommand: [],
			afterOption: [],
			firstLine: [],
			lastLine: [],
		};

		if (collection.options?.length) {
			text = text.replace(usagePattern, '$1 [options]');
			len.options = collection.options.map((v) => v.getInformation().synopsis.length);
		}
		if (collection.arguments?.length) {
			text = text.replace(usagePattern, '$1 [...argument]');
			len.arguments = collection.arguments.map((v) => v.getInformation().synopsis.length);
		}
		if (collection.commands?.length) {
			text = text.replace(usagePattern, '$1 [commands]');
			len.commands = collection.commands.map((v) => v.getInformation().name.length);
		}
		if (this.#info.isCommand) {
			const alias = this.#command?.getAlias();
			text = text.replace(usagePattern, '$1 ' + this.#info.name + (alias?.length ? textAlias(alias) : ''));
		}

		if (setup.sectionHelp) {
			for (const key in setup.sectionHelp) {
				if (!setup.sectionHelp[key] || !setup.sectionHelp[key].length) continue;
				for (const section of setup.sectionHelp[key]) {
					if (allowToMakeSection(section)) {
						len[key] = len[key].concat(section.data.map((v) => v.title.length));
					}
				}
			}
		}

		const columns = this.getColumns();
		/**
		 * create empty text for one columns
		 */
		const oneColumnEmpty = (max: number) => '\n' + ' '.repeat(max + 2) + '\t';
		/**
		 * create text on column two
		 */
		const twoColumn = (max: number, oneColVal: string, curentValue: string): string => {
			let value = '';
			for (let i = 0; i < curentValue.length; i++) {
				value += curentValue[i];
				if (Number.isInteger(i / (columns - oneColVal.length)) && i !== 0) {
					value += oneColumnEmpty(max);
				}
			}
			return value;
		};
		/**
		 * generate section custom to stdout
		 */
		const makeSectionCustom = (position: HelpType.Position, isOutput?: boolean): string | void => {
			if (!setup.sectionHelp) return '';
			if (setup.sectionHelp[position]) {
				let output = '';
				for (const section of setup.sectionHelp[position]) {
					if (allowToMakeSection(section)) {
						let results = '';
						let outputs = '';
						if (section.raw) {
							results = section.raw;
							outputs = results;
						} else {
							const max = Math.max(...section.data.map((data) => data.title.length));
							results = section.data.map(
								(item: { title: string; description: string }, index: number) => {
									const remain = max - len[position][index];
									const title = cyan(item.title) + ' '.repeat(remain) + '\t';
									const group = title + item.description;
									const value = twoColumn(max, title, group);
									return sprintf('  %s%s', value, group.length > columns ? '\n' : '');
								},
							).join('\n');
							outputs = '\n' + section.name + '\n\n' + results + '\n';
						}

						if (results.length && !isOutput) {
							appendText += outputs;
						} else {
							output += outputs;
						}
					}
				}
				if (isOutput) return output;
			}
		};
		/**
		 * generate section to stdout
		 */
		const makeSection = (
			key: string,
			selectorCallback: (
				item: ItemType,
			) => SectionCallbackReturn,
		) => {
			const max = Math.max(...len[key]);
			const isCore = this.#isCore(key);
			let result: string[] | string = collection[key]
				.map((item: ItemType, index: number) => {
					const selector = selectorCallback(item);
					if (key === 'commands') {
						if (this.#info.isCommand) {
							selector.title = selector.title.replace(this.#info.name, '') +
								' '.repeat(this.#info.name.length);
						}
					}

					const remain = max - len[key][index];
					const title = cyan(selector.title) + ' '.repeat(remain) + '\t';
					// wrapping text
					const group = title + selector.description;
					let newText = twoColumn(max, title, group);

					if (isCore) {
						const config = item.getInformation().config;
						if (config.default) {
							newText += oneColumnEmpty(max);
							newText += twoColumn(max, title, sprintf('%s %s', blue('default  :'), config.default));
						}
						if (config.include && config.include.length) {
							newText += oneColumnEmpty(max);
							newText += twoColumn(
								max,
								title,
								sprintf('%s [%s]', blue('includes :'), config.include.join(', ')),
							);
						}
						if (config.exclude && config.exclude.length) {
							newText += oneColumnEmpty(max);
							newText += twoColumn(
								max,
								title,
								sprintf('%s [%s]', blue('excludes :'), config.exclude.join(', ')),
							);
						}
					}
					return sprintf('  %s%s', newText, group.length > columns ? '\n' : '');
				});
			if (Array.isArray(result)) {
				if (key === 'commands') {
					result = result.filter((_, index: number) => !nested.includes(index));
				}
				result = result.join('\n');
			}
			if (result.length) {
				appendText += '\n' + (key[0].toUpperCase() + key.slice(1)) +
					':\n\n' +
					result + '\n';
			}
		};

		if (collection.arguments) {
			makeSection('arguments', (item: ArgumentType.Type) => {
				const { synopsis, description } = item.getInformation();
				return { title: synopsis, description };
			});
		}
		makeSectionCustom('afterArgument');

		if (collection.commands) {
			makeSection('commands', (item: CommandType.Type) => {
				const currNested = item.getNestedKey();
				if (currNested.length) {
					nested = nested.concat(currNested);
				}
				const { name, description } = item.getInformation();
				return { title: name, description };
			});
		}
		makeSectionCustom('afterCommand');

		if (collection.options) {
			makeSection('options', (item: OptionType.Type) => {
				const { synopsis, description } = item.getInformation();
				return { title: synopsis, description };
			});
		}
		makeSectionCustom('afterOption');
		text = makeSectionCustom('firstLine', true) + text;
		text += appendText;
		text += makeSectionCustom('lastLine', true);
		return text;
	}

	getColumns(): number {
		let columns;
		try {
			columns = Deno.consoleSize().columns;
		} catch (_e) {
			columns = 100;
		}
		return columns;
	}
	#isCore(key: string): boolean {
		return ['arguments', 'commands', 'options'].includes(key);
	}
}

function textAlias(alias: string[]) {
	return `|${alias.join('|')}`;
}
