// deno-lint-ignore-file no-explicit-any
import { maker } from '@/test/cli/main.ts';
import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';

const sampleData: any[] = [
	maker('ferdy --data ferdy', (argument: any, option: any) => {
		assertEquals(argument.data, 'ferdy');
		assertEquals(option.data, 'ferdy');
	}),
	maker(
		'ferdy safina --data1 ferdy --data2 safina',
		(argument: any, option: any) => {
			assertEquals(argument.data1, 'ferdy');
			assertEquals(argument.data2, 'safina');
			assertEquals(option.data1, 'ferdy');
			assertEquals(option.data2, 'safina');
		},
	),
	maker(
		'ferdy safina with love forever --data1 ferdy --data2 safina --data3 with --data4 love --data5 forever',
		(argument: any, option: any) => {
			assertEquals(argument.data1, 'ferdy');
			assertEquals(argument.data2, 'safina');
			assertEquals(argument.data3, 'with');
			assertEquals(argument.data4, 'love');
			assertEquals(argument.data5, 'forever');
			assertEquals(option.data1, 'ferdy');
			assertEquals(option.data2, 'safina');
			assertEquals(option.data3, 'with');
			assertEquals(option.data4, 'love');
			assertEquals(option.data5, 'forever');
		},
	),
	maker(
		'ferdy safina --data ferdy safina',
		(argument: any, option: any) => {
			assertEquals(argument.data, ['ferdy', 'safina']);
			assertEquals(option.data, ['ferdy', 'safina']);
		},
	),
	maker('100 --data 100', (argument: any, option: any) => {
		assertEquals(argument.data, 100);
		assertEquals(option.data, 100);
	}),
	maker('100.1 --data 100.1', (argument: any, option: any) => {
		assertEquals(argument.data, 100.1);
		assertEquals(option.data, 100.1);
	}),
	maker('100 --data 100', (argument: any, option: any) => {
		assertEquals(argument.data, 100);
		assertEquals(option.data, 100);
	}),
	maker('1001 --data 1001', (argument: any, option: any) => {
		assertEquals(argument.data, 1001);
		assertEquals(option.data, 1001);
	}),
	maker('ferdy --data ferdy', (argument: any, option: any) => {
		assertEquals(argument.data, 'ferdy');
		assertEquals(option.data, 'ferdy');
	}),
	maker('ferdy --data ferdy', (argument: any, option: any) => {
		assertEquals(argument.data, 'ferdy');
		assertEquals(option.data, 'ferdy');
	}),
	maker('', (argument: any, option: any) => {
		assertEquals(argument.data, '1.1.1.1');
		assertEquals(option.data, '1.1.1.1');
	}),
	maker('100 1000 --data 100 1000', (argument: any, option: any) => {
		assertEquals(argument.data, [100, 1000]);
		assertEquals(option.data, [100, 1000]);
	}),
	maker(
		'100.1 1000.1 --data 100.1 1000.1',
		(argument: any, option: any) => {
			assertEquals(argument.data, [100.1, 1000.1]);
			assertEquals(option.data, [100.1, 1000.1]);
		},
	),
	maker(
		'lorem ipsum kolor sijamet --data lorem ipsum kolor sijamet',
		(argument: any, option: any) => {
			assertEquals(argument.data, [
				'lorem',
				'ipsum',
				'kolor',
				'sijamet',
			]);
			assertEquals(option.data, [
				'lorem',
				'ipsum',
				'kolor',
				'sijamet',
			]);
		},
	),
	maker('jsx tsx --data jsx tsx', (argument: any, option: any) => {
		assertEquals(argument.data, ['jsx', 'tsx']);
		assertEquals(option.data, ['jsx', 'tsx']);
	}),
	maker('java php --data java php', (argument: any, option: any) => {
		assertEquals(argument.data, ['java', 'php']);
		assertEquals(option.data, ['java', 'php']);
	}),
];

export default sampleData;
