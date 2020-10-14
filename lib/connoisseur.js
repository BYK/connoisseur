"use strict";

const espree = require("espree");
const util = require("util");
const vm = require("vm");


const DEFAULT_PARSER_OPTIONS = {
    range: true,
    comments: true,
    attachComment: true,
    ecmaVersion: 6,  // eslint-disable-line no-magic-numbers
};

const DEFAULT_OPTIONS = {
    parserOptions: DEFAULT_PARSER_OPTIONS,
};

module.exports = function (source, fileName, opts) {
    const options = Object.assign({}, DEFAULT_OPTIONS, opts);
    const parserOptions = Object.assign({}, options.parserOptions, DEFAULT_PARSER_OPTIONS);
    const checkPrefix = options.checkPrefix.trim();
    const checkPrefixLength = checkPrefix.length;

    return espree.parse(
        source,
        parserOptions
    ).comments.filter(
        comment => comment.value.trim().startsWith(checkPrefix)
    ).map((comment, index, comments) => ({
        node: comment,
        code: source.substring((comments[index - 1] || { range: [0, 0] }).range[1], comment.range[0]).trim(),
        expected: comment.value.trim().substr(checkPrefixLength).trim(),
    })).map(piece => {
        let actual;
        try {
            const result = vm.runInNewContext(piece.code, {}, {
                filename: fileName,
                displayErrors: false,
            });
            actual = util.inspect(result);
        } catch (error) {
            return {
                error,
                expected: piece.expected,
                node: piece.node,
                code: piece.code,
            };
        }

        return actual === piece.expected ? null : {
            actual,
            expected: piece.expected,
            node: piece.node,
            code: piece.code,
        };
    }).filter(Boolean);
};
