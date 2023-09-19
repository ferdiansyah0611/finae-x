// deno-lint-ignore-file

// UTILS

export namespace ProgramType {
	interface Type {
		command(name: string, description: string, config?: CommandType.Config): CommandType.Type;
		getAllCommands(): CommandType.Type[];
		getInformation(): ProgramType.Information;
		help(stdout: boolean): string;
		exec(shell: string): Promise<ReturnExec>;
	}
	type Information = {
		name: string;
		description: string;
		config: ProgramType.Config;
	}
	type Config = {
		version?: string;
		stderr?: (error: any[] | any) => any;
	}
	type ReturnExec = {
		stdout: any;
		stderr: string[]|string|null;
	}
}

export namespace CommandType {
	interface Type {
		command(name: string, description: string, config?: CommandType.Config): CommandType.Type;
		argument(name: string, description: string, callback?: (cls: ArgumentType.Type) => any): CommandType.Type;
		option(synopsist: string, description: string, callback?: (cls: OptionType.Type) => any): CommandType.Type;
		action(callback: (options?: any, argument?: any) => void): CommandType.Type;
		execute(data?: any): Promise<any>;
		getInformation(): CommandType.Information;
		getArgument(): ArgumentType.Type[];
		getOption(): OptionType.Type[];
		getNested(onlyKey?: boolean): CommandType.Type[];
		showHelp(stdout?: boolean): string;
	}
	type Information = {
		program: ProgramType.Type;
		name: string;
		description: string;
		config: CommandType.Config;
	}
	type Config = {
		help?: string;
	}
}

export namespace ArgumentType {
	interface Type {
		getInformation(): ArgumentType.Information;
		validator(callback: (value: any) => boolean): ArgumentType.Type;
		default(value?: any): ArgumentType.Type;
		doValidation(argument: string[], index: number, nextCallback: (howMuch: number) => any): ValidationType.Stats;
		string(defaults?: string): ArgumentType.Type;
		number(defaults?: number): ArgumentType.Type;
		float(defaults?: number): ArgumentType.Type;
		array(collection: any[]): ArgumentType.Type;
		variadic(): ArgumentType.Type;
	}
	type Config = {
		isRequired: boolean;
		isVariadic: boolean;
		type: any;
		validator?: (value: any) => boolean;
		collection: any[];
		default: string|null;
	}
	type Result = {
		fullName: string;
	}
	type Information = {
		synopsis: string;
		description: string;
		config: ArgumentType.Config;
		results: ArgumentType.Result;
	}
}

export namespace OptionType {
	interface Type {
		getInformation(): OptionType.Information;
		hide(): OptionType.Type;
		required(): OptionType.Type;
		variadic(): OptionType.Type;
		validator(callback: () => boolean): OptionType.Type;
		default(value?: any): OptionType.Type;
		doValidation(options: any): ValidationType.Stats;
		string(defaults?: string): OptionType.Type;
		number(defaults?: number): OptionType.Type;
		float(defaults?: number): OptionType.Type;
		array(collection: any[]): OptionType.Type;
	}
	type Config = {
		isHidden: boolean;
		isRequired: boolean;
		isVariadic: boolean;
		default: any;
		type: any;
		collection: any[];
		validator?: (value: any) => boolean;
	}
	type Result = {
		alias: string;
		fullName: string;
	}
	type Information = {
		synopsis: string;
		description: string;
		config: OptionType.Config;
		results: OptionType.Result;
	}
}

export namespace HelpType {
	interface Type {
		compile(): string;
	}
	type Collection = {
		[key: string]: any;
		commands?: CommandType.Type[];
		options?: OptionType.Type[];
		arguments?: ArgumentType.Type[];
	};
}

// HELPER

export namespace ValidationType {
	interface Type {
		Number(value: any): ValidationType.ReturnDataType;
		Float(value: any): ValidationType.ReturnDataType;
		String(value: any): ValidationType.ReturnDataType;
		handler(
			choice: ValidationType.choice,
			type: "Number" | "Float" | "String",
			fullName: string,
			value: any,
			stats: ValidationType.Stats,
		): ValidationType.ReturnHandler;
		validateNumber(choice: ValidationType.choice, fullName: string, value: any, stats: ValidationType.Stats): (number|string);
		validateFloat(choice: ValidationType.choice, fullName: string, value: any, stats: ValidationType.Stats): (number|string);
		validateString(choice: ValidationType.choice, fullName: string, value: any, stats: ValidationType.Stats): (number|string);
		validateArray(
			choice: ValidationType.choice,
			fullName: string,
			value: any,
			stats: ValidationType.Stats,
			config: ArgumentType.Config|OptionType.Config,
		): boolean;
		validateRequired(
			choice: ValidationType.choice,
			property: string[],
			stats: ValidationType.Stats,
			config: ArgumentType.Config|OptionType.Config,
			options: any,
		): boolean;
	}
	type choice = "Arguments" | "Options" | string;
	type ReturnDataType = {
		value: any;
		is: boolean;
	}
	type ReturnHandler = {
		value: any;
		message: string;
	}
	type Stats = {
		success: string[];
		fail: string[];
		data?: any[]|any;
	}
}