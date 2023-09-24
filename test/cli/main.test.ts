import instance from '@/test/cli/main.ts';
import sampleArgument from '@/test/cli/sample.argument.ts';
import sampleOption from '@/test/cli/sample.option.ts';
import sampleData from '@/test/cli/sample.data.ts';
import sampleArgumentError from '@/test/cli/sample.argument.error.ts';

Deno.test('Core CLI', async (t) => {
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
