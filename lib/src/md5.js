"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.md5 = void 0;
var crypto_1 = __importDefault(require("crypto"));
var util_1 = require("util");
/**
 * PHP MD5 Equivalent
 * @param data
 * @returns
 */
function md5(data) {
    if (typeof data !== "string" || !data) {
        if (typeof data !== "string") {
            throw new Error('The "data" argument must be of type string or an instance of Buffer, TypedArray, or DataView. Received type ' +
                typeof data +
                " (" +
                (0, util_1.inspect)(data) +
                ") ");
        }
        else {
            throw new Error("the 'data' argument is empty");
        }
    }
    return crypto_1["default"].createHash("md5").update(data).digest("hex");
}
exports.md5 = md5;
exports["default"] = md5;
