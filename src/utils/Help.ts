// deno-lint-ignore-file
import { cyan } from 'colors';
import { sprintf } from 'printf';
import { ArgumentType, CommandType, HelpType, OptionType, ProgramType } from '@/types.d.ts';

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
		const usagePattern = /('command\.js)/;

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
		text += 'Usage: \'command.js\'';
		text = text.replaceAll('$name', this.#info.name).replaceAll(
			'$description',
			this.#info.description,
		).replaceAll('$version', this.#info.version);

		const len: any = {
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

		let nested: any[] = [];
		let columns = 100;
		try {
			columns = Deno.consoleSize().columns;
		} catch (e) {}

		const allLength = [...len.arguments, ...len.commands, ...len.options];
		const max = Math.max(...allLength);
		const makeSection = <T>(
			key: string,
			selectorCallback: (
				item: T,
			) => { title: string; description: string },
		) => {
			let result = collection[key]
				.map((item: T, index: number) => {
					// @ts-ignore
					const selector = selectorCallback(item);
					let description = selector.description;
					const remain = max - len[key][index];
					const title = cyan(selector.title) + ' '.repeat(remain) +
						'\t';
					const lineLength = title.length + 2 + description.length;
					if (lineLength > columns) {
						description = description.slice(
							0,
							description.length - (lineLength - columns),
						) + '...';
					}
					return sprintf('  %s %s', title, description);
				});
			if (key === 'commands') {
				result = result.filter((_: any, index: number) => !nested.includes(index));
			}
			result = result.join('\n');
			if (result.length) {
				appendText += '\n' + (key[0].toUpperCase() + key.slice(1)) +
					':\n\n' +
					result + '\n';
			}
		};

		if (collection.arguments) {
			makeSection<ArgumentType.Type>('arguments', (item) => {
				let { synopsis, description } = item.getInformation();
				return { title: synopsis, description };
			});
		}
		if (collection.commands) {
			makeSection<CommandType.Type>('commands', (item) => {
				const currNested = item.getNested(true);
				if (currNested.length) {
					nested = nested.concat(currNested);
				}
				let { name, description } = item.getInformation();

				if (this.#info.isCommand) {
					name = name.replace(this.#info.name, '');
				}
				return { title: name, description };
			});
		}
		if (collection.options) {
			makeSection<OptionType.Type>('options', (item) => {
				let { synopsis, description } = item.getInformation();
				return { title: synopsis, description };
			});
		}

		text += appendText;
		return text;
	}
}
