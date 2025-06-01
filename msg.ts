import { CanvasMsg } from "./cs12242-mvu/src/canvas";
import { Schema as S } from "effect";

export const Msg = S.Union(CanvasMsg);
export type Msg = typeof Msg.Type;
