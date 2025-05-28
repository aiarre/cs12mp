import { Array, Match } from "effect";
import { type Direction, Model } from "./model";
import { Msg } from "./msg";

// export const [MsgKeyUp, MsgKeyDown, MsgKeyTick, MsgError] = Msg.members;

function getDirectionFromKey(key: string): Direction {
  // Kinda hacky, but it works.
  return Match.value(key).pipe(
    Match.when(
      (key) => key === "w" || key === "ArrowUp",
      () => "NORTH",
    ),
    Match.when(
      (key) => key === "s" || key === "ArrowDown",
      () => "SOUTH",
    ),
    Match.when(
      (key) => key === "a" || key === "ArrowLeft",
      () => "WEST",
    ),
    Match.when(
      (key) => key === "d" || key === "ArrowRight",
      () => "EAST",
    ),
    Match.orElse(() => "NONE"),
  ) as Direction;
}

// Currently, this only allows you to change direction by pressing WASD
// or an arrow key. The egg keeps moving even when no keys are pressed.
// This is a limitation of the cs12242-mvu library only exposing =
// MsgKeyDown.
export const update = (msg: Msg, model: Model) =>
  Match.value(msg).pipe(
    Match.tag("Canvas.MsgKeyDown", ({ key }) => {
      return {
        ...model,
        egg: {
          ...model.egg,
          direction: getDirectionFromKey(key),
        },
      };
    }),

    Match.tag("Canvas.MsgTick", () => {}),

    Match.tag("Canvas.MsgMouseDown", () => {
      // Do nothing for now.
    }),
    Match.exhaustive,
  );
