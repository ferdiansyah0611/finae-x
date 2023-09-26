import { Command, Program } from '@/mod.ts';
import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';

const description = 'description';
const program = new Program('Test CLI', description, {
	version: '1.9.9',
});

Deno.test('Command Test', async (t) => {
	const cmd = new Command(program, 'main', description, {});
	const info = cmd.getInformation();
	await t.step('can get information', () => {
		assertEquals(info.name, 'main');
		assertEquals(info.description, description);
	});
	await t.step('can set argument', () => {
		cmd.argument('name', description);
		assertEquals(cmd.getArgument().at(0)?.getInformation().synopsis, 'name');
	});
	await t.step('can set option', () => {
		cmd.option('name', description);
		assertEquals(cmd.getOption().at(0)?.getInformation().synopsis, '--name');
	});
	await t.step('can set alias', () => {
		const data = ['i', 'in', 'ins'];
		cmd.alias(...data);
		assertEquals(cmd.getAlias(), data);
	});
	await t.step('can set action and execute', async () => {
		cmd.action(() => {
			return true;
		});
		const result = await cmd.execute();
		assertEquals(result, true);
	});
	await t.step('can show help', () => {
		const help = cmd.showHelp(false);
		assertEquals(help.includes('name'), true);
		assertEquals(help.includes(description), true);
	});
	await t.step('can allow unknown option', () => {
		cmd.allowUnknownOption();
		assertEquals(info.config.isAllowUnknown, true);
	});
	await t.step('can set unknown option', () => {
		const data = { link: true };
		cmd.setUnknownOption(data);
		assertEquals(cmd.getUnknownOption(), data);
	});
	await t.step('can nested command', () => {
		const sub = cmd.command('sub', description);
		assertEquals(sub.getInformation().name, 'main sub');

		const other = sub.command('other', description);
		assertEquals(other.getInformation().name, 'main sub other');
	});
});
