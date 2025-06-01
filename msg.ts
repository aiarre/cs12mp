import { CanvasMsg } from "./cs12242-mvu/src/canvas";
import { Schema as S } from "effect";

// In case we need to implement our own Msg types
export const Msg = S.Union(CanvasMsg);
export type Msg = typeof Msg.Type;
