const childProcess = new Deno.Command(Deno.execPath(), {
  args: ["run", import.meta.resolve("./child.ts")],
  stderr: "inherit", // Connect stderr of child to stderr of this process
  stdin: "inherit", // Connect stdin of child to stdin of this process
  stdout: "inherit", // Connect stdout of child to stdout of this process
}).spawn();

await childProcess.status;