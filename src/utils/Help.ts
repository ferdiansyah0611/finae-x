// deno-lint-ignore-file
import Option from "@/src/utils/Option.ts";
import { cyan } from "colors";
import { sprintf } from "printf";
import { ArgumentType, CommandType, HelpType, OptionType } from "@/types.d.ts";

export default class Help implements HelpType.Type {
  #info: {
    name: string;
    description: string;
    version: string;
    collection: HelpType.Collection;
  };
  constructor(name: string, description: string, version: string, collection: HelpType.Collection) {
    this.#info = { name, description, version, collection };
  }
  compile(): string {
    let appendText = "\n";
    let text = "";
    text += "$name $version — $description\n\n";
    text += "Usage: 'command.js [...argument] [options]'";
    text = text.replaceAll("$name", this.#info.name).replaceAll("$description", this.#info.description).replaceAll("$version", this.#info.version);
    
    const len: any = {
      arguments: [],
      commands: [],
      options: [],
    };
    if (this.#info.collection.arguments) len.arguments = this.#info.collection.arguments.map((v) => v.getInformation().synopsis.length);
    if (this.#info.collection.commands) len.commands = this.#info.collection.commands.map((v) => v.getInformation().name.length);
    if (this.#info.collection.options) len.options = this.#info.collection.options.map((v) => v.getInformation().synopsis.length);

    let nested: any[] = [];
    let columns = 100;
    try {
      columns = Deno.consoleSize().columns;
    } catch (e) {}

    const allLeng = [...len.arguments, ...len.commands, ...len.options];
    const max = Math.max(...allLeng);
    const makeSection = <T>(key: string, selectorCallback: (item: T) => { title: string; description: string }) => {
      const result = this.#info.collection[key]
        .map((item: T, index: number) => {
          // @ts-ignore
          const selector = selectorCallback(item);
          let description = selector.description;
          const remain = max - len[key][index];
          const title = cyan(selector.title) + " ".repeat(remain) + "\t";
          const lineLength = title.length + 2 + description.length;
          if (lineLength > columns) {
            description = description.slice(0, description.length - (lineLength - columns)) + "...";
          }
          return sprintf("  %s %s", title, description);
        })
        .filter((_: any, index: number) => !nested.includes(index))
        .join("\n");
      if (result.length) appendText += "\n" + (key[0].toUpperCase() + key.slice(1)) + ":\n\n" + result + "\n";
    };

    this.#info.collection.options?.push(new Option("-h, --help", "Show the help command"));

    if (this.#info.collection.arguments) {
      makeSection<ArgumentType.Type>("arguments", (item) => {
        let { synopsis, description } = item.getInformation();
        return { title: synopsis, description };
      });
    }
    if (this.#info.collection.commands) {
      makeSection<CommandType.Type>("commands", (item) => {
        const currNested = item.getNested(true);
        if (currNested.length) {
          nested = nested.concat(currNested)
        }
        let { name, description } = item.getInformation();
        return { title: name, description };
      });
    }
    if (this.#info.collection.options) {
      makeSection<OptionType.Type>("options", (item) => {
        let { synopsis, description } = item.getInformation();
        return { title: synopsis, description };
      });
    }

    text += appendText;
    text += "\n";
    return text;
  }
}
