import { Program } from "@/mod.ts";
import { ProgramType } from "@/types.d.ts";
import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { errorTest } from "@/test/Test.ts";

Deno.test("Core CLI", async (t) => {
	let response;
	const description = "this is description";
	// deno-lint-ignore no-explicit-any
	const action = (argument: any) => {
		return argument;
	};
	// deno-lint-ignore no-explicit-any
	const actionArgumentOption = (argument: any, option: any) => {
		return { argument, option };
	};
	// deno-lint-ignore no-explicit-any
	const config: any = {};
	if (Deno.args.indexOf("--no-error") !== -1) config.stderr = () => {};

	const program: ProgramType.Type = new Program("Core CLI", description, config);
	program.command("argument", description).argument("name", description).action(action);
	program
		.command("argument:2", description)
		.argument("name", description)
		.argument("email", description)
		.action(action);
	program
		.command("argument:3", description)
		.argument("number", description, (cls) => cls.variadic().number())
		.action(action);
	program
		.command("argument:4", description)
		.argument("type", description, (cls) => cls.array(["ts", "tsx"]))
		.action(action);

	program.command("option", description).option("name", description).action(action);
	program.command("option:2", description).option("-n, --name", description).action(action);
	program
		.command("option:3", description)
		.option("number", description, (cls) => cls.required().number())
		.action(action);
	program
		.command("option:4", description)
		.option("--type <type...>", description, (cls) => cls.array(["js", "tsx"]))
		.action(action);
	program
		.command("option:5", description)
		.option("--float <float...>", description, (cls) => cls.float())
		.action(action);

	program
		.command("db:delete", description)
		.argument("<table>", description)
		.argument("<...id>", description, cls => cls.number())
		.option("--dbname <database>", description)
		.option("--float <float>", description, cls => cls.float())
		.option("--arraarra <string>", description, cls => cls.array(["lorem", "ipsum"]))
		.action(actionArgumentOption)

	// await t.step("argument with stdout", async () => {
	// 	response = await program.exec("argument ferdy");
	// 	assertEquals(response.stdout.name, "ferdy");

	// 	response = await program.exec("argument:2 ferdy admin@gmail.com");
	// 	assertEquals(response.stdout.name, "ferdy");
	// 	assertEquals(response.stdout.email, "admin@gmail.com");

	// 	response = await program.exec("argument:3 100 344 6402");
	// 	assertEquals(response.stdout.number, [100, 344, 6402]);

	// 	response = await program.exec("argument:4 tsx");
	// 	assertEquals(response.stdout.type, "tsx");
	// });
	// await t.step("argument with stderr", async () => {
	// 	response = await program.exec("argument");
	// 	errorTest.isRequiredArgument(response, "name");

	// 	response = await program.exec("argument:2 ferdy");
	// 	errorTest.isRequiredArgument(response, "email");

	// 	response = await program.exec("argument:3 no-number");
	// 	errorTest.isNotTypeArgument(response, "number[0]", "Number")

	// 	response = await program.exec("argument:4 jsx");
	// 	errorTest.isNotInArgument(response, "type", ["ts", "tsx"])
	// });
	// await t.step("option with stdout", async () => {
	// 	response = await program.exec("option --name ferdy");
	// 	assertEquals(response.stdout.name, "ferdy");

	// 	response = await program.exec("option:2 -n ferdy");
	// 	assertEquals(response.stdout.n, "ferdy");

	// 	response = await program.exec("option:3 --number 100");
	// 	assertEquals(response.stdout.number, 100);

	// 	response = await program.exec("option:4 --type js tsx");
	// 	assertEquals(response.stdout.type, ["js", "tsx"]);

	// 	response = await program.exec("option:5 --float 100.7 150.9");
	// 	assertEquals(response.stdout.float, [100.7, 150.9]);
	// });
	// await t.step("option with stderr", async () => {
	// 	response = await program.exec("option");
	// 	assertEquals(response.stdout, {})

	// 	response = await program.exec("option:2");
	// 	assertEquals(response.stdout, {})

	// 	response = await program.exec("option:3 --number abc");
	// 	errorTest.isNotTypeOption(response, "number", "Number")

	// 	response = await program.exec("option:4 --type jsx");
	// 	errorTest.isNotInOption(response, "type[0]", ["js", "tsx"])
	// });

	// await t.step("argument and options with stdout", async () => {
	// 	response = await program.exec("db:delete users 1 10 --dbname db-10 --float 10.2 --arraarra lorem")
	// 	assertEquals(response.stdout.argument.table, "users")
	// 	assertEquals(response.stdout.argument.id, [1, 10])
	// 	assertEquals(response.stdout.option.dbname, "db-10")
	// 	assertEquals(response.stdout.option.float, 10.2)
	// 	assertEquals(response.stdout.option.arraarra, "lorem")
	// })
	// await t.step("argument and options with stderr", async () => {
	// 	response = await program.exec("db:delete")
	// 	errorTest.isRequiredArgument(response, 'table')
	// 	errorTest.isRequiredArgument(response, 'id')
	// 	errorTest.isRequiredOption(response, 'dbname')
	// 	errorTest.isRequiredOption(response, 'float')
	// 	errorTest.isRequiredOption(response, 'arraarra')
	// })

	const yt = program.command("yt", description)
	yt.command("download", description).action(action)
	yt.command("view", description).action(action)
	yt.command("share", description).action(action)

	const subscribe = yt.command("subscribe", description)
	subscribe.command("add", description).action(action)

	await program.exec("yt -h")
});
// deno test -A --watch test/cli/core.test.ts
// deno test -A --watch test/cli/core.test.ts -- --no-error