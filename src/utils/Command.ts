// deno-lint-ignore-file
import { ArgumentType, CommandType, OptionType, ProgramType } from '@/types.d.ts';
import { sprintf } from 'printf';
import Option from '@/src/utils/Option.ts';
import Help from '@/src/utils/Help.ts';
import highlight from '@/src/helpers/highlight.ts';
import Argument from '@/src/utils/Argument.ts';
import message from '@/src/helpers/message.ts';

class Command implements CommandType.Type {
	#program!: ProgramType.Type;
	#action: (CommandType.ActionCallback) | undefined;
	#name: string;
	#description: string;
	#config: CommandType.Config = {};

	#arguments: ArgumentType.Type[] = [];
	#options: OptionType.Type[] = [];
	#nested: any[] = [];

	constructor(
		program: ProgramType.Type,
		name: string,
		description: string,
		config?: CommandType.Config,
	) {
		this.#program = program;
		this.#name = name;
		this.#description = description;
		if (config) this.#config = config;
	}
	getInformation(): CommandType.Information {
		return {
			program: this.#program,
			name: this.#name,
			description: this.#description,
			config: this.#config,
		};
	}
	getArgument(): ArgumentType.Type[] {
		return this.#arguments;
	}
	getOption(): OptionType.Type[] {
		return this.#options;
	}
	getNested(onlyKey?: boolean): CommandType.Type[] {
		if (!this.#nested.length) return [];
		if (onlyKey) return this.#nested;
		return this.#program.getAllCommands().filter((_, index) => this.#nested.includes(index));
	}

	command(
		name: string,
		description: string,
		config?: CommandType.Config,
	): CommandType.Type {
		const result = this.#program.command(
			this.#name + ' ' + name,
			description,
			config,
		);
		this.#nested.push(this.#program.getAllCommands().length - 1);
		return result;
	}

	argument(
		synopsis: string,
		description: string,
		callback?: (cls: ArgumentType.Type) => any,
	): CommandType.Type {
		const cls = new Argument(synopsis, description);
		if (callback) callback(cls);
		this.#arguments.push(cls);
		return this;
	}

	option(
		synopsis: string,
		description: string,
		callback?: (cls: OptionType.Type) => any,
	): CommandType.Type {
		const cls = new Option(synopsis, description, this);
		if (callback) callback(cls);
		this.#options.push(cls);

		return this;
	}

	action(callback: CommandType.ActionCallback): CommandType.Type {
		this.#action = callback;
		return this;
	}

	async execute(data?: any): Promise<any> {
		if (this.#action) {
			if (data.argument && Object.keys(data.argument) && data.options) {
				return await this.#action(data.argument, data.options);
			} else if (data.argument && Object.keys(data.argument)) {
				return await this.#action(data.argument);
			} else if (data.options) return await this.#action(data.options);
			else await this.#action();
		} else {
			const { stderr } = this.#program.getInformation().config;
			const err = sprintf(message.error.actionNotFound, this.#name);
			if (stderr) stderr(err);
			return { stderr: err, isCore: true };
		}
	}

	showHelp(stdout: boolean = true): string {
		const infoProgram = this.#program.getInformation();
		const help = new Help(
			this.#name,
			this.#description,
			infoProgram.config?.version || '1.0.0',
			{
				arguments: this.#arguments,
				options: this.#options,
				commands: this.getNested(),
			},
			this.#program,
			true,
		);
		const result = highlight(help.compile());
		if (stdout) console.log(result);
		return result;
	}
}

export default Command;
