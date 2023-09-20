// deno-lint-ignore-file
import _ from 'lodash';
import { sprintf } from 'printf';
import { CommandType, OptionType, ProgramType } from '@/types.d.ts';
import { stderr } from '@/src/utils/Errors.ts';
import Command from '@/src/utils/Command.ts';
import Parse from '@/src/utils/Parse.ts';
import Help from '@/src/utils/Help.ts';
import highlight from '@/src/helpers/highlight.ts';
import message from '@/src/helpers/message.ts';
import Option from '@/src/utils/Option.ts';

class Program implements ProgramType.Type {
	#name: string;
	#description: string;
	#config: ProgramType.Config = { stderr };
	#commands: CommandType.Type[] = [];
	#setup: ProgramType.Setup = {
		help: new Option('-h, --help', 'Show the help command'),
		options: [],
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
	addOption(
		synopsis: string,
		description: string,
		callback?: (cls: OptionType.Type) => any,
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

	help(stdout: boolean = true): string {
		const help = new Help(
			this.#name,
			this.#description,
			this.#config?.version || '1.0.0',
			{
				commands: this.#commands,
			},
			this,
		);
		const result = highlight(help.compile());
		if (stdout) console.log(result);
		return result;
	}

	async exec(shell: string): Promise<ProgramType.ReturnExec> {
		let errors: string[] = [];
		const result: number[] = [];
		const { _: argument, ...options } = Parse(shell.split(' '));
		const lowerCaseShell = shell.toLowerCase();
		const response = (stdout: any, stderr: string[] | string | null) => ({
			stdout,
			stderr,
		});
		const isHelp = () => {
			if (this.#setup.help) {
				const { results } = this.#setup.help.getInformation();
				return options[results.fullName] || options[results.char];
			}
		};
		// core command here
		if (['-v', '--version'].includes(lowerCaseShell)) {
			let version = this.#config.version ? this.#config.version : '1.0.0';
			console.log(version);
			return response(null, null);
		}
		if (!argument.length && isHelp()) {
			return response(this.help(), null);
		}

		for (const command of this.#commands) {
			const splitFromCommand = command.getInformation().name.split(' ');
			let counter = 0;
			for (const index in argument) {
				if (argument[index] === splitFromCommand[index]) {
					counter += 1;
				}
			}
			result.push(counter);
		}
		// check different
		if (result.every((num) => num === 0) && this.#config.stderr) {
			let err = sprintf(message.error.cmdNotFound, shell);
			this.#config.stderr(err);
			return response(null, null);
		}

		const max = Math.max(...new Set(result));
		const index = result.indexOf(max);
		const currentCommand = this.#commands[index];
		const information = {
			info: currentCommand.getInformation(),
			arguments: currentCommand.getArgument(),
			options: currentCommand.getOption(),
		};
		const newArgument: any = {};
		const splitFromCommand = information.info.name.split(' ');
		const potentialArg = argument.filter((arg) => !splitFromCommand.find((split) => split === arg));

		// help
		if (isHelp()) {
			return response(currentCommand.showHelp(), null);
		}

		// check argument
		for (let i = 0; i < information.arguments.length; i++) {
			const current = information.arguments[i];
			const nextCallback = (howMuch: number) => (i += howMuch);
			const stats = current.doValidation(potentialArg, i, nextCallback);
			errors = errors.concat(stats.fail);

			if (stats.data) {
				const { results } = current.getInformation();
				newArgument[results.fullName] = stats.data;
			}
		}

		// find implies options before validation
		for (const current of information.options) {
			const { config } = current.getInformation();
			if (!config.implies) continue;
			for (const implies of Object.keys(config.implies)) {
				options[implies] = config.implies[implies];
			}
		}

		// validation options
		for (const current of information.options) {
			const stats = current.doValidation(options);
			errors = errors.concat(stats.fail);
		}
		// find unknown options
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
				errors.push(sprintf(message.error.optionsUnknown, key));
			}
		}
		// show errors
		if (errors.length) {
			this.#showError(errors);
			return response(null, errors);
		}

		let progress = await currentCommand.execute({
			argument: Object.keys(newArgument).length ? newArgument : null,
			options,
		});
		if (progress && progress.isCore && progress.stderr) {
			return response(null, progress.stderr);
		}
		return response(progress, null);
	}

	#showError(error: any) {
		if (!this.#config.stderr) return;
		this.#config.stderr(error);
	}
}

export default Program;
