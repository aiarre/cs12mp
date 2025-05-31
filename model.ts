import { Array, pipe, Schema as S } from "effect";
import * as settings from "./settings.json";

export const Direction = S.Literal("NORTH", "SOUTH", "EAST", "WEST", "NONE");
export type Direction = typeof Direction.Type;

// Alternative to `export type Struct = typeof Struct.Type` as per
// Effect.ts documentation:
// https://effect.website/docs/schema/getting-started/
/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface GameObject extends S.Schema.Type<typeof GameObject> {}
export interface Egg extends S.Schema.Type<typeof Egg> {}
export interface Eggnemy extends S.Schema.Type<typeof Eggnemy> {}
export interface Boss extends S.Schema.Type<typeof Boss> {}
export interface World extends S.Schema.Type<typeof World> {}
export interface GameSettings extends S.Schema.Type<typeof GameSettings> {}
export interface GameState extends S.Schema.Type<typeof GameState> {}
export interface Model extends S.Schema.Type<typeof Model> {}
/* eslint-enable @typescript-eslint/no-empty-object-type */

// Basically HasXYWidthHeight
export const GameObject = S.Struct({
  x: S.Int,
  y: S.Int,
  width: S.Int,
  height: S.Int,
});

// I feel like this is getting to be too much...
export const Egg = S.Struct({
  ...GameObject.fields,
  hp: S.Int,
  maxHp: S.Int,
  direction: Direction,
  isAttacking: S.Boolean,
  attackRange: S.Number,
  speed: S.Number,
  attackDamage: S.Number,
});
const initEgg: Egg = Egg.make({
  x: 100,
  y: 100,
  width: settings.egg.width,
  height: settings.egg.height,
  hp: settings.egg.initialHp,
  maxHp: settings.egg.initialHp,
  direction: "NONE",
  isAttacking: false,
  attackRange: settings.egg.attackRange,
  speed: settings.egg.speed,
  attackDamage: settings.egg.attackDamage,
});

export const Eggnemy = S.Struct({
  ...GameObject.fields,
  hp: S.Int,
  maxHp: S.Int,
  speed: S.Number,
});
export const createRandomEggnemy = (world: World) =>
  Eggnemy.make({
    x: Math.floor(Math.random() * (world.width - settings.eggnemies.width)),
    y: Math.floor(Math.random() * (world.height - settings.eggnemies.height)),
    width: settings.eggnemies.width,
    height: settings.eggnemies.height,
    hp: settings.eggnemies.initialHp,
    maxHp: settings.eggnemies.initialHp,
    speed: settings.eggnemies.speed,
  });

export const Boss = S.Struct({
  ...GameObject.fields,
  hp: S.Int,
  maxHp: S.Int,
  speed: S.Number,
});
export const createBoss = (world: World) =>
  Boss.make({
    x: Math.floor(Math.random() * world.width + 50),
    y: Math.floor(Math.random() * world.height + 50),
    width: settings.boss.width,
    height: settings.boss.height,
    hp: settings.boss.initialHp,
    maxHp: settings.boss.initialHp,
    speed: settings.boss.speed,
  });

export const World = S.Struct({
  width: S.Int,
  height: S.Int,
  // Used to determine how to render the world on-screen.
  // center x, y will be rendered at the center of the screen
  center: S.Struct({
    x: S.Int,
    y: S.Int,
  }),
});
const initWorld: World = World.make({
  width: settings.game.world.width,
  height: settings.game.world.height,
  center: {
    // By default, sync this to the egg.
    x: Math.floor(100 + settings.egg.width / 2),
    y: Math.floor(100 + settings.egg.height / 2),
  },
});

export const Leaderboard = S.Array(S.String).pipe(S.maxItems(3));

// Configurable parameters for the game, should be adjustable via
// settings.json
export const GameSettings = S.Struct({
  // How many enemies should be defeated before the boss spawns
  bossSpawnThreshold: S.Int,
  // Probabiliy of spawning eggnemies per tick (frame)
  eggnemySpawningRatePerTick: S.Number,
  // Text to show once game is over
  victoryText: S.String,
  defeatText: S.String,
  // Error handling
  errorText: S.String,
});
const initGameSettings: GameSettings = GameSettings.make({
  bossSpawnThreshold: settings.game.bossSpawnThreshold,
  eggnemySpawningRatePerTick: settings.game.eggnemySpawningRatePerTick,
  victoryText: settings.game.victoryText,
  defeatText: settings.game.defeatText,
  errorText: settings.game.errorText,
});

// Encapsulates most "flags" or time-based events limits in the game,
// such as boss spawning or egg damage.
export const GameState = S.Struct({
  // Time-based events or limits (default format is Unix timestamp)
  startTime: S.Number,
  elapsedTime: S.Number,
  lastDamageTime: S.Number,
  // "Flag" variables
  isGameOver: S.Boolean,
  // One-time event flags
  hasBossAlreadySpawned: S.Boolean,
  // Game statistics
  defeatedEggnemiesCount: S.NonNegativeInt,
  leaderboard: Leaderboard,
});
const initGameState: GameState = GameState.make({
  startTime: Date.now(),
  elapsedTime: 0,
  lastDamageTime: Date.now(),
  isGameOver: false,
  hasBossAlreadySpawned: false,
  defeatedEggnemiesCount: 0,
  leaderboard: [],
});

export const Model = S.Struct({
  // Model of the "game world"
  world: World,
  egg: S.NullishOr(Egg),
  eggnemies: S.Array(Eggnemy),
  boss: S.NullishOr(Boss),

  // Other game events / statistics to keep track of
  settings: GameSettings,
  state: GameState,
});

export const createNewModel = () => {
  const eggX = Math.floor(Math.random() * initWorld.width - initEgg.width);
  const eggY = Math.floor(Math.random() * initWorld.height - initEgg.height);
  return Model.make({
    world: {
      ...initWorld,
      center: {
        x: Math.floor(eggX + initEgg.width / 2),
        y: Math.floor(eggY + initEgg.height / 2),
      },
    },
    egg: {
      ...initEgg,
      x: eggX,
      y: eggY,
    },
    eggnemies: pipe(
      Array.range(1, settings.eggnemies.initialCount),
      Array.map(() => createRandomEggnemy(initWorld)),
    ),
    boss: null,
    settings: initGameSettings,
    state: {
      ...initGameState,
      startTime: Date.now(),
      lastDamageTime: Date.now(),
    },
  });
};

export const initModel = createNewModel();
