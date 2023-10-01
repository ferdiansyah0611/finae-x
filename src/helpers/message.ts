import { MessageType } from '../../types.d.ts';

const message = {
	error: {
		isRequired: '%s \'%s\' is required',
		isNotType: '%s \'%s\' is not a %s',
		isNotIn: '%s \'%s\' is not in: %s',
		isExlude: '%s \'%s\' is in the exclude list: %s',
		cmdNotFound: 'Command \'%s\' not found.',
		optionsUnknown: 'Unknown options \'%s\'',
		actionNotFound: 'Action not defined for command \'%s\'',
		mustHaveOneLength: '%s \'%s\' must be have minimum 1 length',
		isConflictsOption: 'Option \'%s\' cannot be used with option \'%s\'',
		suggest: 'Did you mean \'%s\' ?',
		exceededArgument: 'The argument has gone too far',
	},
	update(error: MessageType.Error) {
		Object.assign(this.error, error);
	},
};

export default message;
