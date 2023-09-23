import { Argument } from '@/mod.ts';
import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { ArgumentType } from '@/types.d.ts';
import { sprintf } from 'printf';
import message from '@/src/helpers/message.ts';

let instance;
const description = 'description';
const compareType = (cls: ArgumentType.Type, type: string) => assertEquals(cls.getInformation().config.type, type);
const compareDefault = (cls: ArgumentType.Type, value: string | number) =>
	assertEquals(cls.getInformation().config.default, value);
const nextCallback = (_howMuch: number) => {};

Deno.test('Argument Test', async (t) => {
	await t.step('do set default value', () => {
		const fake = ['ferdiansyah', 'safina'];
		instance = new Argument('name', description);
		compareType(instance, 'String');

		instance.string('ferdy');
		compareDefault(instance, 'ferdy');

		const result = instance.doValidation(fake, 0, nextCallback);
		assertEquals(result.data, fake[0]);
	});
	await t.step('can string type', () => {
		const fake = ['ferdiansyah', 'safina sahda'];
		instance = new Argument('name', description);
		instance.string();
		compareType(instance, 'String');

		instance.string('ferdy');
		compareDefault(instance, 'ferdy');

		const result = instance.doValidation(fake, 1, nextCallback);
		assertEquals(result.data, fake[1]);
	});
	await t.step('can number type', () => {
		const fake = [100, 1000];
		instance = new Argument('pkid', description);
		instance.number();
		compareType(instance, 'Number');

		instance.number(10);
		compareDefault(instance, 10);

		const result = instance.doValidation(fake, 0, nextCallback);
		assertEquals(result.data, fake[0]);
	});
	await t.step('can float type', () => {
		const fake = [100.100, 1000.9999, 69.69];
		instance = new Argument('num', description);
		instance.float();
		compareType(instance, 'Float');

		instance.float(10.10);
		compareDefault(instance, 10.10);

		const result = instance.doValidation(fake, 2, nextCallback);
		assertEquals(result.data, fake[2]);
	});
	await t.step('can include string', () => {
		const fake = ['jsx', 'tsx'];
		instance = new Argument('format', description);
		instance.string().include(fake);
		compareType(instance, 'String');

		const info = instance.getInformation();
		assertEquals(info.config.include, fake);

		let result = instance.doValidation(fake, 0, nextCallback);
		assertEquals(result.data, fake[0]);

		result = instance.doValidation(['js'], 0, nextCallback);
		assertEquals(result.fail.length, 1);
		assertEquals(
			result.fail.includes(sprintf(
				message.error.isNotIn,
				'Arguments',
				'format',
				fake.join(', '),
			)),
			true,
		);
	});
	await t.step('can include number', () => {
		const fake = [99, 69];
		instance = new Argument('numeric', description);
		instance.number().include(fake);
		compareType(instance, 'Number');

		const info = instance.getInformation();
		assertEquals(info.config.include, fake);

		let result = instance.doValidation(fake, 0, nextCallback);
		assertEquals(result.data, fake[0]);

		result = instance.doValidation([100], 0, nextCallback);
		assertEquals(result.fail.length, 1);
		assertEquals(
			result.fail.includes(sprintf(
				message.error.isNotIn,
				'Arguments',
				'numeric',
				fake.join(', '),
			)),
			true,
		);
	});
	await t.step('can include float', () => {
		const fake = [10.10, 100.100];
		instance = new Argument('numer\'', description);
		instance.float().include(fake);
		compareType(instance, 'Float');

		const info = instance.getInformation();
		assertEquals(info.config.include, fake);

		let result = instance.doValidation(fake, 1, nextCallback);
		assertEquals(result.data, fake[1]);

		result = instance.doValidation([11.10], 0, nextCallback);
		assertEquals(result.fail.length, 1);
		assertEquals(
			result.fail.includes(sprintf(
				message.error.isNotIn,
				'Arguments',
				'numer\'',
				fake.join(', '),
			)),
			true,
		);
	});
	await t.step('can exclude string', () => {
		const fake = ['jsx', 'tsx'];
		instance = new Argument('format', description);
		instance.string().exclude(fake);
		compareType(instance, 'String');

		const info = instance.getInformation();
		assertEquals(info.config.exclude, fake);

		let result = instance.doValidation(['js'], 0, nextCallback);
		assertEquals(result.data, 'js');

		result = instance.doValidation(['jsx'], 0, nextCallback);
		assertEquals(result.fail.length, 1);
		assertEquals(
			result.fail.includes(sprintf(
				message.error.isExlude,
				'Arguments',
				'format',
				fake.join(', '),
			)),
			true,
		);
	});
	await t.step('can exclude number', () => {
		const fake = [99, 69];
		instance = new Argument('format', description);
		instance.number().exclude(fake);
		compareType(instance, 'Number');

		const info = instance.getInformation();
		assertEquals(info.config.exclude, fake);

		let result = instance.doValidation([100], 0, nextCallback);
		assertEquals(result.data, 100);

		result = instance.doValidation(fake, 0, nextCallback);
		assertEquals(result.fail.length, 1);
		assertEquals(
			result.fail.includes(sprintf(
				message.error.isExlude,
				'Arguments',
				'format',
				fake.join(', '),
			)),
			true,
		);
	});
	await t.step('can exclude float', () => {
		const fake = [10.10, 100.100];
		instance = new Argument('format', description);
		instance.float().exclude(fake);
		compareType(instance, 'Float');

		const info = instance.getInformation();
		assertEquals(info.config.exclude, fake);

		let result = instance.doValidation([101], 0, nextCallback);
		assertEquals(result.data, 101);

		result = instance.doValidation(fake, 0, nextCallback);
		assertEquals(result.fail.length, 1);
		assertEquals(
			result.fail.includes(sprintf(
				message.error.isExlude,
				'Arguments',
				'format',
				fake.join(', '),
			)),
			true,
		);
	});
	await t.step('can custom validator', () => {
		instance = new Argument('name', description);
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
		instance = new Argument('format', description);
		instance.variadic().string();
		compareType(instance, 'String');

		const info = instance.getInformation();
		assertEquals(info.config.isVariadic, true);
	});

	await t.step('can custom symbol', async (t) => {
		await t.step('can with <name>', () => {
			instance = new Argument('<name>', description);
			const info = instance.getInformation();
			assertEquals(info.synopsis, '<name>');
			assertEquals(info.results.fullName, 'name');
		});
		await t.step('can with [name]', () => {
			instance = new Argument('[name]', description);
			const info = instance.getInformation();
			assertEquals(info.synopsis, '[name]');
			assertEquals(info.results.fullName, 'name');
		});
		await t.step('can with <name...>', () => {
			instance = new Argument('<name...>', description);
			const info = instance.getInformation();
			assertEquals(info.synopsis, '<name...>');
			assertEquals(info.results.fullName, 'name');
			assertEquals(info.config.isVariadic, true);
		});
		await t.step('can with [name...]', () => {
			instance = new Argument('[name...]', description);
			const info = instance.getInformation();
			assertEquals(info.synopsis, '[name...]');
			assertEquals(info.results.fullName, 'name');
			assertEquals(info.config.isVariadic, true);
		});
	});
});
