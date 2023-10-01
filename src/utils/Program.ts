import { CommandType, HelpType, OptionType, ProgramType } from '../../types.d.ts';
import { sprintf } from '../package/printf.ts';
import Command from './Command.ts';
import Help from './Help.ts';
import Option from './Option.ts';
import parse from '../helpers/parse.ts';
import highlight from '../helpers/highlight.ts';
import message from '../helpers/message.ts';
import suggest from '../helpers/suggest.ts';
import stderr from '../helpers/stderr.ts';

class Program implements ProgramType.Type {
	#name: string;
	#description: string;
	#config: ProgramType.Config = { stderr };
	#commands: CommandType.Type[] = [];
	#setup: ProgramType.Setup = {
		help: new Option('-h, --help', 'Show the help command'),
		options: [],
		errors: [],
		usage: {
			name: 'main.ts',
		},
	};
	constructor(name: string, description: string, config: ProgramType.Config) {
		this.#name = name;
		this.#description = description;
		this.#config = config;

		if (!config.stderr) this.#config.stderr = stderr;
	}

	command(
		name: string,
		description: string,
		config?: CommandType.Config,
	): CommandType.Type {
		const result = new Command(this, name, description, config);
		this.#commands.push(result);
		return result;
	}
	getAllCommands(): CommandType.Type[] {
		return this.#commands;
	}
	getInformation(): ProgramType.Information {
		return {
			name: this.#name,
			description: this.#description,
			config: this.#config,
		};
	}
	getSetup(): ProgramType.Setup {
		return this.#setup;
	}
	hook(type: ProgramType.HookType, callback: ProgramType.HookCallback): ProgramType.Type {
		const choice = ['preAction', 'postAction', 'preError', 'postError'];
		if (!this.#setup.hook) {
			this.#setup.hook = { preAction: [], postAction: [], preError: [], postError: [] };
		}
		if (!choice.includes(type)) throw Error(sprintf('Invalid Hook: Type not in: %s', choice.join(', ')));
		this.#setup.hook[type].push(callback);
		return this;
	}
	addOption(
		synopsis: string,
		description: string,
		callback?: (cls: OptionType.Type) => OptionType.Type,
	): ProgramType.Type {
		const cls = new Option(synopsis, description);
		if (callback) callback(cls);
		this.#setup.options.push(cls);
		return this;
	}
	helpOption(
		synopsis?: string | boolean | undefined,
		description?: string | undefined,
	): ProgramType.Type {
		if (typeof synopsis === 'boolean') {
			if (!synopsis) this.#setup.help = null;
		} else if (typeof synopsis === 'string') {
			if (!description) description = '';
			this.#setup.help = new Option(synopsis, description);
		}
		return this;
	}

	showHelp(stdout?: boolean): string {
		if (stdout === undefined) stdout = true;
		const help = new Help(
			this.#name,
			this.#description,
			this.#config?.version || '1.0.0',
			{
				commands: this.#commands,
			},
			this,
			null,
		);
		const result = highlight(help.compile());
		if (stdout) console.log(result);
		return result;
	}

	error(message: string[] | string): ProgramType.Type {
		if (Array.isArray(message)) {
			this.#setup.errors = this.#setup.errors.concat(message);
		} else {
			this.#setup.errors.push(message);
		}
		return this;
	}

	usage(name: string): ProgramType.Type {
		this.#setup.usage = { name };
		return this;
	}

	parse(shell: string[] | string): ProgramType.ParseResult {
		if (typeof shell === 'string') shell = shell.split(' ');
		const { _: argument, ...options } = parse(shell);
		return { argument, options };
	}

	async exec(shell: string[] | string): Promise<ProgramType.ReturnExec> {
		this.#clearErrors();

		const { argument, options } = this.parse(shell);
		const shellStr = typeof shell === 'string' ? shell : shell.join(' ');
		const isHelp = () => {
			if (this.#setup.help) {
				const { results } = this.#setup.help.getInformation();
				return options[results.fullName] || options[results.char];
			}
		};
		// core command here
		if (options.v || options.version) {
			const version = this.#config.version ? this.#config.version : '1.0.0';
			console.log(version);
			return this.#response(version, null);
		}
		// help
		if (!argument.length && isHelp()) {
			return this.#response(this.showHelp(), null);
		}
		// matching command
		const result: number[] = [];
		for (const cmd of this.#commands) {
			const data = cmd.getInformation();
			const alias = cmd.getAlias();
			const splits = data.name.split(' ');
			let counter = 0;
			let aliasCounter = 0;
			for (const index in splits) {
				if (argument[index] === splits[index]) counter += 1;
			}
			if (alias.length) {
				for (const index in argument) {
					if (alias.includes(argument[index])) aliasCounter += 1;
				}
				if (aliasCounter >= counter) {
					counter = aliasCounter;
				}
			}
			result.push(counter);
		}
		const max = Math.max(...result);
		const index = result.indexOf(max);
		// command not found
		if (result.every((value) => value === result[0]) && result.length > 1) {
			let text = sprintf(message.error.cmdNotFound, shellStr);
			if (this.#config.suggestAfterError) {
				const index = suggest(
					argument.join(' '),
					this.#commands.map((item) => item.getInformation().name),
				);
				if (index !== -1) {
					text += ' ' + sprintf(message.error.suggest, this.#commands[index].getInformation().name);
				}
			}
			this.error(text);
			this.#emitError(null);
			return this.#response(undefined, null);
		}
		const currentCommand = this.#commands[index];
		const information = {
			info: currentCommand.getInformation(),
			arguments: currentCommand.getArgument(),
			options: currentCommand.getOption(),
		};
		const newArgument: { [key: string]: string } = {};
		const splitFromCommand = information.info.name.split(' ');
		const potentialArg = argument.filter((arg) => !splitFromCommand.find((split) => split === arg));

		// help
		if (isHelp()) {
			return this.#response(currentCommand.showHelp(), null);
		}
		// check argument
		let isVariadicArgument = false;
		for (let i = 0; i < information.arguments.length; i++) {
			const current = information.arguments[i];
			const nextCallback = (howMuch: number) => (i += howMuch);
			const stats = current.doValidation(potentialArg, i, nextCallback);
			this.error(stats.fail);
			if (stats.data) {
				const { results } = current.getInformation();
				newArgument[results.fullName] = stats.data;
			}
			if (current.getInformation().config.isVariadic) isVariadicArgument = true;
		}
		// not same length argument
		if (!isVariadicArgument && potentialArg.length > information.arguments.length) {
			this.error(message.error.exceededArgument);
		}

		// find implies options before validation
		for (const current of information.options) {
			const { config } = current.getInformation();
			if (!config.implies) continue;
			for (const implies of Object.keys(config.implies)) {
				if (!options[implies]) options[implies] = config.implies[implies];
			}
		}

		// validation options
		for (const current of information.options) {
			const stats = current.doValidation(options);
			this.error(stats.fail);
		}
		// find unknown options
		const isAllowUnknown = information.info.config.isAllowUnknown;
		// deno-lint-ignore no-explicit-any
		const unknownOption: { [key: string]: any } = {};
		for (const key in options) {
			let isValid = false;
			for (const current of information.options) {
				const { results } = current.getInformation();
				if (key === results.char || key === results.fullName) {
					isValid = true;
					break;
				}
			}
			if (!isValid) {
				if (isAllowUnknown) {
					unknownOption[key] = options[key];
					continue;
				}
				let text = sprintf(message.error.optionsUnknown, key);
				if (this.#config.suggestAfterError) {
					const indexSuggest = suggest(
						argument.join(' '),
						currentCommand.getOption().map((item) => '--' + item.getInformation().synopsis),
					);
					if (indexSuggest >= 0) {
						text += '. ' +
							sprintf(
								message.error.suggest,
								currentCommand.getOption()[indexSuggest].getInformation().synopsis,
							);
					}
				}
				this.error(text);
			}
		}
		if (isAllowUnknown) currentCommand.setUnknownOption(unknownOption);
		// show errors
		const { errors } = this.#setup;
		if (errors.length) {
			this.#emitError(currentCommand);
			return this.#response(undefined, null);
		}
		// run preAction hook
		this.#emitHook('preAction', currentCommand);
		// run action
		const progress: CommandType.ReturnExecution = await currentCommand.execute({
			argument: Object.keys(newArgument).length ? newArgument : null,
			options,
		});
		// run postAction hook
		this.#emitHook('postAction', currentCommand);
		// if error in progress action
		if (typeof progress === 'object' && progress['isFailed']) {
			return this.#response(undefined, null);
		} else {
			return this.#response(progress, null);
		}
	}

	makeSectionHelp(
		position: HelpType.Position,
		name: string | null,
		key: string | null,
		data: string[][],
		raw?: string,
	): ProgramType.Type {
		if (!this.#setup.sectionHelp) {
			this.#setup.sectionHelp = {
				afterArgument: [],
				afterCommand: [],
				afterOption: [],
				firstLine: [],
				lastLine: [],
			};
		}
		const commit: HelpType.ItemSection = {
			name,
			key,
			data: data.map((item) => ({
				title: item[0],
				description: item[1],
			})),
		};
		if (raw) commit.raw = raw;
		this.#setup.sectionHelp[position].push(commit);
		return this;
	}
	#response(stdout: CommandType.ReturnExecution, stderr: string[] | string | null) {
		stderr = stderr ? stderr : (this.#setup.errors.length ? this.#setup.errors : null);
		return { stdout, stderr };
	}
	#clearErrors() {
		this.#setup.errors = [];
	}
	#emitError(current: CommandType.Type | null) {
		if (!this.#config.stderr) return;
		this.#emitHook('preError', current);
		this.#config.stderr(this.#setup.errors);
		this.#emitHook('postError', current);
	}
	#emitHook(key: ProgramType.HookType, current: CommandType.Type | null) {
		if (this.#setup.hook && this.#setup.hook[key]) {
			for (const callback of this.#setup.hook[key]) {
				callback(current);
			}
		}
	}
}

export default Program;
