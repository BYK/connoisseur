"use strict";

const connoisseur = require("./lib/connoisseur");
const fs = require("fs");
const concat = require("concat-stream");
const sourceFiles = require("yargs").argv._;

const useStdIn = process.argv.indexOf("--stdin") > -1;

const fixIndentation = code => code.replace(/(\r\n|\n|\r)/gm, "\n\t");

const displayFileErrors = function (fileInfo) {
    if (!fileInfo.errors)
        return;

    /* eslint-disable no-console */
    console.log(
        `Errors found for file ${fileInfo.path}:\n${
            fileInfo.errors.reduce((prev, errorData) =>
                    `${prev}\t${fixIndentation(errorData.code)}\t${
                    errorData.error || `→ Expected: ${errorData.expected}, Found: ${errorData.actual}`
                        }\n`
                , "")
            }`
    );
    /* eslint-enable no-console */
};

if (useStdIn) {
    process.stdin.pipe(concat({ encoding: "string" }, text => {
        const errors = {
            path: "from stdin",
            errors: connoisseur(text),
        };

        displayFileErrors(errors);
        process.exitCode = errors.errors ? 1 : 0;
    }));
} else {
    const errors = sourceFiles
        .map(filePath => ({
            path: filePath,
            errors: connoisseur(fs.readFileSync(filePath, "utf8")),
        }))
        .filter(fileInfo => fileInfo.errors.length);

    errors.forEach(error => displayFileErrors(error));
    process.exitCode = errors.length ? 1 : 0;
}