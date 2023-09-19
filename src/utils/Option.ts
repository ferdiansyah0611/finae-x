// deno-lint-ignore-file
import { OptionType, ValidationType } from "@/types.d.ts";
import { sprintf } from "printf";
import validation from "@/src/helpers/validation.ts";

export default class Option implements OptionType.Type {
  #synopsis: string;
  #description: string;
  #config: OptionType.Config = {
    isHidden: false,
    isRequired: false,
    isVariadic: false,
    default: null,
    type: "String",
    collection: [],
  };
  #results: OptionType.Result = {
    alias: "",
    fullName: "",
  };
  constructor(synopsis: string, description: string) {
    this.#synopsis = synopsis;
    this.#description = description;
    this.#parseSynopsis();
  }
  getInformation(): OptionType.Information {
    return {
      synopsis: this.#synopsis,
      description: this.#description,
      config: this.#config,
      results: this.#results,
    };
  }
  doValidation(options: any): ValidationType.Stats {
    const stats: ValidationType.Stats = {
      success: [],
      fail: [],
    };
    const { config, results } = this.getInformation();
    const choice = options[results.fullName] ? results.fullName : results.alias;
    const name = results.fullName || results.alias;

    validation.validateRequired("Options", [results.fullName, results.alias], stats, config, options);
    
    if (!Object.keys(options).length) return stats;
    if (!config.isVariadic) {
      if (Array.isArray(options[choice])) options[choice] = options[choice][0];

      if (config.type === "String") options[choice] = validation.validateString("Options", name, options[choice], stats);
      else if (config.type === "Number") options[choice] = validation.validateNumber("Options", name, options[choice], stats);
      else if (config.type === "Float") options[choice] = validation.validateFloat("Options", name, options[choice], stats);
      else if (config.type === "Array") {
        validation.validateArray("Options", name, options[choice], stats, config);
      }
    }
    if (config.isVariadic) {
      options[choice] = options[choice].map((item: any, index: number) => {
        if (config.type === "String") item = validation.validateString("Options", `${name}[${index}]`, item, stats);
        else if (config.type === "Number") item = validation.validateNumber("Options", `${name}[${index}]`, item, stats);
        else if (config.type === "Float") item = validation.validateFloat("Options", `${name}[${index}]`, item, stats);
        else if (config.type === "Array") validation.validateArray("Options", `${name}[${index}]`, item, stats, config);
        return item;
      });
    }
    return stats;
  }

  #parseSynopsis() {
    let alias = this.#synopsis.match(/^-([a-zA-Z]), /);
    let fullName = this.#synopsis.match(/--([a-zA-Z]+)/);
    const isRequired = this.#synopsis.match(/<.+>/);
    const isOptional = this.#synopsis.match(/\[.+\]/);
    const isVariadic = this.#synopsis.match(/(\[.+\])|(\.\.\.)/);
    const { results } = this.getInformation();
    if (alias && alias.length === 2) {
      results.alias = alias[1];
    }
    if (fullName && fullName.length === 2) {
      results.fullName = fullName[1];
    }
    if (isRequired) {
      this.#config.isRequired = true;
    }
    if (isOptional) {
      this.#config.isRequired = false;
    }

    if (!this.#synopsis.includes("-")) results.fullName = this.#synopsis;
    if (isVariadic) this.variadic();
    results.fullName = results.fullName.replace("...", "");
    this.#results = results;
  }

  hide(): OptionType.Type {
    this.#config.isHidden = true;
    return this;
  }
  required(): OptionType.Type {
    this.#config.isRequired = true;
    return this;
  }
  variadic(): OptionType.Type {
    this.#config.isVariadic = true;
    return this;
  }
  string(defaults?: string): OptionType.Type {
    this.#config.type = "String";
    this.default(defaults);
    return this;
  }
  number(defaults?: number): OptionType.Type {
    this.#config.type = "Number";
    this.default(defaults);
    return this;
  }
  float(defaults?: number): OptionType.Type {
    this.#config.type = "Float";
    this.default(defaults);
    return this;
  }
  array(collection: any[]): OptionType.Type {
    const { results } = this.getInformation();

    if (!collection.length) throw new Error(sprintf("Options '%s' must be have minimum 1 length", results.fullName));
    this.#config.type = "Array";
    this.#config.collection = collection;
    return this;
  }

  validator(callback: (value: any) => boolean): OptionType.Type {
    this.#config.validator = callback;
    return this;
  }
  default(value?: any): OptionType.Type {
    if (value === undefined) return this;
    this.#config.default = value;
    return this;
  }
}
