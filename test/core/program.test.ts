// deno-lint-ignore-file no-explicit-any
import { Program } from '@/mod.ts';
import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';

let response = null;
const description = 'description';
const callback = () => ({ success: true });
const callbackArgument = (argument: any) => argument;
const callbackOption = (option: any) => option;
const callbackAll = (argument?: any, option?: any, cmd?: any) => ({ argument, option, cmd });

Deno.test('Program Test', async (t) => {
	const program = new Program('test', description, {
		version: '1.1.1',
	});
	const setup = program.getSetup();

	await t.step('initialize', () => {
		program
			.command('main', description)
			.action(callback);
		program
			.command('side', description)
			.argument('name', description)
			.action(callbackArgument);
		program
			.command('section', description)
			.option('name', description)
			.action(callbackOption);
		program
			.command('bar', description)
			.argument('name', description)
			.option('name', description)
			.action(callbackAll);
	});

	await t.step('get all commands', () => {
		assertEquals(program.getAllCommands().length, 4);
	});
	await t.step('get information', () => {
		const info = program.getInformation();
		assertEquals(info.name, 'test');
		assertEquals(info.description, description);
		assertEquals(info.config.version, '1.1.1');
	});

	await t.step('do change usage', () => {
		const setup = program.getSetup();
		program.usage('program.test.ts');
		assertEquals(setup.usage.name, 'program.test.ts');
	});
	await t.step('do parse shell', () => {
		let val;
		val = program.parse('npm run dev');
		assertEquals(val.argument, ['npm', 'run', 'dev']);

		val = program.parse(['npx', 'nodemon', '--help']);
		assertEquals(val.argument, ['npx', 'nodemon']);
		assertEquals(val.options, { help: true });

		val = program.parse(['node', 'main.js', '--data', 'lorem']);
		assertEquals(val.argument, ['node', 'main.js']);
		assertEquals(val.options, { data: ['lorem'] });
	});
	await t.step('do add options global', () => {
		program.addOption('--verbose', description);
		assertEquals(setup.options.findIndex((item) => item.getInformation().synopsis === '--verbose'), 0);
	});
	await t.step('do custom help options', () => {
		program.helpOption('helps', description);
		assertEquals(setup.help?.getInformation().synopsis, '--helps');
	});
	await t.step('do add error', () => {
		const msg = 'Your input is invalid';
		program.error(msg);
		assertEquals(setup.errors, [msg]);

		program.error([msg, msg + '[2]']);
		assertEquals(setup.errors, [msg, msg, msg + '[2]']);
	});
	await t.step('do show help', () => {
		const help = program.showHelp(false);
		assertEquals(new RegExp(description).test(help), true);
		assertEquals(new RegExp('--helps').test(help), true);
		assertEquals(new RegExp('--verbose').test(help), true);
	});
	await t.step('do add hook', async () => {
		program.hook('preAction', (_cmd) => {
			assertEquals('preAction', 'preAction');
		});
		program.hook('postAction', (_cmd) => {
			assertEquals('postAction', 'postAction');
		});
		program.hook('preError', (_cmd) => {
			assertEquals('preError', 'preError');
		});
		program.hook('postError', (_cmd) => {
			assertEquals('postError', 'postError');
		});
		await program.exec('main');
	});
	await t.step('do execution on string', async () => {
		response = await program.exec('main');
		assertEquals(response.stdout.success, true);
	});
	await t.step('do execution on string[]', async () => {
		response = await program.exec(['side', 'ferdy']);
		assertEquals(response.stdout.name, 'ferdy');
	});

	await t.step('do make section help', () => {
		const data = [
			['title', 'a'.repeat(50)]
		];
		program.makeSectionHelp('afterArgument', 'afterArgument:', null, data);
		program.makeSectionHelp('afterCommand', 'afterCommand:', null, data);
		program.makeSectionHelp('afterOption', 'afterOption:', null, data);
		program.makeSectionHelp('firstLine', 'firstLine:', null, data);
		program.makeSectionHelp('lastLine', 'lastLine:', null, data);
		program.showHelp();
	});
});
