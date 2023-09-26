import { ProgramType } from '@/types.d.ts';
import { ErrorArgument } from '@/test/Test.ts';

const sampleArgumentError = [
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, 'name');
	},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, ['name', 'password']);
	},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, ['one', 'two', 'three', 'fourth', 'five']);
	},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, 'data');
	},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, 'numeric').notType(response, 'numeric', 'Number');
	},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, 'numeric').notType(response, 'numeric', 'Float');
	},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, 'id').notType(response, 'id', 'Number');
	},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, 'id').notType(response, 'id', 'Number');
	},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, 'name');
	},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, 'name');
	},
	(_response: ProgramType.ReturnExec) => {},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, 'numeric');
	},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, 'numeric');
	},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, 'data');
	},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, 'format');
	},
	(response: ProgramType.ReturnExec) => {
		ErrorArgument.isRequired(response, 'format');
	},
];

export default sampleArgumentError;
