// Not sure if this is allowed as of now, but I hope it is.
import {
  canvasView,
  Clear,
  SolidRectangle,
  Text,
  type CanvasElement,
} from "cs12242-mvu/src/canvas";
import { Model } from "./model";
import type { Msg } from "./msg";

export const view = canvasView<Model, Msg>(
  800,
  600,
  60,
  "mpDisplay",
  (model: Model): CanvasElement[] => {
    return [
      Clear.make({
        color: "black",
      }),
      SolidRectangle.make({
        color: "white",
        x: model.egg.x,
        y: model.egg.y,
        width: model.egg.width,
        height: model.egg.height,
      }),
      Text.make({
        color: "red",
        font: "sans-serif",
        fontSize: 16,
        textAlign: "left",
        x: 10,
        y: 25,
        text: `HP: ${model.egg.hp}/${model.egg.maxHp}`,
      }),
    ];
  },
);
