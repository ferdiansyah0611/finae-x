// deno-lint-ignore-file no-explicit-any
import { ProgramType } from '@/types.d.ts';

export namespace TestType {
	type Instance = 'Arguments' | 'Options';
	interface ErrorMessage {
		isRequired(response: ProgramType.ReturnExec, name: string): any;
		isExclude(response: ProgramType.ReturnExec, name: string, arr: any[]): any;
		notInclude(response: ProgramType.ReturnExec, name: string, arr: any[]): any;
		notType(response: ProgramType.ReturnExec, name: string, type: string): any;
	}
}
