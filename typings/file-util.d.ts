export declare function readFile(filePath: string): Promise<string>;
export declare function writeFile(filePath: string, data: string): Promise<void>;
export declare function globSync(patterns: string | string[]): string[];
export declare function extractTargetFileExtension(fileName: string): string | undefined;
