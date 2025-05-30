import { Array, pipe, Schema as S } from "effect";
import * as settings from "./settings.json";

export const Direction = S.Literal("NORTH", "SOUTH", "EAST", "WEST", "NONE");
export type Direction = typeof Direction.Type;
export type GameObject = typeof GameObject.Type;
export type Egg = typeof Egg.Type;
export type Eggnemy = typeof Eggnemy.Type;
export type Boss = typeof Boss.Type;
export type World = typeof World.Type;
export type Model = typeof Model.Type;

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
});

export const Eggnemy = S.Struct({
  ...GameObject.fields,
  hp: S.Int,
  maxHp: S.Int,
  speed: S.Number,
});

export const Boss = S.Struct({
  ...GameObject.fields,
  hp: S.Int,
  maxHp: S.Int,
  speed: S.Number,
});

export const World = S.Struct({
  width: S.Int,
  height: S.Int,
  center: S.Struct({
    x: S.Int,
    y: S.Int,
  }),
});

export const Model = S.Struct({
  // model of the app ( think of this as the "world" )
  fps: S.Int,
  world: World,
  egg: S.NullishOr(Egg),
  eggnemies: S.Array(Eggnemy),
  boss: S.NullishOr(Boss),
  bossSpawnThreshold: S.Number,
  bossSpawned: S.Boolean,
  lastDamageTime: S.Number,
  defeatedCount: S.Number,
  startTime: S.Number,
  elapsedTime: S.Number,
  stopTime: S.Boolean,
  gameOver: S.Boolean,
  victoryText: S.String,
  error: S.String,
});

export const createRandomEggnemy = () =>
  Eggnemy.make({
    x: Math.floor(Math.random() * settings.game.screen.width + 50),
    y: Math.floor(Math.random() * settings.game.screen.height + 50),
    width: settings.eggnemies.width,
    height: settings.eggnemies.height,
    hp: settings.eggnemies.initialHp,
    maxHp: settings.eggnemies.initialHp,
    speed: settings.eggnemies.speed,
  });

export const createBoss = () =>
  Boss.make({
    x: Math.floor(Math.random() * settings.game.screen.width + 50),
    y: Math.floor(Math.random() * settings.game.screen.height + 50),
    width: settings.boss.width,
    height: settings.boss.height,
    hp: settings.boss.initialHp,
    maxHp: settings.boss.initialHp,
    speed: settings.boss.speed,
  });

export const initModel = Model.make({
  // initial state
  fps: settings.game.fps,
  world: {
    width: settings.game.world.width,
    height: settings.game.world.height,
    center: {
      // By default, sync this to the egg.
      x: 100 + settings.egg.width / 2,
      y: 100 + settings.egg.height / 2,
    },
  },
  egg: {
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
  },
  eggnemies: pipe(
    Array.range(1, settings.eggnemies.initialCount),
    Array.map(() => createRandomEggnemy()),
  ),
  boss: null,
  bossSpawnThreshold: settings.game.spawnThreshold,
  bossSpawned: settings.game.bossSpawned,
  lastDamageTime: Date.now(),
  defeatedCount: 0,
  startTime: Date.now(),
  elapsedTime: 0,
  stopTime: false,
  gameOver: false,
  victoryText: "",
  error: "",
});
