/* eslint-disable no-console */

"use strict";

const connoisseur = require("./lib/connoisseur");
const fs = require("fs");
const concat = require("concat-stream");
const argv = require("yargs")
    .options({
        /* eslint-disable id-length */
        f: {
            alias: "file",
            describe: "Use file as input",
            type: "boolean",
            default: false,
        },
        p: {
            alias: "check-prefix",
            describe: "Customize check prefix",
            type: "string",
            default: "→",
        },
        /* eslint-enable id-length */
    }).argv;

const useFile = argv.f;
const checkPrefix = ` ${argv.p} `;

const fixIndentation = code => code.replace(/(\r\n|\n|\r)/gm, "\n\t");

const displayFileErrors = function (fileInfo) {
    console.log(
        `Errors found for file ${fileInfo.path}:\n${
            fileInfo.errors.reduce((prev, errorData) =>
                `${prev}\t${fixIndentation(errorData.code)}\t${
                    errorData.error || `→ Expected: ${errorData.expected}, Found: ${errorData.actual}`
                }\n`
            , "")
        }`
    );
};

if (useFile) {
    const sourceFiles = argv._;

    const files = sourceFiles.filter(filePath => {
        if (fs.existsSync(filePath))
            return true;

        console.log(`File '${filePath}' doesn't exist.`);

        return false;
    });

    if (!files.length) {
        console.log("No files found.");
        process.exitCode = 1;
    }

    const errors = files.map(filePath => ({
        path: filePath,
        errors: connoisseur(fs.readFileSync(filePath, "utf8"), filePath, { checkPrefix }),
    }))
    .filter(fileInfo => fileInfo.errors.length);

    if (errors.length) {
        errors.forEach(displayFileErrors);
        process.exitCode = 1;
    } else {
        console.log("No errors found.");
        process.exitCode = 0;
    }
} else {
    process.stdin.pipe(concat({ encoding: "string" }, text => {
        const errors = {
            path: "STDIN",
            errors: connoisseur(text, "STDIN", { checkPrefix }),
        };

        if (errors.errors.length) {
            displayFileErrors(errors);
            process.exitCode = 1;
        } else {
            console.log("No errors found.");
            process.exitCode = 0;
        }
    }));
}
