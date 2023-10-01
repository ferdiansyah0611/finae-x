# Finae-X

Finae-X is a command-line interface (CLI) tool that allows you to perform various tasks and operations from the command line. It provides a simple and intuitive way to interact with your applications and execute commands.

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
  - [Program](#program)
    - [Initialize](#initialize)
      - [Execution](#execution)
      - [Global Options](#global-options)
      - [Hook](#hook)
      - [Error](#error)
      - [Custom Usage](#custom-usage)
  - [Command](#command)
    - [Basic](#basic)
    - [Nested](#nested)
    - [Allow Unknown Options](#allow-unknown-options)
    - [Execution](#execution-1)
    - [Alias](#alias)
  - [Argument](#argument)
    - [Default Value](#default-value)
    - [Type](#type)
    - [Include](#include)
    - [Exclude](#exclude)
    - [Variadic](#variadic)
    - [Custom Validator](#custom-validator)
  - [Option](#option)
    - [Default Value](#default-value-1)
    - [Type](#type-1)
    - [Include](#include-1)
    - [Exclude](#exclude-1)
    - [Variadic](#variadic-1)
    - [Custom Validator](#custom-validator-1)
    - [Conflicts](#conflicts)
    - [Implies](#implies)
    - [Required](#required)
    - [ENV](#env)
    - [Hidden from Help](#hidden-from-help)
  - [Help](#help)
    - [Custom Help](#custom-help)
    - [Custom Section](#custom-section)
    - [Manual Show Help](#manual-show-help)
  - [More Feature](#more-feature)
    - [Suggest After Error](#suggest-after-error)
    - [Custom Error Message](#custom-error-message)

## Installation

Add imports path to deno.json

```json
{
	"imports": {
		"finae-x/": "https://cdn.jsdelivr.net/gh/ferdiansyah0611/finae-x/"
	}
}
```

## Quick Start

To quickly get started with Finae-X, you can follow the code snippet above. It demonstrates how to use the Program class to create a CLI program and define commands, arguments, and options.

```ts
import { Program } from 'finae-x/mod.ts';
import { CommandType, ProgramType } from 'finae-x/types.d.ts';

const program: ProgramType.Type = new Program('MY CLI', 'description', {
	version: '1.0.0',
});
program
	.command('main', 'description')
	.action(() => console.log('main'));
program
	.command('side', 'description')
	.argument('name', 'description')
	.action((argument: any, cmd: CommandType.Type) => console.log(argument.name));
program
	.command('section', 'description')
	.option('name', 'description')
	.action((option: any, cmd: CommandType.Type) => console.log(option.name));
program
	.command('bar', 'description')
	.argument('name', 'description')
	.option('name', 'description')
	.action((argument: any, option: any) => console.log(argument.name, option.name));
program
	.command('satset', 'description')
	.argument('name', 'description')
	.option('name', 'description')
	.action(function () {
		console.log(this.arg);
		console.log(this.opt);
	});

let result: ProgramType.ReturnExec;

result = await program.exec('main');
result = await program.exec('side ferdy');
result = await program.exec('section --name shelby');
result = await program.exec('bar dugem --name lorem');
```

## Sample Code

Run command to view sample output

```bash
deno run -A https://raw.githubusercontent.com/ferdiansyah0611/finae-x/1.0.0/example/main.ts ferdiansyah0611 10
deno run -A https://raw.githubusercontent.com/ferdiansyah0611/finae-x/1.0.0/example/drink.ts
deno run -A https://raw.githubusercontent.com/ferdiansyah0611/finae-x/1.0.0/example/pizza.ts
deno run -A https://raw.githubusercontent.com/ferdiansyah0611/finae-x/1.0.0/example/prompt.ts
```

## Documentation

### Program

Explain the use of program:

#### Initialize

It imports the Program class from the specified module and creates a new instance of the program with the given name, description, and version.

```ts
import { Program } from 'finae-x/mod.ts';
import { ProgramType } from 'finae-x/types.d.ts';

const program: ProgramType.Type = new Program('MY CLI', 'description', {
	version: '1.0.0',
	// stderr: (err) => throw err,
	// suggestAfterError: true
});
```

#### Execution

It shows how to use the exec method to execute various commands, including passing arguments and options.

```ts
await program.exec('--help');
await program.exec('cmd --help');
await program.exec('cmd arg1 arg2 --opt1 data1 --opt2 data2');
```

#### Global Options

It uses the addOption method to define options with their respective descriptions. The second option also demonstrates how to specify a data type for the option using a callback function.

```ts
import { OptionType } from 'finae-x/types.d.ts';

program.addOption('--verbose', description);
program.addOption('--global', description, (cls: OptionType.Type) => cls.number());
```

#### Hook

It uses the hook method to register callback functions for events such as pre-action, post-action, pre-error, and post-error.

```ts
import { CommandType } from 'finae-x/types.d.ts';

program.hook('preAction', (_cmd: CommandType.Type | null) => {
	console.log('preAction');
});
program.hook('postAction', (_cmd: CommandType.Type | null) => {
	console.log('postAction');
});
program.hook('preError', (_cmd: CommandType.Type | null) => {
	console.log('preError');
});
program.hook('postError', (_cmd: CommandType.Type | null) => {
	console.log('postError');
});
```

#### Error

It uses the error method to display custom error messages.

```ts
program.error('Your input is invalid');
```

#### Custom Usage

It uses the usage method to specify a custom usage message, which in this case is set to 'program.test.ts'.

```ts
program.usage('program.test.ts');
```

### Command

Explain the use of commands:

#### Basic

It defines a command named "side" with a description. It also defines an argument named "name" with a description. When this command is executed, the value of the "name" argument is printed to the console.

```ts
program
	.command('side', 'description')
	.argument('name', 'description')
	.action((argument: any) => console.log(argument.name));
```

#### Nested

The program has a root command named "root" with a description. It also has two sub-commands: "sub" and "world". When the "sub" command is executed, it prints "sub" to the console. Similarly, when the "world" command is executed, it prints "world" to the console. Additionally, the "down" command is a sub-command of "root" and has its own sub-command "data".

```ts
import { CommandType } from 'finae-x/types.d.ts';

const root: CommandType.Type = program.command('root', 'description');
// it will be 'root sub'
root
	.command('sub', 'description')
	.action(() => console.log('sub'));
// it will be 'root world'
root
	.command('world', 'description')
	.action(() => console.log('world'));

const down: CommandType.Type = root.command('down', 'description');
// it will be 'root down data'
down.command('data').action(() => console.log('data'));
```

#### Allow Unknown Options

The "side" command is defined with a description. By using the allowUnknownOption() method, the command allows unrecognized options to be passed. Additionally, the command defines an option named "name" with a description.

```ts
program
	.command('side', 'description')
	.allowUnknownOption()
	.option('--name', 'description');
// ...
```

#### Execution

The program has a root command named "root" with a description. When the command is executed, it prints "root" to the console. The execute() method is used to trigger the execution of the command, and it takes an object containing arguments and options as parameters. In this example, no arguments or options are passed.

```ts
const root = program
	.command('root', 'description')
	.action(() => console.log('root'));

await root.execute({
	argument: [],
	options: {},
});
```

#### Alias

Command support multiple aliases.

```ts
program
	.command('install', 'description')
	.alias('i', 'in')
	.action(() => console.log('install'));
```

### Argument

Explain the use of argument:

#### Default Value

Can provide their default values.

```ts
import { ArgumentType } from 'finae-x/types.d.ts';

program
	.command('main', 'description')
	.argument('name', 'description', (cls: ArgumentType.Type) => cls.default('ferdiansyah'))
	.action(() => console.log('main'));
```

#### Type

There are several data types such as string, float, and number. String as default type.

```ts
program
	.command('main', 'description')
	.argument('str', 'description', (cls: ArgumentType.Type) => cls.string('default'))
	.argument('number', 'description', (cls: ArgumentType.Type) => cls.number(100))
	.argument('float', 'description', (cls: ArgumentType.Type) => cls.float(10.10));
```

#### Include

Supports selection based on parameter data.

```ts
program
	.command('main', 'description')
	.argument('style', 'description', (cls: ArgumentType.Type) => cls.include(['css', 'less', 'sass', 'scss']));
```

#### Exclude

Supports exceptions based on parameter data.

```ts
program
	.command('main', 'description')
	.argument('format', 'description', (cls: ArgumentType.Type) => cls.exclude(['mp3', 'mp4']));
```

#### Variadic

Supports unlimited values, making it an array.

```ts
program
	.command('main', 'description')
	.argument('name', 'description', (cls: ArgumentType.Type) => cls.variadic());
```

#### Custom Validator

Supports custom validation, must return a value.

```ts
program
	.command('main', 'description')
	.argument('name', 'description', (cls: ArgumentType.Type) =>
		cls.validator((value: string | number) => {
			if (typeof value === 'string' && value.includes('xxx')) return value.replaceAll('xxx', '[removed]');
			return value;
		}));
```

### Option

Explain the use of options:

#### Default Value

Can provide their default values.

```ts
import { OptionType } from 'finae-x/types.d.ts';

program
	.command('main', 'description')
	.option('name', 'description', (cls: OptionType.Type) => cls.default('ferdiansyah'))
	.action(() => console.log('main'));
```

#### Type

There are several data types such as string, boolean, float, and number. String as default type.

```ts
program
	.command('main', 'description')
	.option('str', 'description', (cls: OptionType.Type) => cls.string('default'))
	.option('number', 'description', (cls: OptionType.Type) => cls.number(100))
	.option('float', 'description', (cls: OptionType.Type) => cls.float(10.10));
	.option('is', 'description', (cls: OptionType.Type) => cls.boolean());
```

#### Include

Supports selection based on parameter data.

```ts
program
	.command('main', 'description')
	.option('style', 'description', (cls: OptionType.Type) => cls.include(['css', 'less', 'sass', 'scss']));
```

#### Exclude

Supports exceptions based on parameter data.

```ts
program
	.command('main', 'description')
	.option('format', 'description', (cls: OptionType.Type) => cls.exclude(['mp3', 'mp4']));
```

#### Variadic

Supports unlimited values, making it an array.

```ts
program
	.command('main', 'description')
	.option('name', 'description', (cls: OptionType.Type) => cls.variadic())
	.option('number', 'description', (cls: OptionType.Type) => cls.number().variadic());
```

#### Custom Validator

Supports custom validation, must return a value.

```ts
program
	.command('main', 'description')
	.option('name', 'description', (cls) =>
		cls.validator((value: string | number) => {
			if (typeof value === 'string' && value.includes('xxx')) return value.replaceAll('xxx', '[removed]');
			return value;
		}));
```

#### Conflicts

Commands will give an error if these options run simultaneously.

```ts
program
	.command('main', 'description')
	.option('port', 'description', (cls: OptionType.Type) => cls.conflicts('default-port', 'default-config'))
	.option('default-port', 'description');
	.option('default-config', 'description');
```

#### Implies

Options will provide a default value to the specified options if the options do not have a value during execution.

```ts
program
	.command('main', 'description')
	.option('port', 'description', (cls: OptionType.Type) => cls.implies({ 'default-port': 3721 }))
	.option('default-port', 'description');
```

#### Required

Commands will give an error if the options do not have a value.

```ts
program
	.command('main', 'description')
	.option('port', 'description', (cls: OptionType.Type) => cls.required());
```

#### ENV

Options will provide a default value to the specified environment if the options do not have a value during execution.

```ts
program
	.command('main', 'description')
	.option('port', 'description', (cls: OptionType.Type) => cls.env('PORT'));
```

#### Hidden from Help

Hides options from help output.

```ts
program
	.command('main', 'description')
	.option('name', 'description', (cls: OptionType.Type) => cls.hideHelp());
```

### Help

Explain the use of help:

#### Custom Help

Customize synopsis and description for help.

```ts
program.helpOption('-h, --helper', 'show help command');
```

#### Custom Section

You can add section output help with specified position: `'afterArgument' | 'afterCommand' | 'afterOption' | 'firstLine' | 'lastLine'`.

```ts
const data = [
	['title', 'a'.repeat(50)],
];
program.makeSectionHelp('afterArgument', 'afterArgument:', null, data);
program.makeSectionHelp('afterCommand', 'afterCommand:', null, data);
program.makeSectionHelp('afterOption', 'afterOption:', null, data);
program.makeSectionHelp('firstLine', 'firstLine:', null, data);
program.makeSectionHelp('lastLine', 'lastLine:', null, data);
```

Raw text support with empty name and data.

```ts
program.makeSectionHelp(
	'afterArgument',
	null,
	null,
	[],
	`
Important!
This is raw text
`,
);
```

#### Manual Show Help

Support manual to show help, pass `false` to argument to get output.

```ts
program.showHelp();

const output = program.showHelp(false);
console.log(output);
```

## More Feature

Explains other features:

### Suggest After Error

Activate this feature if you want to add an error message to a suggestion.

```ts
const program: ProgramType.Type = new Program('MY CLI', 'description', {
	version: '1.0.0',
	suggestAfterError: true,
});
```

### Custom Error Message

You can change the error message with the specified key.

```ts
import { ProgramType } from 'finae-x/types.d.ts';
import message from 'finae-x/src/helpers/message.ts';
import stderr from 'finae-x/src/helpers/stderr.ts';

message.update({
	isRequired: '%s \'%s\' harus di isi',
	isNotType: '%s \'%s\' bukan sebuah type %s',
	isNotIn: '%s \'%s\' tidak termasuk dalam: %s',
	isExlude: '%s \'%s\' termasuk dalam pengecualian: %s',
	cmdNotFound: 'Command \'%s\' tidak ditemukan.',
	optionsUnknown: 'Pilihan tidak teridentifikasi \'%s\'',
	actionNotFound: 'Aksi tidak didefinisikan untuk command \'%s\'',
	mustHaveOneLength: '%s \'%s\' harus memiliki minimal punya 1 data',
	isConflictsOption: 'Pilihan \'%s\' tidak bisa digunakan dengan pilihan \'%s\'',
	suggest: 'Apakah maksud kamu \'%s\' ?',
	exceededArgument: 'Argumen telah melewati batas',
});

const program: ProgramType.Type = new Program('MY CLI', 'description', {
	version: '1.0.0',
	stderr(error) {
		if (Array.isArray(error)) {
			error = error.map((value) => value.replace('Arguments', 'Argumen').replace('Options', 'Pilihan'));
		}
		stderr(error);
	},
});
```
