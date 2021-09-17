interface Options {
    workspace: string;
    srcDir?: string;
    onlyTemplate?: boolean;
    onlyTypeScript?: boolean;
    excludeDir?: string | string[];
}
export declare function check(options: Options): Promise<void>;
export {};
