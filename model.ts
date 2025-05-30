import { Array, pipe, Schema as S } from "effect";
import * as settings from "./settings.json";

export const Direction = S.Literal("NORTH", "SOUTH", "EAST", "WEST", "NONE");
export type Direction = typeof Direction.Type;

// Basically HasXYWidthHeight
export const GameObject = S.Struct({
  x: S.Int,
  y: S.Int,
  width: S.Int,
  height: S.Int,
});
export type GameObject = typeof GameObject.Type;

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
export type Egg = typeof Egg.Type;

export const Eggnemy = S.Struct({
  ...GameObject.fields,
  hp: S.Int,
  maxHp: S.Int,
  speed: S.Number,
});
export type Eggnemy = typeof Eggnemy.Type;

export const Screen = S.Struct({
  width: S.Int,
  height: S.Int,
});

export const World = S.Struct({
  width: S.Int,
  height: S.Int,
});
export type Screen = typeof Screen.Type;

export const Model = S.Struct({
  // model of the app ( think of this as the "world" )
  fps: S.Int,
  // width: S.Int,
  // height: S.Int,
  screen: Screen,
  world: World,
  egg: S.NullishOr(Egg),
  eggnemies: S.Array(Eggnemy),
  lastDamageTime: S.Number,
  defeatedCount: S.Number,
  error: S.String,
});
export type Model = typeof Model.Type;

export const createRandomEggnemy = () =>
  Eggnemy.make({
    x: Math.floor(Math.random() * settings.game.screen.width),
    y: Math.floor(Math.random() * settings.game.screen.height),
    width: settings.eggnemies.width,
    height: settings.eggnemies.height,
    hp: settings.eggnemies.initialHp,
    maxHp: settings.eggnemies.initialHp,
    speed: settings.eggnemies.speed,
  });

export const initModel = Model.make({
  // initial state
  fps: settings.game.fps,
  // width: settings.game.world.width,
  // height: settings.game.world.height,
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
  lastDamageTime: Date.now(),
  defeatedCount: 0,
  error: "",
});
