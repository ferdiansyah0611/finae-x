// deno-lint-ignore-file no-explicit-any
import { ProgramType } from '@/types.d.ts';
import { Program } from '@/mod.ts';

const description = 'this is description';
const config: any = {};
config.stderr = () => {};

const instance: ProgramType.Type = new Program('Core CLI', description, config);
const actionArgument = (argument: any) => {
	return argument;
};
const actionOption = (options: any) => {
	return options;
};
const actionAll = (argument: any, options: any) => {
	return { argument, options };
};
const customValidator = (value: number | string) => {
	if (typeof value === 'string' && value.startsWith('xxx')) instance.error('Word not allowed');
	return value;
};

instance.command('argument:one', description).argument('name', description)
	.action(actionArgument);
instance
	.command('argument:two', description)
	.argument('name', description)
	.argument('password', description)
	.action(actionArgument);
instance
	.command('argument:five', description)
	.argument('one', description)
	.argument('two', description)
	.argument('three', description)
	.argument('fourth', description)
	.argument('five', description)
	.action(actionArgument);
instance
	.command('argument:variadic', description)
	.argument('data', description, (cls) => cls.variadic())
	.action(actionArgument);
instance
	.command('argument:number', description)
	.argument('numeric', description, (cls) => cls.number())
	.action(actionArgument);
instance
	.command('argument:float', description)
	.argument('numeric', description, (cls) => cls.float())
	.action(actionArgument);
instance
	.command('argument:include', description)
	.argument('id', description, (cls) => cls.number().include([1, 100, 1000]))
	.action(actionArgument);
instance
	.command('argument:exclude', description)
	.argument('id', description, (cls) => cls.number().exclude([1, 100, 1000]))
	.action(actionArgument);
instance
	.command('argument:string', description)
	.argument('name', description, (cls) => cls.string())
	.action(actionArgument);
instance
	.command('argument:validator', description)
	.argument('name', description, (cls) => cls.validator(customValidator))
	.action(actionArgument);
instance
	.command('argument:default', description)
	.argument('data', description, (cls) => cls.default('1.1.1.1'))
	.action(actionArgument);
instance
	.command('argument:variadic:number', description)
	.argument('numeric', description, (cls) => cls.variadic().number())
	.action(actionArgument);
instance
	.command('argument:variadic:float', description)
	.argument('numeric', description, (cls) => cls.variadic().float())
	.action(actionArgument);
instance
	.command('argument:variadic:string', description)
	.argument('data', description, (cls) => cls.variadic().string())
	.action(actionArgument);
instance
	.command('argument:variadic:include', description)
	.argument(
		'format',
		description,
		(cls) => cls.variadic().include(['jsx', 'tsx', 'sass', 'html5']),
	)
	.action(actionArgument);
instance
	.command('argument:variadic:exclude', description)
	.argument(
		'format',
		description,
		(cls) => cls.variadic().exclude(['mp4', 'mp3']),
	)
	.action(actionArgument);

// option
instance.command('option:one', description).option('name', description).action(
	actionOption,
);
instance
	.command('option:two', description)
	.option('name', description)
	.option('password', description)
	.action(actionOption);
instance
	.command('option:five', description)
	.option('one', description)
	.option('two', description)
	.option('three', description)
	.option('fourth', description)
	.option('five', description)
	.action(actionOption);
instance
	.command('option:variadic', description)
	.option('data', description, (cls) => cls.variadic())
	.action(actionOption);
instance
	.command('option:number', description)
	.option('numeric', description, (cls) => cls.number())
	.action(actionOption);
instance
	.command('option:float', description)
	.option('numeric', description, (cls) => cls.float())
	.action(actionOption);
instance
	.command('option:boolean', description)
	.option('flag', description, (cls) => cls.boolean())
	.action(actionOption);
instance
	.command('option:include', description)
	.option('id', description, (cls) => cls.number().include([1, 100, 1000]))
	.action(actionOption);
instance
	.command('option:exclude', description)
	.option('id', description, (cls) => cls.number().exclude([1, 100, 1000]))
	.action(actionOption);
instance
	.command('option:string', description)
	.option('name', description, (cls) => cls.string())
	.action(actionOption);
instance
	.command('option:validator', description)
	.option('name', description, (cls) => cls.validator(customValidator))
	.action(actionOption);
