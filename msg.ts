// import { MsgKeyDown, MsgMouseDown, MsgTick } from "cs12242-mvu/src/canvas";
// import { Schema as S } from "effect";

// export const Msg = S.Union(MsgKeyDown, MsgMouseDown, MsgTick);
// export type Msg = typeof Msg.Type;

import { Schema as S } from "effect";
import { h } from "cs12242-mvu/src";

export type Msg = typeof Msg.Type;
export const Msg = S.Union(
  //asynch events/interactions with the site
  S.TaggedStruct("MsgKeyTick", {}),
  S.TaggedStruct("MsgKeyDown", { key: S.String }),
  S.TaggedStruct("MsgError", { error: S.String }),
  S.TaggedStruct("MsgUserTouchedEggnemy", {}),
  S.TaggedStruct("MsgEggnemyFollows", {}),
  S.TaggedStruct("MsgUserAttacks", {}),
  
);

export const [MsgKeyTick, MsgKeyDown, MsgError, MsgUserTouchedEggnemy, MsgEggnemyFollows, MsgUserAttacks] = Msg.members;