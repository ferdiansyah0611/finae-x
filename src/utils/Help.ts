import { blue, cyan } from 'colors';
import { sprintf } from 'printf';
import { ArgumentType, CommandType, HelpType, OptionType, ProgramType } from '@/types.d.ts';

// deno-lint-ignore no-explicit-any
type ItemType = ArgumentType.Type | CommandType.Type | OptionType.Type | any;
type SectionCallbackReturn = { title: string; description: string };

export default class Help implements HelpType.Type {
	#program: ProgramType.Type;
	#info: {
		name: string;
		description: string;
		version: string;
		collection: HelpType.Collection;
		isCommand: boolean;
	};
	constructor(
		name: string,
		description: string,
		version: string,
		collection: HelpType.Collection,
		program: ProgramType.Type,
		isCommand: boolean = false,
	) {
		this.#program = program;
		this.#info = { name, description, version, collection, isCommand };
	}
	compile(): string {
		const setup = this.#program.getSetup();
		const { collection } = this.#info;

		let usagePattern = /('command\.js)/;
		if (setup.usage.name) {
			usagePattern = new RegExp('(\'' + setup.usage.name + ')');
		}

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
			text = text.replace(usagePattern, '$1 ' + this.#info.name);
		}

		let nested: number[] = [];
		const columns = this.getColumns();

		const allLength = [...len.arguments, ...len.commands, ...len.options];
		const max = Math.max(...allLength);
		const makeSection = (
			key: string,
			selectorCallback: (
				item: ItemType,
			) => SectionCallbackReturn,
		) => {
			const isCore = ["arguments", "commands", "options"].includes(key);
			let result: string[]|string = collection[key]
				.map((item: ItemType, index: number) => {
					const selector = selectorCallback(item);
					if (key === "commands" && this.#info.isCommand) {
						selector.title = selector.title.replace(this.#info.name, '') + " ".repeat(this.#info.name.length);
					}

					const remain = max - len[key][index];
					const title = cyan(selector.title) + ' '.repeat(remain) + '\t';
					// wrapping text
					const groupText = title + selector.description;
					const oneColumn = () => '\n' + ' '.repeat(max + 2) + '\t';
					const twoColumn = (curentValue: string): string => {
						let value = '';
						for (let i = 0; i < curentValue.length; i++) {
							value += curentValue[i];
							if (Number.isInteger(i / (columns - title.length)) && i !== 0) {
								value += oneColumn();
							}
						}
						return value;
					}
					let newText = twoColumn(groupText);
					if (isCore) {
						const config = item.getInformation().config;
						if (config.default) {
							newText += oneColumn();
							newText += twoColumn(sprintf('%s %s', blue("default  :"), config.default))
						}
						if (config.include && config.include.length) {
							newText += oneColumn();
							newText += twoColumn(sprintf('%s [%s]', blue("includes :"), config.include.join(", ")))
						}
						if (config.exclude && config.exclude.length) {
							newText += oneColumn();
							newText += twoColumn(sprintf('%s [%s]', blue("excludes :"), config.exclude.join(", ")))
						}
					}
					return sprintf('  %s%s', newText, groupText.length > columns ? "\n": "");
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
		if (collection.options) {
			makeSection('options', (item: OptionType.Type) => {
				const { synopsis, description } = item.getInformation();
				return { title: synopsis, description };
			});
		}

		text += appendText;
		return text;
	}

	// makeSection(key: string, selectorCallback: (item: ItemType) => SectionCallbackReturn): HelpType.Type {
	// 	const isCore = this.#isCore(key);
	// 	const columns = this.getColumns();
	// 	const oneColumn = () => '\n' + ' '.repeat(max + 2) + '\t';
	// 	const twoColumn = (oneColValue: string, curentValue: string): string => {
	// 		let value = '';
	// 		for (let i = 0; i < curentValue.length; i++) {
	// 			value += curentValue[i];
	// 			if (Number.isInteger(i / (columns - oneColValue.length)) && i !== 0) {
	// 				value += oneColumn();
	// 			}
	// 		}
	// 		return value;
	// 	}
	// 	let result: string[]|string = collection[key]
	// 		.map((item: ItemType, index: number) => {
	// 			const selector = selectorCallback(item);
	// 			if (key === "commands" && this.#info.isCommand) {
	// 				selector.title = selector.title.replace(this.#info.name, '') + " ".repeat(this.#info.name.length);
	// 			}
	// 			const remain = max - len[key][index];
	// 			const title = cyan(selector.title) + ' '.repeat(remain) + '\t';
	// 			// wrapping text
	// 			const groupText = title + selector.description;
	// 			let newText = twoColumn(title, groupText);
	// 			if (isCore) {
	// 				const config = item.getInformation().config;
	// 				if (config.default) {
	// 					newText += oneColumn();
	// 					newText += twoColumn(title, sprintf('%s %s', blue("default  :"), config.default))
	// 				}
	// 				if (config.include && config.include.length) {
	// 					newText += oneColumn();
	// 					newText += twoColumn(title, sprintf('%s [%s]', blue("includes :"), config.include.join(", ")))
	// 				}
	// 				if (config.exclude && config.exclude.length) {
	// 					newText += oneColumn();
	// 					newText += twoColumn(title, sprintf('%s [%s]', blue("excludes :"), config.exclude.join(", ")))
	// 				}
	// 			}
	// 			return sprintf('  %s%s', newText, groupText.length > columns ? "\n": "");
	// 		});
	// 	if (Array.isArray(result)) {
	// 		if (key === 'commands') {
	// 			result = result.filter((_, index: number) => !nested.includes(index));
	// 		}
	// 		result = result.join('\n');
	// 	}
	// 	if (result.length) {
	// 		appendText += '\n' + (key[0].toUpperCase() + key.slice(1)) +
	// 			':\n\n' +
	// 			result + '\n';
	// 	}
	// 	return this;
	// }

	getColumns(): number {
		let columns = 100;
		try {
			columns = Deno.consoleSize().columns;
		} catch (_e) {
			columns = 100;
		}
		return columns;
	}
	#isCore(key: string): boolean {
		return ["arguments", "commands", "options"].includes(key);
	}
}
