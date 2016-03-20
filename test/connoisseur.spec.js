"use strict";

const path = require("path");
const chai = require("chai");
chai.use(require("dirty-chai"));

const expect = chai.expect;

const connoisseur = require(path.join(__dirname, "..", "lib", "connoisseur.js"));


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
