// deno-lint-ignore-file no-explicit-any
import { ArgumentType, ValidationType } from "@/types.d.ts";
import validation from "@/src/helpers/validation.ts";
import { sprintf } from "printf";
import message from "@/src/helpers/message.ts";

export default class Argument implements ArgumentType.Type {
	#synopsis: string;
	#description: string;
	#config: ArgumentType.Config = {
		isRequired: false,
		isVariadic: false,
		type: "String",
		collection: [],
		default: null,
	};
	#results: ArgumentType.Result = {
		fullName: "",
	};

	constructor(synopsis: string, description: string) {
		this.#synopsis = synopsis;
		this.#description = description;
		this.#parseSynopsis();
	}
	getInformation(): ArgumentType.Information {
		return {
			synopsis: this.#synopsis,
			description: this.#description,
			config: this.#config,
			results: this.#results,
		};
	}
	doValidation(argument: string[], index: number, nextCallback: (howMuch: number) => any): ValidationType.Stats {
		const stats: ValidationType.Stats = {
			success: [],
			fail: [],
			data: [],
		};
		const { config, results } = this.getInformation();
		const name = results.fullName;
		
		if (!argument[index]) stats.fail.push(sprintf(message.error.isRequired, "Arguments", name));

		if (config.isVariadic) {
			stats.data = argument.slice(index).map((item: any, currentIndex: number) => {
				if (config.type === "String")
					item = validation.validateString("Arguments", `${name}[${currentIndex}]`, item, stats);
				else if (config.type === "Number")
					item = validation.validateNumber("Arguments", `${name}[${currentIndex}]`, item, stats);
				else if (config.type === "Float")
					item = validation.validateFloat("Arguments", `${name}[${currentIndex}]`, item, stats);
				else if (config.type === "Array")
					validation.validateArray("Arguments", `${name}[${currentIndex}]`, item, stats, config);
				return item;
			});
			nextCallback(stats.data.length);
		} else {
			if (config.type === "String")
				stats.data = validation.validateString("Arguments", name, argument[index], stats);
			else if (config.type === "Number")
				stats.data = validation.validateNumber("Arguments", name, argument[index], stats);
			else if (config.type === "Float")
				stats.data = validation.validateFloat("Arguments", name, argument[index], stats);
			else if (config.type === "Array") {
				const isValid = validation.validateArray("Arguments", name, argument[index], stats, config);
				if (isValid) stats.data = argument[index];
			}
		}
		return stats;
	}

	#parseSynopsis(): void {
		const results = this.#results;
		const isRequired = this.#synopsis.match(/<(.+)>/);
		const isOptional = this.#synopsis.match(/\[.+\]/);
		const isVariadic = this.#synopsis.match(/(\[.+\])|(\.\.\.)/);

		if (isRequired) {
			this.#config.isRequired = true;
			results.fullName = isRequired[0].slice(1, -1);
		} else if (isOptional) {
			this.#config.isRequired = false;
			results.fullName = isOptional[0].slice(1, -1);
		} else {
			results.fullName = this.#synopsis;
		}

		if (isVariadic) this.variadic();
		results.fullName = results.fullName.replace("...", "");
		this.#results = results;
	}
	validator(callback: (value: any) => boolean): ArgumentType.Type {
		this.#config.validator = callback;
		return this;
	}
	default(value?: any): ArgumentType.Type {
		if (value === undefined) return this;
		this.#config.default = value;
		return this;
	}

	variadic(): ArgumentType.Type {
		this.#config.isVariadic = true;
		return this;
	}
	string(defaults?: string): ArgumentType.Type {
		this.#config.type = "String";
		this.default(defaults);
		return this;
	}
	number(defaults?: number): ArgumentType.Type {
		this.#config.type = "Number";
		this.default(defaults);
		return this;
	}
	float(defaults?: number): ArgumentType.Type {
		this.#config.type = "Float";
		this.default(defaults);
		return this;
	}
	array(collection: any[]): ArgumentType.Type {
		const { results } = this.getInformation();

		if (!collection.length)
			throw new Error(sprintf("Options '%s' must be have minimum 1 length", results.fullName));
		this.#config.type = "Array";
		this.#config.collection = collection;
		return this;
	}
}