import message from "@/src/helpers/message.ts";
import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { sprintf } from "printf";
import { ProgramType } from "@/types.d.ts";

const errorTest = {
	isRequiredArgument(response: ProgramType.ReturnExec, name: string){
		assertEquals(
			response.stderr?.includes(sprintf(message.error.isRequired, "Arguments", name)),
			true,
		);
	},
	isNotTypeArgument(response: ProgramType.ReturnExec, name: string, type: string){
		assertEquals(
			response.stderr?.includes(sprintf(message.error.isNotType, "Arguments", name, type)),
			true,
		);
	},
	// deno-lint-ignore no-explicit-any
	isNotInArgument(response: ProgramType.ReturnExec, name: string, arr: any[]){
		assertEquals(
			response.stderr?.includes(sprintf(message.error.isNotIn, "Arguments", name, arr.join(", "))),
			true,
		);
	},

	isRequiredOption(response: ProgramType.ReturnExec, name: string){
		assertEquals(
			response.stderr?.includes(sprintf(message.error.isRequired, "Options", name)),
			true,
		);
	},
	isNotTypeOption(response: ProgramType.ReturnExec, name: string, type: string){
		assertEquals(
			response.stderr?.includes(sprintf(message.error.isNotType, "Options", name, type)),
			true,
		);
	},
	// deno-lint-ignore no-explicit-any
	isNotInOption(response: ProgramType.ReturnExec, name: string, arr: any[]){
		assertEquals(
			response.stderr?.includes(sprintf(message.error.isNotIn, "Options", name, arr.join(", "))),
			true,
		);
	},
}

export { errorTest };