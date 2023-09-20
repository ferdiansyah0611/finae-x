// deno-lint-ignore-file no-explicit-any
import { Program } from '@/mod.ts';

const program = new Program('tools-web', 'web code generator', {
	version: '1.0.0',
});
program
	.helpOption('--help', 'Print help (see more with \'--help\')')
	.addOption('--verbose', 'this is verbose');

const react = program.command('react', 'react cli');

react
	.command('add', 'create new project')
	.argument('name', 'name of project')
	.action((argument: any) => {
		console.log('ARGUMENT:');
		console.log(argument);
	});

react
	.command('make:component', 'generate component')
	.argument('name', 'name of component')
	.option(
		'style',
		'include style',
		(cls) => cls.required().include(['css', 'scss', 'sass']),
	)
	.option('css', 'css style', (cls) => cls.conflicts('style'))
	.action((argument: any, options: any) => {
		console.log('ARGUMENT:');
		console.log(argument);
		console.log('OPTION:');
		console.log(options);
	});

program
	.command('drink', 'buy some drinks')
	.option(
		'drink',
		'select drink',
		(cls) => cls.include(['small', 'medium', 'big']),
	)
	.option('free', 'free drink', (cls) => cls.implies({ drink: 'small' }))
	.action((argument: any) => {
		console.log('ARGUMENT:');
		console.log(argument);
	});

try {
	await program.exec('react add myproject');
	await program.exec('react make:component Sidebar --style css');
	await program.exec('react make:component Sidebar --style css --css');
	await program.exec('drink --free');
	await program.exec('drink --help');
} catch (error) {
	console.log(error.message);
}
