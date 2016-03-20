"use strict";

const connoisseur = require("./lib/connoisseur");

const CODE = `
"use strict";

// lalala
[4, 9, 16].map(Math.sqrt);  // → [ 2, 3, 4 ]
const sth = function () { return "lalala" === 1; };  // asd
sth();  // eslint-disable-line no-unused-expressions
// → false
/* eslint-disable no-unused-expressions */
"test str";
"test";  // → 'test'
/* eslint-enable no-unused-expressions */
const time = 3 * 15;  // eslint-disable-line no-unused-vars
// endcomm
`;

const result = connoisseur(CODE, "stdin");

const exitCode = result.reduce((code, piece) => {
    /* eslint-disable no-console */
    let returnCode;

    if (piece.error) {
        returnCode = 2;
        console.log(
            "Error: \n",
            piece,
            piece.error.stack
                .split("\n")
                .slice(0, 2)
                .join("\n")
        );
    } else {
        returnCode = 1;
        console.log("Failed: \n", piece);
    }

    return Math.max(returnCode, code);
    /* eslint-enable no-console */
});

process.exit(exitCode);
