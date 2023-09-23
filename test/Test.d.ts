// deno-lint-ignore-file no-explicit-any
import { ProgramType } from '@/types.d.ts';

export namespace TestType {
	type Instance = 'Arguments' | 'Options';
	interface ErrorMessage {
		isRequired(response: ProgramType.ReturnExec, name: string): ErrorMessage;
		isExclude(response: ProgramType.ReturnExec, name: string, arr: any[]): ErrorMessage;
		notInclude(response: ProgramType.ReturnExec, name: string, arr: any[]): ErrorMessage;
		notType(response: ProgramType.ReturnExec, name: string, type: string): ErrorMessage;
	}
}