instance
	.command('option:default', description)
	.option('data', description, (cls) => cls.default('1.1.1.1'))
	.action(actionOption);
instance
	.command('option:variadic:number', description)
	.option('numeric', description, (cls) => cls.variadic().number())
	.action(actionOption);
instance
	.command('option:variadic:float', description)
	.option('numeric', description, (cls) => cls.variadic().float())
	.action(actionOption);
instance
	.command('option:variadic:string', description)
	.option('data', description, (cls) => cls.variadic().string())
	.action(actionOption);
instance
	.command('option:variadic:include', description)
	.option(
		'format',
		description,
		(cls) => cls.variadic().include(['jsx', 'tsx', 'sass', 'html5']),
	)
	.action(actionOption);
instance
	.command('option:variadic:exclude', description)
	.option(
		'format',
		description,
		(cls) => cls.variadic().exclude(['mp4', 'mp3']),
	)
	.action(actionOption);

// argument & option
instance
	.command('data:one', description)
	.argument('data', description)
	.option('data', description)
	.action(actionAll);
instance
	.command('data:two', description)
	.argument('data1', description)
	.argument('data2', description)
	.option('data1', description)
	.option('data2', description)
	.action(actionAll);
instance
	.command('data:five', description)
	.argument('data1', description)
	.argument('data2', description)
	.argument('data3', description)
	.argument('data4', description)
	.argument('data5', description)
	.option('data1', description)
	.option('data2', description)
	.option('data3', description)
	.option('data4', description)
	.option('data5', description)
	.action(actionAll);
instance
	.command('data:variadic', description)
	.argument('data', description, (cls) => cls.variadic())
	.option('data', description, (cls) => cls.variadic())
	.action(actionAll);
instance
	.command('data:number', description)
	.argument('data', description, (cls) => cls.number())
	.option('data', description, (cls) => cls.number())
	.action(actionAll);
instance
	.command('data:float', description)
	.argument('data', description, (cls) => cls.float())
	.option('data', description, (cls) => cls.float())
	.action(actionAll);
instance
	.command('data:include', description)
	.argument(
		'data',
		description,
		(cls) => cls.number().include([1, 100, 1000]),
	)
	.option('data', description, (cls) => cls.number().include([1, 100, 1000]))
	.action(actionAll);
instance
	.command('data:exclude', description)
	.argument(
		'data',
		description,
		(cls) => cls.number().exclude([1, 100, 1000]),
	)
	.option('data', description, (cls) => cls.number().exclude([1, 100, 1000]))
	.action(actionAll);
instance
	.command('data:string', description)
	.argument('data', description, (cls) => cls.string())
	.option('data', description, (cls) => cls.string())
	.action(actionAll);
instance
	.command('data:validator', description)
	.argument('data', description, (cls) => cls.validator(customValidator))
	.option('data', description, (cls) => cls.validator(customValidator))
	.action(actionAll);
instance
	.command('data:default', description)
	.argument('data', description, (cls) => cls.default('1.1.1.1'))
	.option('data', description, (cls) => cls.default('1.1.1.1'))
	.action(actionAll);
instance
	.command('data:variadic:number', description)
	.argument('data', description, (cls) => cls.variadic().number())
	.option('data', description, (cls) => cls.variadic().number())
	.action(actionAll);
instance
	.command('data:variadic:float', description)
	.argument('data', description, (cls) => cls.variadic().float())
	.option('data', description, (cls) => cls.variadic().float())
	.action(actionAll);
instance
	.command('data:variadic:string', description)
	.argument('data', description, (cls) => cls.variadic().string())
	.option('data', description, (cls) => cls.variadic().string())
	.action(actionAll);
instance
	.command('data:variadic:include', description)
	.argument(
		'data',
		description,
		(cls) => cls.variadic().include(['jsx', 'tsx', 'sass', 'html5']),
	)
	.option(
		'data',
		description,
		(cls) => cls.variadic().include(['jsx', 'tsx', 'sass', 'html5']),
	)
	.action(actionAll);
instance
	.command('data:variadic:exclude', description)
	.argument(
		'data',
		description,
		(cls) => cls.variadic().exclude(['mp4', 'mp3']),
	)
	.option(
		'data',
		description,
		(cls) => cls.variadic().exclude(['mp4', 'mp3']),
	)
	.action(actionAll);

export const maker = (cmd: string, callback: any) => ({ cmd, callback });
export default instance;
