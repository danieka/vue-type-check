"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = void 0;
const path = __importStar(require("path"));
const vscode_languageserver_1 = require("vscode-languageserver");
const javascript_1 = require("vue-language-server/dist/modes/script/javascript");
const serviceHost_1 = require("vue-language-server/dist/services/typescriptService/serviceHost");
const languageModelCache_1 = require("vue-language-server/dist/embeddedSupport/languageModelCache");
const embeddedSupport_1 = require("vue-language-server/dist/embeddedSupport/embeddedSupport");
const typescript_1 = __importDefault(require("typescript"));
const progress_1 = __importDefault(require("progress"));
const print_1 = require("./print");
const file_util_1 = require("./file-util");
let validLanguages = ["vue"];
function check(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { workspace, onlyTemplate = false, onlyTypeScript = false, excludeDir, } = options;
        if (onlyTypeScript) {
            validLanguages = ["ts", "tsx", "vue"];
        }
        const srcDir = options.srcDir || options.workspace;
        const excludeDirs = typeof excludeDir === "string" ? [excludeDir] : excludeDir;
        const docs = yield traverse(srcDir, onlyTypeScript, excludeDirs);
        yield getDiagnostics({ docs, workspace, onlyTemplate });
    });
}
exports.check = check;
function traverse(root, onlyTypeScript, excludeDirs) {
    return __awaiter(this, void 0, void 0, function* () {
        let targetFiles = (0, file_util_1.globSync)(path.join(root, onlyTypeScript ? `**/*.{${validLanguages.join(",")}}` : "**/*.vue"));
        if (excludeDirs) {
            const filterTargets = excludeDirs.map((dir) => path.resolve(dir)).join("|");
            targetFiles = targetFiles.filter((targetFile) => !new RegExp(`^(?:${filterTargets}).*$`).test(targetFile));
        }
        let files = yield Promise.all(targetFiles.map((absFilePath) => __awaiter(this, void 0, void 0, function* () {
            const src = yield (0, file_util_1.readFile)(absFilePath);
            return {
                absFilePath,
                fileExt: (0, file_util_1.extractTargetFileExtension)(absFilePath),
                src,
            };
        })));
        if (onlyTypeScript) {
            files = files.filter(({ src, fileExt }) => {
                if (fileExt !== "vue" || !hasScriptTag(src)) {
                    return true;
                }
                return isTs(src) || isImportOtherTs(src);
            });
        }
        const docs = files.map(({ absFilePath, src, fileExt }) => vscode_languageserver_1.TextDocument.create(`file://${absFilePath}`, fileExt, 0, src));
        return docs;
    });
}
function getDiagnostics({ docs, workspace }) {
    return __awaiter(this, void 0, void 0, function* () {
        const documentRegions = (0, languageModelCache_1.getLanguageModelCache)(10, 60, (document) => (0, embeddedSupport_1.getVueDocumentRegions)(document));
        const scriptRegionDocuments = (0, languageModelCache_1.getLanguageModelCache)(10, 60, (document) => {
            const vueDocument = documentRegions.refreshAndGet(document);
            return vueDocument.getSingleTypeDocument("script");
        });
        let hasError = false;
        try {
            const serviceHost = (0, serviceHost_1.getServiceHost)(typescript_1.default, workspace, scriptRegionDocuments);
            const scriptMode = yield (0, javascript_1.getJavascriptMode)(serviceHost, scriptRegionDocuments, workspace);
            const bar = new progress_1.default("checking [:bar] :current/:total", {
                total: docs.length,
                width: 20,
                clear: true,
            });
            for (const doc of docs) {
                let scriptResults = [];
                if (scriptMode.doValidation) {
                    console.log("did the ts check");
                    scriptResults = scriptMode.doValidation(doc);
                }
                const results = scriptResults;
                if (results.length) {
                    hasError = true;
                    for (const result of results) {
                        const total = doc.lineCount;
                        const lines = (0, print_1.getLines)({
                            start: result.range.start.line,
                            end: result.range.end.line,
                            total,
                        });
                        (0, print_1.printError)(`Error in ${doc.uri}`);
                        (0, print_1.printMessage)(`${result.range.start.line}:${result.range.start.character} ${result.message}`);
                        for (const line of lines) {
                            const code = doc
                                .getText({
                                start: { line, character: 0 },
                                end: { line, character: Infinity },
                            })
                                .replace(/\n$/, "");
                            const isError = line === result.range.start.line;
                            (0, print_1.printLog)((0, print_1.formatLine)({ number: line, code, isError }));
                            if (isError) {
                                (0, print_1.printLog)((0, print_1.formatCursor)(result.range));
                            }
                        }
                    }
                }
                bar.tick();
            }
        }
        catch (error) {
            hasError = true;
            console.error(error);
        }
        finally {
            documentRegions.dispose();
            scriptRegionDocuments.dispose();
            process.exit(hasError ? 1 : 0);
        }
    });
}
function hasScriptTag(src) {
    return /.*\<script.*\>/.test(src);
}
function isTs(src) {
    return /.*\<script.*lang="tsx?".*\>/.test(src);
}
function isImportOtherTs(src) {
    return /.*\<script.*src=".*".*\>/.test(src);
}
