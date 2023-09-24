import { ArgumentType, CommandType, OptionType, ValidationType } from '@/types.d.ts';
import { sprintf } from 'printf';
import validation from '@/src/helpers/validation.ts';
import message from '@/src/helpers/message.ts';
import env from '@/src/helpers/env.ts';

export default class Option implements OptionType.Type {
	#synopsis: string;
	#description: string;
	#command?: CommandType.Type;
	#config: OptionType.Config = {
		isHidden: false,
		isRequired: false,
		isVariadic: false,
		default: null,
		type: 'String',
		env: null
	};
	#results: OptionType.Result = {
		char: '',
		fullName: '',
	};
	constructor(
		synopsis: string,
		description: string,
		command?: CommandType.Type,
	) {
		this.#synopsis = synopsis;
		this.#description = description;
		this.#command = command;
		this.#parseSynopsis();
	}
	getInformation(): OptionType.Information {
		return {
			synopsis: this.#synopsis,
			description: this.#description,
			config: this.#config,
			results: this.#results,
		};
	}
	// deno-lint-ignore no-explicit-any
	doValidation(options: any): ValidationType.Stats {
		const stats: ValidationType.Stats = {
			success: [],
			fail: [],
			data: options,
		};
		const { config, results } = this.getInformation();
		const choice = options[results.fullName] ? results.fullName : results.char || results.fullName;
		const name = results.fullName || results.char;
		// set value from env
		if (config.env) {
			options[choice] = env[config.env];
		}
		// check default value
		if (!options[choice]) {
			if (config.default) options[choice] = config.default;
		}
		// is required
		if (!options[choice] && config.isRequired) {
			stats.fail.push(sprintf(message.error.isRequired, 'Options', name));
		}
		// not variadic and value from parse is array
		if (!config.isVariadic && Array.isArray(options[choice])) {
			options[choice] = options[choice][0];
		}
		// check conflict
		if (config.conflicts && options[choice] && this.#command) {
			const allOptionsOnCommand = this.#command.getOption();
			for (const conflict of config.conflicts) {
				const findConflict = allOptionsOnCommand.find((item) => {
					const { results, synopsis } = item.getInformation();
					if (
						[synopsis, results.fullName, results.char].includes(
							conflict,
						)
					) {
						return true;
					}
					return false;
				});
				if (findConflict) {
					stats.fail.push(
						sprintf(
							message.error.isConflictsOption,
							this.#synopsis,
							findConflict.getInformation().synopsis,
						),
					);
					break;
				}
			}
		}
		// custom validator
		try {
			if (this.#config.validator) {
				options[choice] = this.#config.validator(options[choice]);
				return stats;
			}
		} catch (err) {
			stats.fail.push(err.message);
			return stats;
		}
		if (!Object.keys(options).length) return stats;
		// validation
		if (config.isVariadic) {
			// deno-lint-ignore no-explicit-any
			options[choice] = options[choice].map((item: any, index: number) =>
				validation.action(
					'Options',
					`${name}[${index}]`,
					item,
					stats,
					config,
				)
			);
		}
		if (!config.isVariadic && options[choice] !== undefined) {
			options[choice] = validation.action(
				'Options',
				name,
				options[choice],
				stats,
				config,
			);
		}
		return stats;
	}

	#parseSynopsis() {
		if (!this.#synopsis.startsWith('-')) {
			this.#synopsis = '--' + this.#synopsis;
		}

		const char = this.#synopsis.match(/^-([a-zA-Z]), /);
		const fullName = this.#synopsis.match(/--([a-zA-Z0-9\-]+)/);
		const isRequired = this.#synopsis.match(/<.+>/);
		const isOptional = this.#synopsis.match(/\[.+\]/);
		const isVariadic = this.#synopsis.match(/(\[.+\])|(\.\.\.)/);
		const { results } = this.getInformation();
		if (char && char.length === 2) {
			results.char = char[1];
		}
		if (fullName && fullName.length === 2) {
			results.fullName = fullName[1];
		}
		if (isRequired) {
			this.#config.isRequired = true;
		}
		if (isOptional) {
			this.#config.isRequired = false;
		}

		if (!this.#synopsis.includes('-')) results.fullName = this.#synopsis;
		if (isVariadic) this.variadic();
		results.fullName = results.fullName.replace('...', '');
		this.#results = results;
	}

	hideHelp(): OptionType.Type {
		this.#config.isHidden = true;
		return this;
	}
	required(): OptionType.Type {
		this.#config.isRequired = true;
		return this;
	}
	variadic(): OptionType.Type {
		this.#config.isVariadic = true;
		return this;
	}
	conflicts(...name: string[]): OptionType.Type {
		this.#config.conflicts = name;
		return this;
	}
	// deno-lint-ignore no-explicit-any
	implies(data: any): OptionType.Type {
		this.#config.implies = data;
		return this;
	}
	validator(callback: ValidationType.CallbackValidator): OptionType.Type {
		this.#config.validator = callback;
		return this;
	}
	// deno-lint-ignore no-explicit-any
	default(value?: any): OptionType.Type {
		if (value === undefined) return this;
		this.#config.default = value;
		return this;
	}

	string(defaults?: string): OptionType.Type {
		this.#config.type = 'String';
		this.default(defaults);
		return this;
	}
	number(defaults?: number): OptionType.Type {
		this.#config.type = 'Number';
		this.default(defaults);
		return this;
	}
	float(defaults?: number): OptionType.Type {
		this.#config.type = 'Float';
		this.default(defaults);
		return this;
	}
	boolean(defaults?: boolean|undefined): OptionType.Type {
	    this.#config.type = 'Boolean';
		this.default(defaults);
		return this;
	}
	// deno-lint-ignore no-explicit-any
	include(collection: any[]): OptionType.Type {
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
	// deno-lint-ignore no-explicit-any
	exclude(collection: any[]): OptionType.Type {
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
	env(name: string): OptionType.Type {
		if (!env[name]) throw Error(sprintf("environment '%s' is not set", name));
	    this.#config.env = name;
	    return this;
	}
}
