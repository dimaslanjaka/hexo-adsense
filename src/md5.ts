import crypto from "crypto";
import { inspect } from "util";

/**
 * PHP MD5 Equivalent
 * @param data
 * @returns
 */
export function md5(data: string) {
  if (typeof data !== "string" || !data) {
    if (typeof data !== "string") {
      throw new Error(
        'The "data" argument must be of type string or an instance of Buffer, TypedArray, or DataView. Received type ' +
          typeof data +
          " (" +
          inspect(data) +
          ") "
      );
    } else {
      throw new Error("the 'data' argument is empty");
    }
  }

  return crypto.createHash("md5").update(data).digest("hex");
}

export default md5;
