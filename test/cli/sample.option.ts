// deno-lint-ignore-file no-explicit-any
import { maker } from './main.ts';
import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';

const sampleOption: any[] = [
	maker('--name ferdy', (argument: any) => {
		assertEquals(argument.name, 'ferdy');
	}),
	maker('--name ferdy --password pw12345', (argument: any) => {
		assertEquals(argument.name, 'ferdy');
		assertEquals(argument.password, 'pw12345');
	}),
	maker(
		'--one ferdy --two safina --three with --fourth love --five forever',
		(argument: any) => {
			assertEquals(argument.one, 'ferdy');
			assertEquals(argument.two, 'safina');
			assertEquals(argument.three, 'with');
			assertEquals(argument.fourth, 'love');
			assertEquals(argument.five, 'forever');
		},
	),
	maker('--data ferdy safina', (argument: any) => {
		assertEquals(argument.data, ['ferdy', 'safina']);
	}),
	maker('--numeric 100', (argument: any) => {
		assertEquals(argument.numeric, 100);
	}),
	maker('--numeric 100.1', (argument: any) => {
		assertEquals(argument.numeric, 100.1);
	}),
	maker('--flag', (argument: any) => {
		assertEquals(argument.flag, true);
	}),
	maker('--id 100', (argument: any) => {
		assertEquals(argument.id, 100);
	}),
	maker('--id 1001', (argument: any) => {
		assertEquals(argument.id, 1001);
	}),
	maker('--name ferdy', (argument: any) => {
		assertEquals(argument.name, 'ferdy');
	}),
	maker('--name ferdy', (argument: any) => {
		assertEquals(argument.name, 'ferdy');
	}),
	maker('', (argument: any) => {
		assertEquals(argument.data, '1.1.1.1');
	}),
	maker('--numeric 100 1000', (argument: any) => {
		assertEquals(argument.numeric, [100, 1000]);
	}),
	maker('--numeric 100.1 1000.1', (argument: any) => {
		assertEquals(argument.numeric, [100.1, 1000.1]);
	}),
	maker('--data lorem ipsum kolor sijamet', (argument: any) => {
		assertEquals(argument.data, ['lorem', 'ipsum', 'kolor', 'sijamet']);
	}),
	maker('--format jsx tsx', (argument: any) => {
		assertEquals(argument.format, ['jsx', 'tsx']);
	}),
	maker('--format java php', (argument: any) => {
		assertEquals(argument.format, ['java', 'php']);
	}),
];

export default sampleOption;
