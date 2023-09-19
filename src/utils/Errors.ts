// deno-lint-ignore-file
import { red } from "colors";
import highlight from "@/src/helpers/highlight.ts";

export function stderr(value: any[] | any) {
  if (Array.isArray(value)) {
    console.log(red("Error:"));
    value.map((v) => console.log("  -", highlight(v)));
  } else {
    console.log(red("Error:"), highlight(value));
  }

  return { errors: value };
}
