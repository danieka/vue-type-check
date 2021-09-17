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
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTargetFileExtension = exports.globSync = exports.writeFile = exports.readFile = void 0;
const fs = __importStar(require("fs"));
const glob = __importStar(require("glob"));
function readFile(filePath) {
    return exec(fs.readFile, filePath, 'utf8');
}
exports.readFile = readFile;
function writeFile(filePath, data) {
    return exec(fs.writeFile, filePath, data);
}
exports.writeFile = writeFile;
function globSync(patterns) {
    if (typeof patterns === "string") {
        patterns = [patterns];
    }
    return patterns.reduce((acc, pattern) => {
        return acc.concat(glob.sync(pattern));
    }, []);
}
exports.globSync = globSync;
function extractTargetFileExtension(fileName) {
    const result = /^.*\.(.*)$/.exec(fileName);
    if (result) {
        return result[1];
    }
}
exports.extractTargetFileExtension = extractTargetFileExtension;
function exec(fn, ...args) {
    return new Promise((resolve, reject) => {
        fn.apply(undefined, args.concat((err, res) => {
            if (err)
                reject(err);
            resolve(res);
        }));
    });
}
