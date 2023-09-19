import { Program } from "@/mod.ts";
import { ProgramType } from "@/types.d.ts";
import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";

Deno.test("Math CLI", async (t) => {
	const program: ProgramType.Type = new Program("Math CLI", "this is description", {})
	program
		.command("add", "add math")
		.option("-n, --numeric <value...>", "numeric", (cls) => cls.number())
		.action((argument) => {
			return argument.numeric.reduce((curr: number, next: number) => curr + next);
		})
	program
		.command("rectangle", "rectangle math")
		.option("-n, --numeric <value...>", "numeric", (cls) => cls.number())
		.action((argument) => {
			return argument.numeric.reduce((curr: number, next: number) => curr * next);
		})

	await t.step("add", async () => {
		const result = await program.exec("add --numeric 100 100")
		assertEquals(result, 100+100)
	})
	await t.step("rectangle", async () => {
		const result = await program.exec("rectangle --numeric 100 100")
		assertEquals(result, 100*100)
	})
})