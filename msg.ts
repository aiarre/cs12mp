import { MsgKeyDown, MsgMouseDown, MsgTick } from "cs12242-mvu/src/canvas";
import { Schema as S } from "effect";

export const Msg = S.Union(MsgKeyDown, MsgMouseDown, MsgTick);
export type Msg = typeof Msg.Type;
