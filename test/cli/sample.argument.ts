// deno-lint-ignore-file no-explicit-any
import { maker } from '@/test/cli/main.ts';
import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';

const sampleArgument: any[] = [
		maker('ferdy', (argument: any) => {
			assertEquals(argument.name, 'ferdy');
		}),
		maker('ferdy pw12345', (argument: any) => {
			assertEquals(argument.name, 'ferdy');
			assertEquals(argument.password, 'pw12345');
		}),
		maker('ferdy safina with love forever', (argument: any) => {
			assertEquals(argument.one, 'ferdy');
			assertEquals(argument.two, 'safina');
			assertEquals(argument.three, 'with');
			assertEquals(argument.fourth, 'love');
			assertEquals(argument.five, 'forever');
		}),
		maker('ferdy safina', (argument: any) => {
			assertEquals(argument.data, ['ferdy', 'safina']);
		}),
		maker('100', (argument: any) => {
			assertEquals(argument.numeric, 100);
		}),
		maker('100.1', (argument: any) => {
			assertEquals(argument.numeric, 100.1);
		}),
		maker('100', (argument: any) => {
			assertEquals(argument.id, 100);
		}),
		maker('1001', (argument: any) => {
			assertEquals(argument.id, 1001);
		}),
		maker('ferdy', (argument: any) => {
			assertEquals(argument.name, 'ferdy');
		}),
		maker('ferdy', (argument: any) => {
			assertEquals(argument.name, 'ferdy');
		}),
		maker('', (argument: any) => {
			assertEquals(argument.data, '1.1.1.1');
		}),
		maker('100 1000', (argument: any) => {
			assertEquals(argument.numeric, [100, 1000]);
		}),
		maker('100.1 1000.1', (argument: any) => {
			assertEquals(argument.numeric, [100.1, 1000.1]);
		}),
		maker('lorem ipsum kolor sijamet', (argument: any) => {
			assertEquals(argument.data, ['lorem', 'ipsum', 'kolor', 'sijamet']);
		}),
		maker('jsx tsx', (argument: any) => {
			assertEquals(argument.format, ['jsx', 'tsx']);
		}),
		maker('java php', (argument: any) => {
			assertEquals(argument.format, ['java', 'php']);
		}),
	];

export default sampleArgument;