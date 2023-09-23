// deno-lint-ignore-file

export namespace ProgramType {
	/**
	 * Represents a program type.
	 */
	interface Type {
		/**
		 * Creates a new command.
		 * @param name - The name of the command.
		 * @param description - The description of the command.
		 * @param config - Optional configuration for the command.
		 * @returns The created command.
		 */
		command(name: string, description: string, config?: CommandType.Config): CommandType.Type;
		/**
		 * Retrieves all commands defined in the program.
		 * @returns An array of all commands.
		 */
		getAllCommands(): CommandType.Type[];
		/**
		 * Retrieves information about the program.
		 * @returns Information about the program.
		 */
		getInformation(): ProgramType.Information;
		/**
		 * Retrieves information about the global setup program.
		 * @returns Data global program.
		 */
		getSetup(): Setup;
		/**
		 * Generates the help message for the program.
		 * @param stdout - Indicates whether to output the help message to stdout.
		 * @returns The generated help message.
		 */
		showHelp(stdout?: boolean): string;
		/**
		 * Executes a shell command.
		 * @param shell - The shell command to execute.
		 * @returns The result of the shell command execution.
		 */
		exec(shell: string[] | string): Promise<ReturnExec>;
		/**
		 * change command help, pass false to disable help
		 */
		helpOption(synopsis?: string | boolean, description?: string): Type;
		/**
		 * add options globally
		 */
		addOption(synopsis: string, description: string, callback?: (cls: OptionType.Type) => OptionType.Type): Type;
		/**
		 * add hook event
		 */
		hook(type: HookType, callback: HookCallback): Type;
		/**
		 * parse args
		 */
		parse(shell: string[] | string): ParseResult;
		/**
		 * append message errors to the program
		 */
		error(message: string[] | string): Type;
		/**
		 * customize your usage description
		 */
		usage(name: string): Type;
		/**
		 * create custom sections help
		 * @param position - choice position text
		 * @param name - title of section
		 * @param key - set command name to `key` to run specified command
		 * @param data - text of section `[["row 1", "description"]]`
		 */
		makeSectionHelp(position: HelpType.Position, name: string, key: string | null, data: string[][]): Type;
	}
	/**
	 * Represents return parse
	 */
	type ParseResult = {
		argument: string[];
		options: {
			[key: string]: string | string[] | boolean;
		};
	};
	/**
	 * Represents information about a program.
	 */
	type Information = {
		name: string;
		description: string;
		config: ProgramType.Config;
	};
	/**
	 * Represents configuration options for a program.
	 */
	type Config = {
		version?: string;
		stderr?: (error: any[] | any) => any;
		suggestAfterError?: boolean;
	};
	/**
	 * Represents the result of executing a shell command.
	 */
	type ReturnExec = {
		stdout: any;
		stderr: string[] | string | null;
	};
	/**
	 * Represents the global setup for a program.
	 */
	type Setup = {
		options: OptionType.Type[];
		help: OptionType.Type | null;
		errors: string[];
		usage: {
			name: string;
		};
		hook?: {
			[key: string]: HookCallback[];
			preAction: HookCallback[];
			postAction: HookCallback[];
			preError: HookCallback[];
			postError: HookCallback[];
		};
		sectionHelp?: {
			[key: string]: HelpType.ItemSection[];
		};
	};
	/**
	 * Represents the type hook event
	 */
	type HookType = 'preAction' | 'postAction' | 'preError' | 'postError';
	/**
	 * Represents the callback hook event
	 */
	type HookCallback = (command: CommandType.Type | null) => void;
}

