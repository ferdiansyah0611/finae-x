// deno-lint-ignore-file no-explicit-any
import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { ErrorArgument } from '@/test/Test.ts';
import instance from '@/test/instance.test.ts';
import { ProgramType } from '@/types.d.ts';

Deno.test('Core CLI', async (t) => {
	const maker = (cmd: string, callback: any) => ({ cmd, callback });
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

	await t.step('Validation STDOUT', async (t) => {
		let i = 0;
		for (const command of instance.getAllCommands()) {
			const info = command.getInformation();
			if (!info.name.startsWith('argument:')) continue;
			await t.step(info.name, async () => {
				const result = await instance.exec(
					info.name +
						(sampleArgument[i] ? ' ' + sampleArgument[i].cmd : ''),
				);
				if (result.stdout && sampleArgument[i]) {
					sampleArgument[i].callback(result.stdout);
				} else {
					console.log(result);
				}
			});
			i += 1;
		}

		i = 0;
		for (const command of instance.getAllCommands()) {
			const info = command.getInformation();
			if (!info.name.startsWith('option:')) continue;
			await t.step(info.name, async () => {
				const result = await instance.exec(
					info.name +
						(sampleOption[i] ? ' ' + sampleOption[i].cmd : ''),
				);
				if (result.stdout && sampleOption[i]) {
					sampleOption[i].callback(result.stdout);
				} else {
					console.log(result);
				}
			});
			i += 1;
		}

		i = 0;
		for (const command of instance.getAllCommands()) {
			const info = command.getInformation();
			if (!info.name.startsWith('data:')) continue;
			await t.step(info.name, async () => {
				const result = await instance.exec(
					info.name + (sampleData[i] ? ' ' + sampleData[i].cmd : ''),
				);
				if (result.stdout && sampleData[i]) {
					sampleData[i].callback(
						result.stdout.argument,
						result.stdout.options,
					);
				} else {
					console.log(result);
				}
			});
			i += 1;
		}
	});

	const sampleArgumentError = [
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, 'name');
		},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, ['name', 'password'])
		},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, ['one', 'two', 'three', 'fourth', 'five'])
		},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, 'data');
		},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, 'numeric').notType(response, 'numeric', 'Number')
		},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, 'numeric').notType(response, 'numeric', 'Float');
		},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, 'id').notType(response, 'id', 'Number');
		},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, 'id').notType(response, 'id', 'Number');
		},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, 'name');
		},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, 'name');
		},
		(_response: ProgramType.ReturnExec) => {},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, 'numeric');
		},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, 'numeric');
		},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, 'data');
		},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, 'format');
		},
		(response: ProgramType.ReturnExec) => {
			ErrorArgument.isRequired(response, 'format');
		},
	];
	await t.step('Validation STDERR', async (t) => {
		let i = 0;
		for (const command of instance.getAllCommands()) {
			const info = command.getInformation();
			if (!info.name.startsWith('argument:')) continue;
			await t.step(info.name, async () => {
				const result = await instance.exec(info.name);
				if (sampleArgumentError[i]) sampleArgumentError[i](result);
			});
			i += 1;
		}
	});
});
