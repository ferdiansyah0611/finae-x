// deno-lint-ignore-file no-explicit-any
import { ArgumentType, OptionType, ValidationType } from '@/types.d.ts';
import { sprintf } from 'printf';
import message from '@/src/helpers/message.ts';

const validation: ValidationType.Type = {
	Number(value: any): ValidationType.ReturnDataType {
		value = parseInt(value);
		return { value, is: Number.isInteger(value) };
	},
	Float(value: any): ValidationType.ReturnDataType {
		value = parseFloat(value);
		return {
			value,
			is: !Number.isInteger(value) && Number.isFinite(value),
		};
	},
	String(value: any): ValidationType.ReturnDataType {
		const pattern = /^[a-zA-Z0-9]+/i;
		return { value, is: pattern.test(value) };
	},
	Boolean(value: any): ValidationType.ReturnDataType {
		value = Boolean(value);
		return { value, is: value };
	},
	handler(
		choice: ValidationType.choice,
		type: 'Number' | 'Float' | 'String',
		fullName: string,
		value: any,
		stats: ValidationType.Stats,
	): ValidationType.ReturnHandler {
		const results = this[type](value);
		let fail = '';
		if (!results.is) {
			fail = sprintf(message.error.isNotType, choice, fullName, type);
		} else {
			value = results.value;
		}

		if (fail) stats.fail.push(fail);
		return { value, message: fail };
	},
	validateNumber(
		choice: ValidationType.choice,
		fullName: string,
		value: any,
		stats: ValidationType.Stats,
	): number | string {
		const results = this.handler(choice, 'Number', fullName, value, stats);
		return results.value;
	},
	validateFloat(
		choice: ValidationType.choice,
		fullName: string,
		value: any,
		stats: ValidationType.Stats,
	): number | string {
		const results = this.handler(choice, 'Float', fullName, value, stats);
		return results.value;
	},
	validateBoolean(
		choice: ValidationType.choice,
		fullName: string,
		value: any,
		stats: ValidationType.Stats,
	): number | string {
		const results = this.handler(choice, 'Boolean', fullName, value, stats);
		return results.value;
	},
	validateString(
		choice: ValidationType.choice,
		fullName: string,
		value: any,
		stats: ValidationType.Stats,
	): number | string {
		const results = this.handler(choice, 'String', fullName, value, stats);
		return results.value;
	},
	validateRequired(
		choice: ValidationType.choice,
		property: string[],
		stats: ValidationType.Stats,
		config: OptionType.Config,
		options: any,
	): boolean {
		let isError = 0;
		if (config.isRequired) {
			for (const prop of property) {
				if (!options[prop]) {
					isError += 1;
				}
			}
			if (isError === property.length) {
				stats.fail.push(
					sprintf(message.error.isRequired, choice, property[0]),
				);
			}
		}
		return isError === 0;
	},
	validateInclude(
		choice: ValidationType.choice,
		fullName: string,
		value: any,
		stats: ValidationType.Stats,
		config: ArgumentType.Config | OptionType.Config,
	): boolean {
		if (!config.include) return false;
		const result = config.include.indexOf(value);
		if (result !== -1) return false;
		stats.fail.push(
			sprintf(
				message.error.isNotIn,
				choice,
				fullName,
				config.include.join(', '),
			),
		);
		return false;
	},
	validateExclude(
		choice: ValidationType.choice,
		fullName: string,
		value: any,
		stats: ValidationType.Stats,
		config: ArgumentType.Config | OptionType.Config,
	): boolean {
		if (!config.exclude) return false;
		const result = config.exclude.indexOf(value);
		if (result === -1) return false;
		stats.fail.push(
			sprintf(
				message.error.isExlude,
				choice,
				fullName,
				config.exclude.join(', '),
			),
		);
		return false;
	},
	action(
		instance: string,
		key: string,
		value: any,
		stats: ValidationType.Stats,
		config: ArgumentType.Config | OptionType.Config,
	): any {
		if (config.type === 'String') {
			value = this.validateString(instance, key, value, stats);
		} else if (config.type === 'Number') {
			value = this.validateNumber(instance, key, value, stats);
		} else if (config.type === 'Float') {
			value = this.validateFloat(instance, key, value, stats);
		} else if (config.type === 'Boolean') {
			value = this.validateBoolean(instance, key, value, stats);
		}
		// include/exclude
		if (config.include) {
			this.validateInclude(instance, key, value, stats, config);
		}
		if (config.exclude) {
			this.validateExclude(instance, key, value, stats, config);
		}
		return value;
	},
};

export default validation;
