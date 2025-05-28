import { HashMap, Match, Schema as S } from "effect";

export type Model = typeof Model.Type;
export type Egg = typeof Egg.Type;

export const Egg = S.Struct({
  x: S.Number,
  y: S.Number,
  width: S.Number,
  height: S.Number,
  hp: S.Number,
  maxHp: S.Number,
});
export const Model = S.Struct({
  // model of the app
  egg: Egg,
  error: S.String,
  keyPressed: S.Array(S.String),
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
  keyPressed: [],
});