export namespace CommandType {
	/**
	 * Represents a command type.
	 */
	interface Type {
		/**
		 * Creates a new command.
		 * @param name - The name of the command.
		 * @param description - The description of the command.
		 * @param config - Optional configuration for the command.
		 * @returns The created command.
		 */
		command(name: string, description: string, config?: CommandType.Config): CommandType.Type;
		/**
		 * Adds an argument to the command.
		 * @param name - The name of the argument.
		 * @param description - The description of the argument.
		 * @param callback - Optional callback function for additional argument configuration.
		 * @returns The updated command.
		 */
		argument(
			name: string,
			description: string,
			callback?: (cls: ArgumentType.Type) => ArgumentType.Type,
		): CommandType.Type;
		/**
		 * Adds an option to the command.
		 * @param synopsis - The synopsis of the option.
		 * @param description - The description of the option.
		 * @param callback - Optional callback function for additional option configuration.
		 * @returns The updated command.
		 */
		option(
			synopsis: string,
			description: string,
			callback?: (cls: OptionType.Type) => OptionType.Type,
		): CommandType.Type;
		/**
		 * Sets the action to be executed when the command is invoked.
		 * @param callback - The callback function to be executed.
		 * @returns The updated command.
		 */
		action(callback: ActionCallback): CommandType.Type;
		/**
		 * Executes the command.
		 * @param data - Optional data to be passed to the command execution.
		 * @returns The result of the command execution.
		 */
		execute(data?: any): Promise<any>;
		/**
		 * Retrieves information about the command.
		 * @returns Information about the command.
		 */
		getInformation(): CommandType.Information;
		/**
		 * Retrieves the arguments defined in the command.
		 * @returns An array of arguments.
		 */
		getArgument(): ArgumentType.Type[];
		/**
		 * Retrieves the options defined in the command.
		 * @returns An array of options.
		 */
		getOption(): OptionType.Type[];
		/**
		 * Retrieves the nested commands defined in the command.
		 * @returns An array of nested commands.
		 */
		getNested(): CommandType.Type[] | number[];
		/**
		 * Retrieves the key nested commands defined in the command.
		 * @returns An array of number nested commands.
		 */
		getNestedKey(): number[];
		/**
		 * Generates the help message for the command.
		 * @param stdout - Indicates whether to output the help message to stdout.
		 * @returns The generated help message.
		 */
		showHelp(stdout?: boolean): string;
		/**
		 * Allow unknown options on the current command instance.
		 */
		allowUnknownOption(isActive?: boolean): Type;
		/**
		 * Set unknown options to the current command instance
		 */
		setUnknownOption(data: any): Type;
		/**
		 * Get unknown options on the current command instance
		 */
		getUnknownOption(): any;
	}
	/**
	 * Represents information about a command.
	 */
	type Information = {
		program: ProgramType.Type;
		name: string;
		description: string;
		config: CommandType.Config;
	};
	/**
	 * Represents configuration options for a command.
	 */
	type Config = {
		help?: string;
		isAllowUnknown?: boolean;
	};
	/**
	 * Represents a callback function for command execution.
	 */
	type ActionCallback = (argument?: any, options?: any, cmd?: Type) => any;
	/**
	 * Return type for execution command
	 */
	type ReturnExecution = { [key: string]: string | boolean } | string | undefined;
}

export namespace ArgumentType {
	/**
	 * Represents an argument type.
	 */
	interface Type {
		/**
		 * Retrieves information about the argument.
		 * @returns Information about the argument.
		 */
		getInformation(): ArgumentType.Information;
		/**
		 * Sets a validator function for the argument.
		 * @param callback - The validator callback function.
		 * @returns The updated argument.
		 */
		validator(callback: ValidationType.CallbackValidator): ArgumentType.Type;
		/**
		 * Sets a default value for the argument.
		 * @param value - The default value.
		 * @returns The updated argument.
		 */
		default(value?: any): ArgumentType.Type;
		/**
		 * Performs validation on the argument.
		 * @param argument - The argument value.
		 * @param index - The index of the argument.
		 * @param nextCallback - The callback function to continue the validation process.
		 * @returns Validation statistics.
		 */
		doValidation(
			argument: string[] | number[],
			index: number,
			nextCallback: (howMuch: number) => any,
		): ValidationType.Stats;
		/**
		 * Sets the argument type as string.
		 * @param defaults - Optional default value for the argument.
		 * @returns The updated argument.
		 */
		string(defaults?: string): ArgumentType.Type;
		/**
		 * Sets the argument type as number.
		 * @param defaults - Optional default value for the argument.
		 * @returns The updated argument.
		 */
		number(defaults?: number): ArgumentType.Type;
		/**
		 * Sets the argument type as float.
		 * @param defaults - Optional default value for the argument.
		 * @returns The updated argument.
		 */
		float(defaults?: number): ArgumentType.Type;
		/**
		 * Sets a collection of values that the argument can include.
		 * @param collection - The collection of values.
		 * @returns The updated argument.
		 */
		include(collection: any[]): ArgumentType.Type;
		/**
		 * Sets a collection of values that the argument should exclude.
		 * @param collection - The collection of values.
		 * @returns The updated argument.
		 */
		exclude(collection: any[]): ArgumentType.Type;
		/**
		 * Specifies that the argument is variadic.
		 * @returns The updated argument.
		 */
		variadic(): ArgumentType.Type;
	}
	/**
	 * Represents configuration options for an argument.
	 */
	type Config = {
		isVariadic: boolean;
		type: any;
		default: string | null;
		validator?: ValidationType.CallbackValidator;
		include?: any[];
		exclude?: any[];
	};
	/**
	 * Represents the result of an argument.
	 */
	type Result = {
		fullName: string;
	};
	/**
	 * Represents information about an argument.
	 */
	type Information = {
		synopsis: string;
		description: string;
		config: ArgumentType.Config;
		results: ArgumentType.Result;
	};
}

