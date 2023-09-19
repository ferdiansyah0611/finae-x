import { Program } from "@/mod.ts";

const program = new Program("tools-web", "web code generator", {
	version: "1.0.0"
});

const reactCommand = program.command("react", "react cli");
reactCommand
	.command("add", "add react project")
	.action(() => {
		console.log("add");
	})

reactCommand
	.command("delete", "delete react project")
	.action(() => {
		console.log("delete");
	})

reactCommand
	.command("state", "state react project")
	.argument("name", "name of state")
	.action((argument) => {
		console.log("state %s", argument.name);
	})

reactCommand
	.command("type", "type react project")
	.option("--data", "name of type", (cls) => cls.required().array(["react", "typescript"]))
	.option("-n, --name", "name of type", (cls) => cls.required().variadic())
	.option("--number", "number of type", (cls) => cls.required().number())
	.action((options) => {
		console.log(options);
	})

const authCommand = program.command("auth", "auth handling");
authCommand.command("signin", "do signin")
	.argument("email", "email address")
	.argument("password", "your password")
	.action(() => console.log("signin"))

authCommand.command("signup", "do signup")
	.argument("<name>", "Your Name")
	.argument("<email>", "Email Address")
	.argument("<password>", "Your Password")
	.action(() => console.log("signup"))

// await program.exec("react");
// await program.exec("react add");
// await program.exec("react delete");
// await program.exec("react state");
await program.exec("react type --data typescript -n 10 --number 200.90");
// await program.exec("react type -n fefe aa ccc --data pl");
// await program.exec("react type");
// await program.exec("auth signup ferdi ferdi@gmail.com gg");
// await program.exec("-h");
// await program.exec("-v");
// console.log(await program.help());