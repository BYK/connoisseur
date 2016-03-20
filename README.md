# connoisseur [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url]

DocTest-like comment assertion tool.

## Install from NPM

```sh
npm install connoisseur --save
```

## Use

```js
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
```

[npm-image]: https://img.shields.io/npm/v/connoisseur.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/connoisseur
[travis-image]: https://img.shields.io/travis/BYK/connoisseur/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/BYK/connoisseur
[coveralls-image]: https://img.shields.io/coveralls/BYK/connoisseur/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/BYK/connoisseur?branch=master
