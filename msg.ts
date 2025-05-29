// import { MsgKeyDown, MsgMouseDown, MsgTick } from "cs12242-mvu/src/canvas";
// import { Schema as S } from "effect";

// export const Msg = S.Union(MsgKeyDown, MsgMouseDown, MsgTick);
// export type Msg = typeof Msg.Type;

import { Schema as S } from "effect";

export type Msg = typeof Msg.Type;
export const Msg = S.Union(
  //asynch events/interactions with the site
  S.TaggedStruct("MsgTick", {}),
  S.TaggedStruct("MsgKeyDown", { key: S.String }),
  S.TaggedStruct("MsgKeyUp", { key: S.String }),
  S.TaggedStruct("MsgError", { error: S.String }),
  S.TaggedStruct("MsgUserTouchedEggnemy", {}),
  S.TaggedStruct("MsgUserAttacks", {}),
);

export const [
  MsgTick,
  MsgKeyDown,
  MsgKeyUp,
  MsgError,
  MsgUserTouchedEggnemy,
  MsgUserAttacks,
] = Msg.members;
