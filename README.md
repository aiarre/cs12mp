# cs12mp
This is a TypeScript implementation of **Egg Rally**, inspired by the
game Vampire Survivors, as part of our CS12 project (MP) submission.



## Getting Started
First, install the dependencies needed for the project. You may opt to
use other package managers such as pnpm or bun, but, in general, run:
```
npm install
```

### cs12242-mvu
Take note that this project uses a *vendored* version of 
[cs12242-mvu](https://github.com/UPD-CS12-242/cs12242-mvu) with two
key changes:
+ `MsgKeyUp` and `MsgMouseUp` events have been added
  ([bf63563](https://github.com/louie-github/cs12242-mvu/commit/bf63563b9c35bb8c8eaf06fdd55b305d1f7702e7))
+ `CanvasImage` loading has been fixed
  ([3fdfa05](https://github.com/louie-github/cs12242-mvu/commit/3fdfa05b7974a09ac5085d1d9884a9331e5324a0))

This fork of cs12242-mvu may be found [here](https://github.com/louie-github/cs12242-mvu).

## Running
To start the Vite server, run the command:
```bash
npm run serve
```

Alternatively, you can also run:
```bash
npx vite
```

By default, this will expose a development server on http://localhost:5173/.


## Test suite
To run tests, run the command:
```
npm test
```

This will run the tests located in the [tests/](tests) subfolder. There 
are a grand total of **53 tests** defined by `it(...)` functions.

Specifically, `vitest` will run the following test suites:

### model.test.ts
This file tests that the game `Model` is initialized with sensible
and correct parameters based on [settings.json](settings.json).

Specifically, it tests the following:
+ World of model initializes with valid parameters
+ Egg is initialized with valid parameters
+ Eggnemies are initialized with valid parameters
+ Boss is null at start of game
+ State is initialized with valid parameters
+ Settings are initialized with valid parameters
+ Checks if all parameters from settings.json are present in the model

TOTAL: 7 tests.
