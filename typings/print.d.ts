import { Range } from "vscode-languageserver";
interface Lines {
    start: number;
    end: number;
    total: number;
}
interface RawLine {
    number: number;
    code: string;
    isError?: boolean;
    isCursor?: boolean;
}
export declare function getLines({ start, end, total }: Lines): number[];
export declare function formatLine({ number, code, isError, isCursor }: RawLine): string;
export declare function formatCursor(range: Range): string;
export declare function printError(msg: string): void;
export declare function printMessage(msg: string): void;
export declare function printLog(msg: string): void;
export {};
