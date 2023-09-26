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
	#aliasName?: string[];

	#arguments: ArgumentType.Type[] = [];
	#options: OptionType.Type[] = [];
	#nested: number[] = [];
	// deno-lint-ignore no-explicit-any
	#unknownOption: any;
	// deno-lint-ignore no-explicit-any
	arg: any[] = [];
	// deno-lint-ignore no-explicit-any
	opt: any = {};

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
	getNested(): CommandType.Type[] {
		if (!this.#nested.length) return [];
		return this.#program.getAllCommands().filter((_, index) => this.#nested.includes(index));
	}
	getNestedKey(): number[] {
		return this.#nested;
	}
	getAlias(): string[] {
		return this.#aliasName || [];
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
		callback?: (cls: ArgumentType.Type) => ArgumentType.Type,
	): CommandType.Type {
		const cls = new Argument(synopsis, description);
		if (callback) callback(cls);
		this.#arguments.push(cls);
		return this;
	}

	option(
		synopsis: string,
		description: string,
		callback?: (cls: OptionType.Type) => OptionType.Type,
	): CommandType.Type {
		const cls = new Option(synopsis, description, this);
		if (callback) callback(cls);
		this.#options.push(cls);

		return this;
	}

	alias(...name: string[]): CommandType.Type {
		this.#aliasName = name;
		return this;
	}

	action(callback: CommandType.ActionCallback): CommandType.Type {
		this.#action = callback.bind(this);
		return this;
	}

	// deno-lint-ignore no-explicit-any
	async execute(data?: any): Promise<any> {
		if (this.#action) {
			if (!data) data = {};
			this.arg = data.argument || [];
			this.opt = data.options || {};
			if (data.argument && Object.keys(data.argument) && data.options) {
				return await this.#action(data.argument, data.options, this);
			} else if (data.argument && Object.keys(data.argument)) {
				return await this.#action(data.argument, this);
			} else if (data.options) return await this.#action(data.options, this);
			else return await this.#action();
		} else {
			const err = sprintf(message.error.actionNotFound, this.#name);
			this.#program.error(err);
			return { isFailed: true };
		}
	}

	showHelp(stdout?: boolean): string {
		if (stdout === undefined) stdout = true;
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
			this,
			true,
		);
		const result = highlight(help.compile());
		if (stdout) console.log(result);
		return result;
	}

	// deno-lint-ignore no-inferrable-types
	allowUnknownOption(isActive: boolean = true): CommandType.Type {
		this.#config.isAllowUnknown = isActive;
		return this;
	}
	// deno-lint-ignore no-explicit-any
	setUnknownOption(data: any): CommandType.Type {
		this.#unknownOption = data;
		return this;
	}
	// deno-lint-ignore no-explicit-any
	getUnknownOption(): any {
		return this.#unknownOption;
	}
}

export default Command;
