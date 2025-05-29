import { Schema as S, Option } from "effect";
import { spawnEggnemies } from "./utils";

export type Model = typeof Model.Type;
export type Egg = typeof Egg.Type;
export type Direction = typeof Direction.Type;
export type Eggnemy = typeof Eggnemy.Type;

export const Direction = S.Literal("NORTH", "SOUTH", "EAST", "WEST", "NONE");


export const Egg = S.Struct({
  x: S.Int,
  y: S.Int,
  width: S.Int,
  height: S.Int,
  hp: S.Int,
  maxHp: S.Int,
  direction: Direction,
});

export const Eggnemy = S.Struct({
  x: S.Int,
  y: S.Int,
  width: S.Int,
  height: S.Int,
  // hp: S.Int,
  // maxHp: S.Int,
  speed: S.Number,
});

export const Model = S.Struct({
  // model of the app
  egg: S.Option(Egg),
  eggnemies: S.Array(Eggnemy),
  lastDamageTime: S.Number,
  error: S.String,
  settings: S.Struct({
    movementSpeed: S.Number,
  }),
});

export const initModel = Model.make({
  // initial state
  egg: Option.some({
    x: 100,
    y: 100,
    width: 15,
    height: 30,
    hp: 20,
    maxHp: 20,
    direction: "NONE",
  }),
  eggnemies: spawnEggnemies(5),
  lastDamageTime: Date.now(),
  error: "",
  settings: {
    movementSpeed: 8,
  },
});
