// deno-lint-ignore-file no-explicit-any
import { Program } from '@/mod.ts';

const program = new Program('Prompt CLI', 'prompt example', {
  version: '1.0.0',
  suggestAfterError: true,
});
program
  .command('create', 'create new data')
  .argument('name', 'your name')
  .action((argument: any) => {
    console.log('ARGUMENT:');
    console.log(argument);
  });

program
  .command('update', 'update data')
  .argument('id', 'primary key')
  .option('name', 'new name')
  .action((argument: any) => {
    console.log('ARGUMENT:');
    console.log(argument);
  });

Deno.stdin.setRaw(true, { cbreak: true });

for await (
  const str of Deno.stdin.readable.pipeThrough(new TextDecoderStream('>'))
) {
  await main(str);
}

async function main(value: string) {
  if (value === 'exit') {
    Deno.stdin.close();
    Deno.exit();
  }
  if (value) await program.exec(value);
}