export namespace OptionType {
	/**
	 * Represents an option type.
	 */
	interface Type {
		/**
		 * Retrieves information about the option.
		 * @returns Information about the option.
		 */
		getInformation(): OptionType.Information;
		/**
		 * Hides the option from the help message.
		 * @returns The option instances.
		 */
		hideHelp(): OptionType.Type;
		/**
		 * Marks the option as required.
		 * @returns The option instances.
		 */
		required(): OptionType.Type;
		/**
		 * Specifies that the option is variadic.
		 * @returns The option instances.
		 */
		variadic(): OptionType.Type;
		/**
		 * Sets a validator function for the option.
		 * @param callback - The validator callback function.
		 * @returns The option instances.
		 */
		validator(callback: ValidationType.CallbackValidator): OptionType.Type;
		/**
		 * Sets a default value for the option.
		 * @param value - The default value.
		 * @returns The option instances.
		 */
		default(value?: any): OptionType.Type;
		/**
		 * Performs validation on the option.
		 * @param options - The options object.
		 * @returns Validation statistics.
		 */
		doValidation(options: any): ValidationType.Stats;
		/**
		 * Sets the option type as string.
		 * @param defaults - Optional default value for the option.
		 * @returns The option instances.
		 */
		string(defaults?: string): OptionType.Type;
		/**
		 * Sets the option type as number.
		 * @param defaults - Optional default value for the option.
		 * @returns The option instances.
		 */
		number(defaults?: number): OptionType.Type;
		/**
		 * Sets the option type as float.
		 * @param defaults - Optional default value for the option.
		 * @returns The option instances.
		 */
		float(defaults?: number): OptionType.Type;
		/**
		 * Specifies that the option should include values from a collection.
		 * @param collection - The collection of values to include.
		 * @returns The option instances.
		 */
		include(collection: any[]): OptionType.Type;
		/**
		 * Specifies that the option should exclude values from a collection.
		 * @param collection - The collection of values to exclude.
		 * @returns The option instances.
		 */
		exclude(collection: any[]): OptionType.Type;
		/**
		 * Specifies that the option conflicts with another option.
		 * @param name - The name of the conflicting option.
		 * @returns The option instances.
		 */
		conflicts(...name: string[]): OptionType.Type;
		/**
		 * Specifies the implied option value when this option is set and the implied option has no value.
		 * @param data - The data of the implies option.
		 * @returns The option instances.
		 */
		implies(data: any): OptionType.Type;
	}
	/**
	 * Represents the configuration of an option, including properties like isHidden, isRequired, isVariadic, default, type, and validator
	 */
	type Config = {
		isHidden: boolean;
		isRequired: boolean;
		isVariadic: boolean;
		default: any;
		type: any;
		validator?: ValidationType.CallbackValidator;
		include?: any[];
		exclude?: any[];
		conflicts?: string[];
		implies?: any;
	};
	/**
	 * Represents the result of an option, including properties like char and fullName
	 */
	type Result = {
		char: string;
		fullName: string;
	};
	/**
	 * Represents information about an option, including properties like synopsis, description, config, and results
	 */
	type Information = {
		synopsis: string;
		description: string;
		config: OptionType.Config;
		results: OptionType.Result;
	};
}

