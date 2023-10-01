// deno-lint-ignore-file no-explicit-any
import { Program } from '../mod.ts';
import { HelpType } from '../types.d.ts';

const program = new Program('MY CLI', 'description', {
	version: '1.0.0',
});

program
	.command('add', 'create new data')
	.argument('name', 'a'.repeat(200))
	.argument('id', 'a'.repeat(250))
	.action((argument: any) => {
		console.log('ARGUMENT:');
		console.log(argument);
	});

const position: HelpType.Position[] = ['afterArgument', 'afterCommand', 'afterOption', 'firstLine', 'lastLine'];
const data = [
	['title', 'a'.repeat(25)],
	['title ppppp', 'a'.repeat(25)],
];
program.makeSectionHelp(position[1], position[1] + ':', null, data);
program.makeSectionHelp(
	position[1],
	null,
	null,
	[],
	`
> Description
Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`,
);
// for (const pos of position) {
// }

try {
	// await program.exec('add ferdiansyah');
	await program.exec('add --help');
} catch (error) {
	console.log(error.message);
}
