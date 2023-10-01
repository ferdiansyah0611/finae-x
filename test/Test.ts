// deno-lint-ignore-file no-explicit-any
import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { sprintf } from '../src/package/printf.ts';
import { ProgramType } from '../types.d.ts';
import { TestType } from './Test.d.ts';
import message from '../src/helpers/message.ts';

class FactoryMessage implements TestType.ErrorMessage {
	instance: TestType.Instance;
	constructor(instance: TestType.Instance) {
		this.instance = instance;
	}
	isRequired(response: ProgramType.ReturnExec, name: string[] | string): TestType.ErrorMessage {
		if (Array.isArray(name)) {
			for (const value of name) {
				this.isRequired(response, value);
			}
		} else {
			assertEquals(
				response.stderr?.includes(
					sprintf(message.error.isRequired, this.instance, name),
				),
				true,
			);
		}
		return this;
	}
	isExclude(response: ProgramType.ReturnExec, name: string, arr: any[]): TestType.ErrorMessage {
		assertEquals(
			response.stderr?.includes(
				sprintf(
					message.error.isExlude,
					this.instance,
					name,
					arr.join(', '),
				),
			),
			true,
		);
		return this;
	}
	notInclude(response: ProgramType.ReturnExec, name: string, arr: any[]): TestType.ErrorMessage {
		assertEquals(
			response.stderr?.includes(
				sprintf(
					message.error.isNotIn,
					this.instance,
					name,
					arr.join(', '),
				),
			),
			true,
		);
		return this;
	}
	notType(response: ProgramType.ReturnExec, name: string, type: string): TestType.ErrorMessage {
		assertEquals(
			response.stderr?.includes(
				sprintf(message.error.isNotType, this.instance, name, type),
			),
			true,
		);
		return this;
	}
}

export const ErrorArgument = new FactoryMessage('Arguments');
export const ErrorOption = new FactoryMessage('Options');
