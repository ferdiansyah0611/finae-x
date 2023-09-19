// deno-lint-ignore-file
import _ from "lodash";
import { sprintf } from "printf";
import { CommandType, ProgramType } from "@/types.d.ts";
import { stderr } from "@/src/utils/Errors.ts";
import Command from "@/src/utils/Command.ts";
import Parse from "@/src/utils/Parse.ts";
import Help from "@/src/utils/Help.ts";
import highlight from "@/src/helpers/highlight.ts";
import message from "@/src/helpers/message.ts";

class Program implements ProgramType.Type {
	#name: string;
	#description: string;
	#config: ProgramType.Config = { stderr };
	#commands: CommandType.Type[] = [];
	constructor(name: string, description: string, config: ProgramType.Config) {
		this.#name = name;
		this.#description = description;
		this.#config = config;

		if (!config.stderr) this.#config.stderr = stderr;
	}

	command(name: string, description: string, config?: CommandType.Config): CommandType.Type {
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

	help(stdout: boolean = true): string {
		const help = new Help(this.#name, this.#description, this.#config?.version || "1.0.0", {
			commands: this.#commands,
		});
		const result = highlight(help.compile());
		if (stdout) console.log(result);
		return result;
	}

	async exec(shell: string): Promise<ProgramType.ReturnExec> {
		let errors: string[] = [];
		const result: number[] = [];
		const { _: argument, ...options } = Parse(shell.split(" "));
		const lowerCaseShell = shell.toLowerCase();
		const response = (stdout: any, stderr: string[] | string | null) => ({ stdout, stderr });
		// core command here
		if (["-v", "--version"].includes(lowerCaseShell)) {
			let version = this.#config.version ? this.#config.version : "1.0.0";
			console.log(version);
			return response(null, null);
		}
		if (["-h", "--help"].includes(lowerCaseShell)) {
			this.help();
			return response(null, null);
		}

		for (const command of this.#commands) {
			const splitFromCommand = command.getInformation().name.split(" ");
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
		const splitFromCommand = information.info.name.split(" ");
		const potentialArg = argument.filter((arg) => !splitFromCommand.find((split) => split === arg));

		// help
		if (options.help || options.h) {
			currentCommand.showHelp();
			return response(null, null);
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

		// check options
		for (const current of information.options) {
			const stats = current.doValidation(options);
			errors = errors.concat(stats.fail);
		}
		// find unknown options
		for (const key in options) {
			let isValid = false;
			for (const current of information.options) {
				const { results } = current.getInformation();
				if (key === results.alias || key === results.fullName) {
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
		if (progress && progress.isCore && progress.stderr) return response(null, progress.stderr);
		return response(progress, null);
	}

	#showError(error: any) {
		if (!this.#config.stderr) return;
		this.#config.stderr(error);
	}
}

export default Program;