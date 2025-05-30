import { Array, pipe, Schema as S } from "effect";
import * as settings from "./settings.json";

export const Direction = S.Literal("NORTH", "SOUTH", "EAST", "WEST", "NONE");
export type Direction = typeof Direction.Type;
export type GameObject = typeof GameObject.Type;
export type Egg = typeof Egg.Type;
export type Eggnemy = typeof Eggnemy.Type;
export type Boss = typeof Boss.Type;
export type Screen = typeof Screen.Type;
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

export const Screen = S.Struct({
  width: S.Int,
  height: S.Int,
});

export const World = S.Struct({
  width: S.Int,
  height: S.Int,
});

export const Model = S.Struct({
  // model of the app ( think of this as the "world" )
  fps: S.Int,
  screen: Screen,
  world: World,
  egg: S.NullishOr(Egg),
  eggnemies: S.Array(Eggnemy),
  boss: S.NullishOr(Boss),
  bossSpawnThreshold: S.Number,
  bossSpawned: S.Boolean,
  lastDamageTime: S.Number,
  defeatedCount: S.Number,
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
  screen: {
    width: settings.game.screen.width,
    height: settings.game.screen.height,
  },
  world: {
    width: settings.game.world.width,
    height: settings.game.world.height,
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
  error: "",
});
