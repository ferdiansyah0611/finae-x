import { Option } from '@/mod.ts';
import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { ArgumentType } from '@/types.d.ts';
import { sprintf } from 'printf';
import message from '@/src/helpers/message.ts';

let instance;
const description = 'description';
const compareType = (cls: ArgumentType.Type, type: string) => assertEquals(cls.getInformation().config.type, type);
const compareDefault = (cls: ArgumentType.Type, value: string | number | boolean) =>
	assertEquals(cls.getInformation().config.default, value);

Deno.test('Option Test', async (t) => {
	await t.step('do set default value', () => {
		const fake = { name: 'ferdiansyah' };
		instance = new Option('name', description);
		compareType(instance, 'String');

		instance.string('ferdy');
		compareDefault(instance, 'ferdy');

		const result = instance.doValidation(fake);
		assertEquals(result.data, fake);
	});
	await t.step('can string type', () => {
		const fake = { name: 'ferdiansyah' };
		instance = new Option('name', description);
		instance.string();
		compareType(instance, 'String');

		instance.string('ferdy');
		compareDefault(instance, 'ferdy');

		const result = instance.doValidation(fake);
		assertEquals(result.data, fake);
	});
	await t.step('can number type', () => {
		const fake = { pkid: 100 };
		instance = new Option('pkid', description);
		instance.number();
		compareType(instance, 'Number');

		instance.number(10);
		compareDefault(instance, 10);

		const result = instance.doValidation(fake);
		assertEquals(result.data, fake);
	});
	await t.step('can float type', () => {
		const fake = { num: 100.100 };
		instance = new Option('num', description);
		instance.float();
		compareType(instance, 'Float');

		instance.float(10.10);
		compareDefault(instance, 10.10);

		const result = instance.doValidation(fake);
		assertEquals(result.data, fake);
	});
	await t.step('can boolean type', () => {
		const fake = { flag: true };
		instance = new Option('flag', description);
		instance.boolean();
		compareType(instance, 'Boolean');

		instance.boolean(true);
		compareDefault(instance, true);

		const result = instance.doValidation(fake);
		assertEquals(result.data, fake);
	});
	await t.step('can include string', () => {
		const fake = ['jsx', 'tsx'];
		const data = { format: 'jsx' };
		const dataInvalid = { format: 'js' };

		instance = new Option('format', description);
		instance.string().include(fake);
		compareType(instance, 'String');

		const info = instance.getInformation();
		assertEquals(info.config.include, fake);

		let result = instance.doValidation(data);
		assertEquals(result.data, data);

		result = instance.doValidation(dataInvalid);
		assertEquals(result.fail.length, 1);
		assertEquals(
			result.fail.includes(sprintf(
				message.error.isNotIn,
				'Options',
				'format',
				fake.join(', '),
			)),
			true,
		);
	});
	await t.step('can include number', () => {
		const fake = [99, 69];
		const data = { numeric: 99 };
		const dataInvalid = { numeric: 100 };

		instance = new Option('numeric', description);
		instance.number().include(fake);
		compareType(instance, 'Number');

		const info = instance.getInformation();
		assertEquals(info.config.include, fake);

		let result = instance.doValidation(data);
		assertEquals(result.data, data);

		result = instance.doValidation(dataInvalid);
		assertEquals(result.fail.length, 1);
		assertEquals(
			result.fail.includes(sprintf(
				message.error.isNotIn,
				'Options',
				'numeric',
				fake.join(', '),
			)),
			true,
		);
	});
	await t.step('can include float', () => {
		const fake = [10.1, 100.1];
		const data = { numeric: 10.1 };
		const dataInvalid = { numeric: 100.4 };

		instance = new Option('numeric', description);
		instance.float().include(fake);
		compareType(instance, 'Float');

		const info = instance.getInformation();
		assertEquals(info.config.include, fake);

		let result = instance.doValidation(data);
		assertEquals(result.data, data);

		result = instance.doValidation(dataInvalid);
		assertEquals(result.fail.length, 1);
		assertEquals(
			result.fail.includes(sprintf(
				message.error.isNotIn,
				'Options',
				'numeric',
				fake.join(', '),
			)),
			true,
		);
	});
	await t.step('can exclude string', () => {
		const fake = ['jsx', 'tsx'];
		const data = { format: 'js' };
		const dataInvalid = { format: 'jsx' };
		instance = new Option('format', description);
		instance.string().exclude(fake);
		compareType(instance, 'String');

		const info = instance.getInformation();
		assertEquals(info.config.exclude, fake);

		let result = instance.doValidation(data);
		assertEquals(result.data, data);

		result = instance.doValidation(dataInvalid);
		// console.log(result)
		assertEquals(result.fail.length, 1);
		assertEquals(
			result.fail.includes(sprintf(
				message.error.isExlude,
				'Options',
				'format',
				fake.join(', '),
			)),
			true,
		);
	});
	await t.step('can exclude number', () => {
		const fake = [99, 69];
		const data = { numeric: 100 };
		const dataInvalid = { numeric: 99 };

		instance = new Option('numeric', description);
		instance.number().exclude(fake);
		compareType(instance, 'Number');

		const info = instance.getInformation();
		assertEquals(info.config.exclude, fake);

		let result = instance.doValidation(data);
		assertEquals(result.data, data);

		result = instance.doValidation(dataInvalid);
		assertEquals(result.fail.length, 1);
		assertEquals(
			result.fail.includes(sprintf(
				message.error.isExlude,
				'Options',
				'numeric',
				fake.join(', '),
			)),
			true,
		);
	});
	await t.step('can exclude float', () => {
		const fake = [10.10, 100.100];
		const data = { numeric: 100 };
		const dataInvalid = { numeric: 10.10 };

		instance = new Option('numeric', description);
		instance.float().exclude(fake);
		compareType(instance, 'Float');

		const info = instance.getInformation();
		assertEquals(info.config.exclude, fake);

		let result = instance.doValidation(data);
		assertEquals(result.data, data);

		result = instance.doValidation(dataInvalid);
		assertEquals(result.fail.length, 1);
		assertEquals(
			result.fail.includes(sprintf(
				message.error.isExlude,
				'Options',
				'numeric',
				fake.join(', '),
			)),
			true,
		);
	});
	await t.step('can custom validator', () => {
		instance = new Option('name', description);
		instance.string().validator((value) => {
			if (typeof value === 'string' && value.includes('xxx')) return value.replaceAll('xxx', '[removed]');
			return value;
		});
		compareType(instance, 'String');

		const info = instance.getInformation();
		if (info.config.validator) {
			assertEquals(info.config.validator('ferdyxxx'), 'ferdy[removed]');
			assertEquals(info.config.validator('ferdy'), 'ferdy');
		}
	});
	await t.step('can variadic', () => {
		instance = new Option('format', description);
		instance.variadic().string();
		compareType(instance, 'String');

		const info = instance.getInformation();
		assertEquals(info.config.isVariadic, true);
	});

	await t.step('can custom symbol', async (t) => {
		await t.step('can with --name', () => {
			instance = new Option('--name', description);
			const info = instance.getInformation();
			assertEquals(info.synopsis, '--name');
			assertEquals(info.results.fullName, 'name');
		});
		await t.step('can with -n, --name', () => {
			instance = new Option('-n, --name', description);
			const info = instance.getInformation();
			assertEquals(info.synopsis, '-n, --name');
			assertEquals(info.results.fullName, 'name');
		});
		await t.step('can with --name <data...>', () => {
			instance = new Option('--name <data...>', description);
			const info = instance.getInformation();
			assertEquals(info.synopsis, '--name <data...>');
			assertEquals(info.results.fullName, 'name');
			assertEquals(info.config.isVariadic, true);
		});
		await t.step('can with -n, --name <data...>', () => {
			instance = new Option('-n, --name <data...>', description);
			const info = instance.getInformation();
			assertEquals(info.synopsis, '-n, --name <data...>');
			assertEquals(info.results.fullName, 'name');
			assertEquals(info.config.isVariadic, true);
		});
		await t.step('can with --name [data...]', () => {
			instance = new Option('--name [data...]', description);
			const info = instance.getInformation();
			assertEquals(info.synopsis, '--name [data...]');
			assertEquals(info.results.fullName, 'name');
			assertEquals(info.config.isVariadic, true);
		});
		await t.step('can with -n, --name [data...]', () => {
			instance = new Option('-n, --name [data...]', description);
			const info = instance.getInformation();
			assertEquals(info.synopsis, '-n, --name [data...]');
			assertEquals(info.results.fullName, 'name');
			assertEquals(info.config.isVariadic, true);
		});
	});

	await t.step('can implies', () => {
		const data = { name: 'ferdiansyah' };
		instance = new Option('format', description);
		instance.implies(data);
		compareType(instance, 'String');

		const info = instance.getInformation();
		assertEquals(info.config.implies, data);
	});
	await t.step('can conflicts', () => {
		const data = ['more-opt'];
		instance = new Option('format', description);
		instance.conflicts(...data);
		compareType(instance, 'String');

		const info = instance.getInformation();
		assertEquals(info.config.conflicts, data);
	});
	await t.step('can hide help', () => {
		instance = new Option('format', description);
		instance.hideHelp();

		const info = instance.getInformation();
		assertEquals(info.config.isHidden, true);
	});
	await t.step('can with env', () => {
		instance = new Option('name', description);
		instance.env('NAME');

		const info = instance.getInformation();
		assertEquals(info.config.env, 'NAME');
	});
});