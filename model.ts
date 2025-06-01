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
export interface Egghancements extends S.Schema.Type<typeof Egghancements> {}
export interface EggStats extends S.Schema.Type<typeof EggStats> {}
export interface Model extends S.Schema.Type<typeof Model> {}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export const GameObject = S.Struct({
  x: S.Int,
  y: S.Int,
  width: S.Int,
  height: S.Int,
});

export const Egg = S.Struct({
  ...GameObject.fields,
  hp: S.Int,
  maxHp: S.Int,
  direction: Direction,
  isAttacking: S.Boolean,
  attackRange: S.Int,
});

export const Eggnemy = S.Struct({
  ...GameObject.fields,
  hp: S.Int,
  maxHp: S.Int,
  speed: S.Int,
  attackDamage: S.Int,
});

export const Boss = S.Struct({
  ...GameObject.fields,
  hp: S.Int,
  maxHp: S.Int,
  speed: S.Int,
  attackDamage: S.Int,
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

export const Leaderboard = S.Array(S.String).pipe(S.maxItems(3));

// Configurable parameters for the game, should be adjustable via
// settings.json
export const GameSettings = S.Struct({
  // How many enemies should be defeated before the boss spawns
  bossSpawnThreshold: S.Int,
  // Probabiliy of spawning eggnemies per tick (frame)
  eggnemySpawningRatePerTick: S.Number,
  egghancementCost: S.Int,
  // Text to show once game is over
  gameOverText: S.String,
  // Error handling
  errorText: S.String,
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
  bossesDefeated: S.NonNegativeInt,
  // Game statistics
  eggnemiesTillNextBoss: S.NonNegativeInt,
  defeatedEggnemiesCount: S.NonNegativeInt,
  leaderboard: Leaderboard,
  isChoosingEgghancement: S.Boolean,
});

const Egghancements = S.Struct({
  hpUp: S.NonNegativeInt,
  speedUp: S.NonNegativeInt,
  attackDamageUp: S.NonNegativeInt,
});

const EggStats = S.Struct({
  speed: S.NonNegativeInt,
  attackDamage: S.NonNegativeInt,
  eggxperience: S.NonNegativeInt,
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
  egghancements: Egghancements,
  eggStats: EggStats,
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
});

export const createRandomEggnemy = (world: World, multiplier: number) =>
  Eggnemy.make({
    x: Math.floor(Math.random() * (world.width - settings.eggnemies.width)),
    y: Math.floor(Math.random() * (world.height - settings.eggnemies.height)),
    width: settings.eggnemies.width,
    height: settings.eggnemies.height,
    hp: settings.eggnemies.initialHp + multiplier,
    maxHp: settings.eggnemies.initialHp + multiplier,
    speed: settings.eggnemies.speed + multiplier,
    attackDamage: settings.eggnemies.attackDamage + multiplier,
  });

export const createBoss = (world: World, multiplier: number) =>
  Boss.make({
    x: Math.floor(Math.random() * world.width + 50),
    y: Math.floor(Math.random() * world.height + 50),
    width: settings.boss.width,
    height: settings.boss.height,
    hp: settings.boss.initialHp + multiplier,
    maxHp: settings.boss.initialHp + multiplier,
    speed: settings.boss.speed + multiplier,
    attackDamage: settings.boss.attackDamage + multiplier,
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

const initGameSettings: GameSettings = GameSettings.make({
  bossSpawnThreshold: settings.game.bossSpawnThreshold,
  eggnemySpawningRatePerTick: settings.game.eggnemySpawningRatePerTick,
  egghancementCost: settings.game.egghancementCost,
  gameOverText: settings.game.gameOverText,
  errorText: settings.game.errorText,
});

const initEgghancements = Egghancements.make({
  hpUp: settings.egghancement.hpUp,
  speedUp: settings.egghancement.speedUp,
  attackDamageUp: settings.egghancement.attackDamageUp,
});

const initEggStats: EggStats = EggStats.make({
  speed: settings.eggStats.speed,
  attackDamage: settings.eggStats.attackDamage,
  eggxperience: 0,
});

const initGameState: GameState = GameState.make({
  startTime: Date.now(),
  elapsedTime: 0,
  lastDamageTime: Date.now(),
  isGameOver: false,
  hasBossAlreadySpawned: false,
  bossesDefeated: 0,

  defeatedEggnemiesCount: 0,
  eggnemiesTillNextBoss: 0,
  leaderboard: [],
  isChoosingEgghancement: false,
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
      Array.map(() => createRandomEggnemy(initWorld, 0)),
    ),
    boss: null,
    settings: initGameSettings,
    state: {
      ...initGameState,
      startTime: Date.now(),
      lastDamageTime: Date.now(),
    },
    egghancements: initEgghancements,
    eggStats: initEggStats,
  });
};

export const initModel = createNewModel();
