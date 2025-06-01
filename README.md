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

By default, this will expose a development server on
http://localhost:5173/. Open this page in your browser to play.

# Code organization

## General structure
The main structure of the code can be found in the following files and
folders:
+ [index.html](index.html): the main entry point of the app, a thin
  wrapper around the MVU logic
+ [model.ts](model.ts): where the game model is defined and initialized 
  with the correct parameters
+ [msg.ts](msg.ts): where the Msg types are defined
+ [view.ts](view.ts): defines how the game model is rendered using
  `cs12242-mvu/src/canvas` onto an HTML Canvas element.
+ [update.ts](update.ts): defines how the game model is transformed
  when dealing with keystrokes or game ticks (frames).
+ [index.ts](index.ts): combines the model, view, and update functions
  together and actually outputs DOM elements
+ [settings.json](settings.json): where different game paramters are
  stored and can be configured
+ [resources/](resources/): the folder where game sprites are stored
+ [tests/](tests/): the folder where the test suite is stored
+ [utils.ts](index.ts): miscellaneous functions imported by model.ts,
  view.ts, update.ts, and others


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

### update.test.ts
This file tests that the game's `update()` function transforms the
model in accordance with the specifications and uses the correct
parameters defined in [settings.json](settings.json).

Specifically, it tests the following:
+ Doesn't move egg by not pressing any key
+ Moves egg north when W is pressed then stops moving when released
+ Moves egg south when S is pressed then stops moving when released
+ Moves egg east when E is pressed then stops moving when released
+ Moves egg west when A is pressed then stops moving when released
+ Moves egg north when ArrowUp is pressed then stops moving when released
+ Moves egg south when ArrowDown is pressed then stops moving when released
+ Moves egg east when ArrowRight is pressed then stops moving when released
+ Moves egg west when ArrowLeft is pressed then stops moving when released
+ Should set egg to attacking when 'l' is pressed
+ Resets game when 'r' is pressed and game is over
+ Does not reset game when 'r' is pressed and game is not over
+ Moves egg right on MsgTick if it is facing east
+ Reduces eggnemy hp if egg attacks on MsgTick
+ Reduces boss hp if egg attacks on MsgTick
+ Doesn't damage either eggnemy or egg if both outside attack range
+ Doesn't damage either boss or egg if both outside attack range
+ Doesn't damage eggnemy if egg is not attacking on MsgTick
+ Doesn't damage boss if egg is not attacking on MsgTick
+ Reduces egg hp when boss is touching on MsgTick
+ Reduces egg hp when eggnemy is touching on MsgTick
+ Freezes game when choosing an egghancement
+ Spawns boss if threshold is met
+ Selects HP egghancement when key 1 pressed
+ Selects Attack egghancement when key 2 pressed
+ Selects Speed egghancement when key 3 pressed

TOTAL: 26 tests.


### view.test.ts
This file tests that the game's `view()` function correctly renders
the game's current state represented by its `Model` into the HTML
Canvas.

Specifically, it tests the following:
+ #view
  + returns a canvas node with correct dimensions and id
+ #renderEgg
  + renders an egg sprite
  + renders nothing if no egg exists
+ #renderEggnemies
  + renders sprite and HP text for each eggnemy
+ #renderBoss
  + returns empty array when boss is undefined
  + renders boss as sprite and HP text
+ #offsetElementBy
  + correctly offsets a SolidRectangle element
  + correctly offsets a Text element
+ #renderWorld
  + includes base world background and outline
  + includes egg, eggnemies, and boss elements
+ renderLeaderboard
  + renders at least 3 entries padded with '--:--' if needed
  + renders each time with correct y offset
  + first entry has 'Top' prefix
  + uses correct style
+ #renderUIElements
  + renders defeated count and elapsed time
  + restart message when game is over
  + renders leaderboard entries
+ #renderScreen
  + renders a black background rectangle covering the whole screen
  + offsets elements from renderWorld by the correct amount
  + includes UI elements

TOTAL: 20 tests.