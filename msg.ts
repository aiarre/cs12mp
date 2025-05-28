import { Schema as S } from "effect";
import { Egg, Model, initModel } from "./model";

export type Msg = typeof Msg.Type;
export const Msg = S.Union(
  //asynch events/interactions with the site
  S.TaggedStruct("MsgKeyUp", { key: S.String }),
  S.TaggedStruct("MsgKeyDown", { key: S.String }),
  S.TaggedStruct("MsgKeyTick", { key: S.String }),
  S.TaggedStruct("MsgError", { error: S.String }),
);

export const [MsgKeyUp, MsgKeyDown, MsgKeyTick, MsgError] = Msg.members;
//   S.TaggedStruct("MsgKeyLeft", {key: S.String}),
//   S.TaggedStruct("MsgKeyRight", {key: S.String}),
