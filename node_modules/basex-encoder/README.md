# BaseX Encoder
BaseX Encoder is encoder / decoder for any base X.
It can encode / decode to and from string and buffer

[![Build Status](https://travis-ci.org/joonhocho/basex-encoder.svg?branch=master)](https://travis-ci.org/joonhocho/basex-encoder)
[![Coverage Status](https://coveralls.io/repos/github/joonhocho/basex-encoder/badge.svg?branch=master)](https://coveralls.io/github/joonhocho/basex-encoder?branch=master)
[![npm version](https://badge.fury.io/js/basex-encoder.svg)](https://badge.fury.io/js/basex-encoder)
[![Dependency Status](https://david-dm.org/joonhocho/basex-encoder.svg)](https://david-dm.org/joonhocho/basex-encoder)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)

\+ Written in TypeScript

\+ 0 dependencies

## Getting Started

First, install BaseX Encoder using npm.

```sh
npm install --save basex-encoder
# or
yarn add basex-encoder
```

> Note: BaseX Encoder assumes a JavaScript environment with global `Buffer`. Use [safe-buffer](https://github.com/feross/safe-buffer) to polyfill.


```typescript
import { encoder } from 'basex-encoder';

const base58 = encoder('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');

// or
const base6 = encoder('abcdef', 'utf8');

// encode from string to string
const encoded = base58.encode('text to encode');

// decode from string to string
const decoded = base58.decode(encoded);

// encode from buffer to string
const encoded = base58.encodeFromBuffer(rawBuffer);

// decode from string to buffer
const decodedBuffer = base58.decodeToBuffer(encoded);
```