export namespace HelpType {
	type Position = 'afterArgument' | 'afterCommand' | 'afterOption' | 'firstLine' | 'lastLine';
	/**
	 * Represents a type of help.
	 */
	interface Type {
		compile(): string;
	}
	/**
	 * Represents a collection of help types.
	 */
	type Collection = {
		[key: string]: any;
		commands?: CommandType.Type[];
		options?: OptionType.Type[];
		arguments?: ArgumentType.Type[];
		afterArgument?: ItemSectionData[];
		afterCommand?: ItemSectionData[];
		afterOption?: ItemSectionData[];
		firstLine?: ItemSectionData[];
		lastLine?: ItemSectionData[];
	};
	/**
	 * List of synopsis/name length
	 */
	type CountCollection = {
		[key: string]: number[];
		arguments: number[];
		commands: number[];
		options: number[];
		afterArgument: number[];
		afterCommand: number[];
		afterOption: number[];
		firstLine: number[];
		lastLine: number[];
	};
	/**
	 * Represents a custom section help.
	 */
	type ItemSection = {
		name: string;
		key: string | null;
		data: ItemSectionData[];
	};
	/**
	 * Represents a item for custom section help.
	 */
	type ItemSectionData = { title: string; description: string };
}

export namespace ValidationType {
	/**
	 * Represents a validation type.
	 */
	interface Type {
		/**
		 * check & parse `value` to number
		 */
		Number(value: any): ValidationType.ReturnDataType;
		/**
		 * check & parse `value` to float
		 */
		Float(value: any): ValidationType.ReturnDataType;
		/**
		 * check & parse `value` to string
		 */
		String(value: any): ValidationType.ReturnDataType;
		/**
		 * validation datatype with `ValidationType.Type`, like `Number(value: any)` and more
		 */
		handler(
			choice: ValidationType.choice,
			type: 'Number' | 'Float' | 'String',
			fullName: string,
			value: any,
			stats: ValidationType.Stats,
		): ValidationType.ReturnHandler;
		/**
		 * shorthand to validate number
		 */
		validateNumber(
			choice: ValidationType.choice,
			fullName: string,
			value: any,
			stats: ValidationType.Stats,
		): number | string;
		/**
		 * shorthand to validate number
		 */
		validateFloat(
			choice: ValidationType.choice,
			fullName: string,
			value: any,
			stats: ValidationType.Stats,
		): number | string;
		/**
		 * shorthand to validate string
		 */
		validateString(
			choice: ValidationType.choice,
			fullName: string,
			value: any,
			stats: ValidationType.Stats,
		): number | string;
		/**
		 * shorthand to validate is required
		 */
		validateRequired(
			choice: ValidationType.choice,
			property: string[],
			stats: ValidationType.Stats,
			config: OptionType.Config,
			options: any,
		): boolean;
		/**
		 * shorthand to validate include
		 */
		validateInclude(
			choice: ValidationType.choice,
			fullName: string,
			value: any,
			stats: ValidationType.Stats,
			config: ArgumentType.Config | OptionType.Config,
		): boolean;
		/**
		 * shorthand to validate exclude
		 */
		validateExclude(
			choice: ValidationType.choice,
			fullName: string,
			value: any,
			stats: ValidationType.Stats,
			config: ArgumentType.Config | OptionType.Config,
		): boolean;
		/**
		 * do validate all type
		 */
		action(
			instance: string,
			key: string,
			value: any,
			stats: ValidationType.Stats,
			config: ArgumentType.Config | OptionType.Config,
		): any;
	}
	/**
	 * Represents a choice for validation.
	 */
	type choice = 'Arguments' | 'Options' | string;
	/**
	 * Represents the return type of a data validation.
	 */
	type ReturnDataType = {
		value: any;
		is: boolean;
	};
	/**
	 * Represents the return type of a validation handler.
	 */
	type ReturnHandler = {
		value: any;
		message: string;
	};
	/**
	 * Represents the statistics for validation.
	 */
	type Stats = {
		success: string[];
		fail: string[];
		data?: any[] | any;
	};
	/**
	 * Represents a callback validator.
	 */
	type CallbackValidator = (value: string | number) => any;
}
