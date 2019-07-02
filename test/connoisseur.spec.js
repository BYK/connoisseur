"use strict";

const path = require("path");
const chai = require("chai");
chai.use(require("dirty-chai"));
const spawn = require("child_process").spawn;
const EOL = require("os").EOL;
const expect = chai.expect;

const connoisseur = require(path.join(__dirname, "..", "lib", "connoisseur.js"));

describe("connoisseur", () => {
    describe("cli", () => {
        describe("file input", () => {
            it("should print no error message for a valid file", done => {
                const proc = spawn("node", ["./index.js", "-f", "test/_fixtures/valid.1.js"]);
                proc.stdout.on("data", data => {
                    expect(data.toString()).to.be.equal("No errors found.\n");
                    done();
                });
            });

            it("should print errors for a file containing errors", done => {
                const proc = spawn("node", ["./index.js", "-f", "test/_fixtures/invalid.1.js"]);
                proc.stdout.on("data", data => {
                    expect(data.toString()).to.be.equal(
                        "Errors found for file test/_fixtures/invalid.1.js:\n\tconst time = 3 * 15;\n\ttime;\t→ Expected: 12, Found: 45\n\n"
                    );
                    done();
                });
            });

            it("should print no files found message when -f option is provided without file path", done => {
                const proc = spawn("node", ["./index.js", "-f"]);
                proc.stdout.on("data", data => {
                    expect(data.toString()).to.be.equal("No files found.\n");
                    done();
                });
            });
        });

        describe("stdin", () => {
            it("should print no error message for plain javascript ", done => {
                const proc = spawn("node", ["./index.js"]);
                proc.stdin.write(`var a = "foo"${EOL}`);
                proc.stdout.on("data", data => {
                    expect(data.toString()).to.be.equal("No errors found.\n");
                    done();
                });
                proc.stdin.end();
            });

            it("should print no error message for a valid javascript source with a valid connoisseur test", done => {
                const proc = spawn("node", ["./index.js"]);
                proc.stdin.write("[4, 9, 16].map(Math.sqrt);  // → [ 2, 3, 4 ]");
                proc.stdout.on("data", data => {
                    expect(data.toString()).to.be.equal("No errors found.\n");
                    done();
                });
                proc.stdin.end();
            });

            it("should print errors for a valid javascript source with an invalid connoisseur test", done => {
                const proc = spawn("node", ["./index.js"]);
                proc.stdin.write("[4, 9, 16].map(Math.sqrt);  // → [ 1, 2, 3 ]");
                proc.stdout.on("data", data => {
                    expect(data.toString()).to.be.equal(
                        "Errors found for file STDIN:\n\t[4, 9, 16].map(Math.sqrt);\t→ Expected: [ 1, 2, 3 ], Found: [ 2, 3, 4 ]\n\n"
                    );
                    done();
                });
                proc.stdin.end();
            });
        });
    });

    describe("lib", () => {
        it("should return an empty array for an empty string", () => {
            expect(connoisseur("")).to.be.empty();
        });

        it("should return an empty array for a simple line comment", () => {
            expect(connoisseur("// simple comment")).to.be.empty();
        });

        it("should return an empty array for a simple inline comment", () => {
            expect(connoisseur("/* simple comment */")).to.be.empty();
        });

        it("should return an empty array for valid assertions with line comments", () => {
            expect(connoisseur("3 * 5  // → 15")).to.be.empty();
        });

        it("should return an empty array for valid assertions with inline comments", () => {
            expect(connoisseur("3 * 5  /* → 15 */")).to.be.empty();
        });

        it("should return an array with assertion error for invalid assertions with line comments", () => {
            const result = connoisseur("3 * 5  // → 12");
            expect(result).to.not.be.empty();
            expect(result[0]).to.be.eql({
                actual: "15",
                expected: "12",
                code: "3 * 5",
                node: {
                    end: 14,
                    range: [7, 14],
                    start: 7,
                    type: "Line",
                    value: " → 12",
                },
            });
        });

        it("should return an array with assertion error for invalid assertions with inline comments", () => {
            const result = connoisseur("3 * 5  /* → 12 */");
            expect(result).to.not.be.empty();
            expect(result[0]).to.be.eql({
                actual: "15",
                expected: "12",
                code: "3 * 5",
                node: {
                    end: 17,
                    range: [7, 17],
                    start: 7,
                    type: "Block",
                    value: " → 12 ",
                },
            });
        });

        it("should return an array with the exception for code throwing exceptions", () => {
            const result = connoisseur("hello();  // → 12");
            expect(result).to.not.be.empty();
            expect(result[0]).to.be.eql({
                error: new Error("ReferenceError: hello is not defined"),
                expected: "12",
                code: "hello();",
                node: {
                    end: 17,
                    range: [10, 17],
                    start: 10,
                    type: "Line",
                    value: " → 12",
                },
            });
        });
    });
});
