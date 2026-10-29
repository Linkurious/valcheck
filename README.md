# Valcheck ![Valcheck npm version](https://img.shields.io/npm/v/@linkurious/valcheck.svg)
A NodeJS value checker.


## Development
- run tests: `npm run test` (TypeScript tests in `test/`, run with the native Node.js test runner, requires Node.js >= 22)
- run code style checker: `npm run lint` (uses ESLint with typescript-eslint, see `eslint.config.mjs`)
- build: `npm run build` (compiles with TypeScript 7, installed as the `typescript7` alias; the `typescript` package
  stays on 6.x because typescript-eslint needs its JavaScript API, which TypeScript 7 does not provide)

## Versioning and publishing
Versioning is handled by `bump2version`.
Publishing is handled by the ci.

## Installation

This package is now scoped under `@linkurious`.

If you have a version prior of 1.2.6 you will need to update with:

Then install:
```sh
npm uninstall valcheck
npm install @linkurious/valcheck
```
