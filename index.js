"use strict";

const connoisseur = require("./lib/connoisseur");
const fs = require("fs");
const sourceFiles = require("yargs").argv._;

const fixIndentation = code => code.replace(/(\r\n|\n|\r)/gm, "\n\t");

const displayErrors = function (errors) {
    errors.forEach(fileInfo => {
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
    });
};

const errors = sourceFiles
    .map(filePath => ({
        path: filePath,
        errors: connoisseur(fs.readFileSync(filePath, "utf8")),
    }))
    .filter(fileInfo => fileInfo.errors.length);

const exitCode = errors.length > 0 ? 1 : 0;

displayErrors(errors);

process.exit(exitCode);
