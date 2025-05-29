import { Array, Option, pipe, Schema as S } from "effect";
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

export const Egg = S.Struct({
  x: S.Int,
  y: S.Int,
  width: S.Int,
  height: S.Int,
  hp: S.Int,
  maxHp: S.Int,
  direction: Direction,
  attackRange: S.Number,
  speed: S.Number,
});
export type Egg = typeof Egg.Type;

export const Eggnemy = S.Struct({
  x: S.Int,
  y: S.Int,
  width: S.Int,
  height: S.Int,
  // hp: S.Int,
  // maxHp: S.Int,
  speed: S.Number,
});
export type Eggnemy = typeof Eggnemy.Type;

export const Model = S.Struct({
  // model of the app
  fps: S.Int,
  width: S.Int,
  height: S.Int,
  egg: S.NullishOr(Egg),
  eggnemies: S.Array(Eggnemy),
  lastDamageTime: S.Number,
  error: S.String,
});
export type Model = typeof Model.Type;

export const createRandomEggnemy = () =>
  Eggnemy.make({
    x: Math.floor(Math.random() * settings.game.width),
    y: Math.floor(Math.random() * settings.game.height),
    width: settings.eggnemies.width,
    height: settings.eggnemies.height,
    speed: settings.eggnemies.speed,
  });

export const initModel = Model.make({
  // initial state
  fps: settings.game.fps,
  width: settings.game.width,
  height: settings.game.height,
  egg: {
    x: 100,
    y: 100,
    width: settings.egg.width,
    height: settings.egg.height,
    hp: settings.egg.initialHp,
    maxHp: settings.egg.initialHp,
    direction: "NONE",
    attackRange: settings.egg.attackRange,
    speed: settings.egg.speed,
  },
  eggnemies: pipe(
    Array.range(1, settings.eggnemies.initialCount),
    Array.map(() => createRandomEggnemy()),
  ),
  lastDamageTime: Date.now(),
  error: "",
});
