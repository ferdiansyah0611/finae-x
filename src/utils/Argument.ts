import { ArgumentType, ValidationType } from '@/types.d.ts';
import validation from '@/src/helpers/validation.ts';
import { sprintf } from 'printf';
import message from '@/src/helpers/message.ts';

export default class Argument implements ArgumentType.Type {
	#synopsis: string;
	#description: string;
	#config: ArgumentType.Config = {
		isVariadic: false,
		type: 'String',
		default: null,
	};
	#results: ArgumentType.Result = {
		fullName: '',
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
	doValidation(
		argument: string[] | number[],
		index: number,
		nextCallback: (howMuch: number) => unknown,
	): ValidationType.Stats {
		const stats: ValidationType.Stats = {
			success: [],
			fail: [],
			data: [],
		};
		const { config, results } = this.getInformation();
		const name = results.fullName;
		// is required, check default value
		if (!argument[index]) {
			if (config.default) argument[index] = config.default;
			else {
				stats.fail.push(
					sprintf(message.error.isRequired, 'Arguments', name),
				);
			}
		}
		// custom validator
		try {
			if (this.#config.validator) {
				stats.data = this.#config.validator(argument[index]);
				return stats;
			}
		} catch (err) {
			stats.fail.push(err.message);
			return stats;
		}
		// validation
		if (config.isVariadic) {
			stats.data = argument
				.slice(index)
				.map((item: string | number, currentIndex: number) =>
					validation.action(
						'Arguments',
						`${name}[${currentIndex}]`,
						item,
						stats,
						config,
					)
				);
			nextCallback(stats.data.length);
		} else {
			stats.data = validation.action(
				'Arguments',
				name,
				argument[index],
				stats,
				config,
			);
		}
		return stats;
	}

	#parseSynopsis(): void {
		const results = this.#results;
		const isRequired = this.#synopsis.match(/<(.+)>/);
		const isOptional = this.#synopsis.match(/\[.+\]/);
		const isVariadic = this.#synopsis.match(/(\[.+\])|(\.\.\.)/);

		if (isRequired) {
			results.fullName = isRequired[0].slice(1, -1);
		} else if (isOptional) {
			results.fullName = isOptional[0].slice(1, -1);
		} else {
			results.fullName = this.#synopsis;
		}

		if (isVariadic) this.variadic();
		results.fullName = results.fullName.replace('...', '');
		this.#results = results;
	}
	validator(callback: ValidationType.CallbackValidator): ArgumentType.Type {
		this.#config.validator = callback;
		return this;
	}
	// deno-lint-ignore no-explicit-any
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
		this.#config.type = 'String';
		this.default(defaults);
		return this;
	}
	number(defaults?: number): ArgumentType.Type {
		this.#config.type = 'Number';
		this.default(defaults);
		return this;
	}
	float(defaults?: number): ArgumentType.Type {
		this.#config.type = 'Float';
		this.default(defaults);
		return this;
	}
	include(collection: string[] | number[]): ArgumentType.Type {
		const { results } = this.getInformation();

		if (!collection.length) {
			throw new Error(
				sprintf(
					message.error.mustHaveOneLength,
					'Options',
					results.fullName,
				),
			);
		}
		this.#config.include = collection;
		return this;
	}
	exclude(collection: string[] | number[]): ArgumentType.Type {
		const { results } = this.getInformation();

		if (!collection.length) {
			throw new Error(
				sprintf(
					message.error.mustHaveOneLength,
					'Options',
					results.fullName,
				),
			);
		}
		this.#config.exclude = collection;
		return this;
	}
}
