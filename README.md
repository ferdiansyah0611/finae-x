# Finae-X

Finae-X is a command-line interface (CLI) tool that allows you to perform various tasks and operations from the command line. It provides a simple and intuitive way to interact with your applications and execute commands.

## Quick Start

To quickly get started with Finae-X, you can follow the code snippet above. It demonstrates how to use the Program class to create a CLI program and define commands, arguments, and options.

```ts
import { Program } from '@/mod.ts';

const program = new Program('MY CLI', 'description', {
	version: '1.0.0',
});
program
	.command('main', 'description')
	.action(() => console.log('main'));
program
	.command('side', 'description')
	.argument('name', 'description')
	.action((argument) => console.log(argument.name));
program
	.command('section', 'description')
	.option('name', 'description')
	.action((option) => console.log(option.name));
program
	.command('bar', 'description')
	.argument('name', 'description')
	.option('name', 'description')
	.action((argument, option) => console.log(argument.name, option.name));

await program.exec('main');
await program.exec('side ferdy');
await program.exec('section --name shelby');
await program.exec('bar dugem --name lorem');
```

## Documentation

### Program

Explain the use of program:

#### Initialize

It imports the Program class from the specified module and creates a new instance of the program with the given name, description, and version.

```ts
import { Program } from '@/mod.ts';

const program = new Program('MY CLI', 'description', {
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
program.addOption('--verbose', description);
program.addOption('--global', description, (cls) => cls.number());
```

#### Hook

It uses the hook method to register callback functions for events such as pre-action, post-action, pre-error, and post-error.

```ts
program.hook('preAction', (_cmd) => {
	console.log("preAction")
});
program.hook('postAction', (_cmd) => {
	console.log("postAction")
});
program.hook('preError', (_cmd) => {
	console.log("preError")
});
program.hook('postError', (_cmd) => {
	console.log("postError")
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
	.action((argument) => console.log(argument.name));
```

#### Nested

The program has a root command named "root" with a description. It also has two sub-commands: "sub" and "world". When the "sub" command is executed, it prints "sub" to the console. Similarly, when the "world" command is executed, it prints "world" to the console. Additionally, the "down" command is a sub-command of "root" and has its own sub-command "data".

```ts
const root = program.command('root', 'description')
// it will be 'root sub'
root
	.command('sub', 'description')
	.action(() => console.log('sub'));
// it will be 'root world'
root
	.command('world', 'description')
	.action(() => console.log('world'));

const down = root.command('down', 'description')
// it will be 'root down data'
down.command('data').action(() => console.log('data'));
```

#### Allow Unknown Options

The "side" command is defined with a description. By using the allowUnknownOption() method, the command allows unrecognized options to be passed. Additionally, the command defines an option named "name" with a description.

```ts
program
	.command('side', 'description')
	.allowUnknownOption()
	.option('--name', 'description')
	// ...
```
#### Execution

The program has a root command named "root" with a description. When the command is executed, it prints "root" to the console. The execute() method is used to trigger the execution of the command, and it takes an object containing arguments and options as parameters. In this example, no arguments or options are passed.

```ts
const root = program
	.command('root', 'description')
	.action(() => console.log('root'));

root.execute({
	argument: [],
	options: {}
});
```

### Argument

#### Default Value
#### String
#### Number
#### Float
#### Include
#### Exclude
#### Variadic
#### Custom Validator

### Option

#### Default Value
#### String
#### Number
#### Float
#### Include
#### Exclude
#### Variadic
#### Custom Validator
#### Conflicts
#### Implies
#### Required
#### Hidden from Help

### Help

#### Custom Help
#### Custom Section
#### Manual Show Help

## Test

```bash
deno task test
deno task test:watch # watch mode
```

## Contributing

## License

MIT LICENSE
