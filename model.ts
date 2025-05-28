import { Schema as S } from "effect";

export type Model = typeof Model.Type;
export type Egg = typeof Egg.Type;
export type Direction = typeof Direction.Type;

export const Direction = S.Literal("NORTH", "SOUTH", "EAST", "WEST", "NONE");
export const Egg = S.Struct({
  x: S.Int,
  y: S.Int,
  width: S.Int,
  height: S.Int,
  hp: S.Int,
  maxHp: S.Int,
});
export const Model = S.Struct({
  // model of the app
  egg: Egg,
  error: S.String,
  direction: Direction,
});

export const initModel = Model.make({
  // initial state
  egg: {
    x: 100,
    y: 100,
    width: 15,
    height: 30,
    hp: 20,
    maxHp: 20,
  },
  error: "",
  direction: "NONE",
});
