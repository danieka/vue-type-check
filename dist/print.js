"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printLog = exports.printMessage = exports.printError = exports.formatCursor = exports.formatLine = exports.getLines = void 0;
const chalk_1 = __importDefault(require("chalk"));
const THRESHOLD = 2;
function getLines({ start, end, total }) {
    const min = Math.max(start - THRESHOLD, 0);
    const max = Math.min(end + THRESHOLD, total);
    const lines = [];
    for (let i = min; i <= max; i++) {
        lines.push(i);
    }
    return lines;
}
exports.getLines = getLines;
function formatLine({ number, code, isError, isCursor }) {
    const length = String(number).length;
    return [
        isError ? chalk_1.default.red(">") : " ",
        isCursor ? " ".repeat(length) : number,
        "|",
        code
    ].join(" ");
}
exports.formatLine = formatLine;
function formatCursor(range) {
    const isSameLine = range.end.line === range.start.line;
    const length = isSameLine ? range.end.character - range.start.character : 1;
    return formatLine({
        number: range.start.line,
        isCursor: true,
        isError: false,
        code: " ".repeat(range.start.character) + chalk_1.default.red("^").repeat(length)
    });
}
exports.formatCursor = formatCursor;
function printError(msg) {
    return console.log(chalk_1.default.red(msg));
}
exports.printError = printError;
function printMessage(msg) {
    return console.log(chalk_1.default.gray(msg));
}
exports.printMessage = printMessage;
function printLog(msg) {
    return console.log(msg);
}
exports.printLog = printLog;
