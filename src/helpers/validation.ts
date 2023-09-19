// deno-lint-ignore-file no-explicit-any
import { ArgumentType, OptionType, ValidationType } from "@/types.d.ts";
import { sprintf } from "printf";
import message from "@/src/helpers/message.ts";

const validation: ValidationType.Type = {
  Number(value: any): ValidationType.ReturnDataType {
    value = parseInt(value);
    return { value, is: Number.isInteger(value) };
  },
  Float(value: any): ValidationType.ReturnDataType {
    value = parseFloat(value);
    return { value, is: !Number.isInteger(value) && Number.isFinite(value) };
  },
  String(value: any): ValidationType.ReturnDataType {
    const pattern = /^[a-zA-Z0-9]+/i;
    return { value, is: pattern.test(value) };
  },
  handler(
    choice: ValidationType.choice,
    type: "Number" | "Float" | "String",
    fullName: string,
    value: any,
    stats: ValidationType.Stats,
  ): ValidationType.ReturnHandler {
    const results = this[type](value);
    let fail = "";
    if (!results.is) {
      fail = sprintf(message.error.isNotType, choice, fullName, type);
    } else {
      value = results.value;
    }

    if (fail) stats.fail.push(fail);
    return { value, message: fail };
  },
  validateNumber(choice: ValidationType.choice, fullName: string, value: any, stats: ValidationType.Stats): number | string {
    const results = this.handler(choice, "Number", fullName, value, stats);
    return results.value;
  },
  validateFloat(choice: ValidationType.choice, fullName: string, value: any, stats: ValidationType.Stats): number | string {
    const results = this.handler(choice, "Float", fullName, value, stats);
    return results.value;
  },
  validateString(choice: ValidationType.choice, fullName: string, value: any, stats: ValidationType.Stats): number | string {
    const results = this.handler(choice, "String", fullName, value, stats);
    return results.value;
  },
  validateArray(
    choice: ValidationType.choice,
    fullName: string,
    value: any,
    stats: ValidationType.Stats,
    config: ArgumentType.Config | OptionType.Config,
  ): boolean {
    if (!config.collection.find((item) => item === value)) {
      stats.fail.push(sprintf(message.error.isNotIn, choice, fullName, config.collection.join(", ")));
      return false;
    }
    return true;
  },
  validateRequired(
    choice: ValidationType.choice,
    property: string[],
    stats: ValidationType.Stats,
    config: ArgumentType.Config | OptionType.Config,
    options: any,
  ): boolean {
    let isError = 0;
    if (config.isRequired) {
      for (const prop of property) {
        if (!options[prop]) {
          isError += 1;
        }
      }
      if (isError === property.length) {
        stats.fail.push(sprintf(message.error.isRequired, choice, property[0]));
      }
    }
    return isError === 0;
  },
};

export default validation;
