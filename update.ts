import { Match } from "effect";
import { type Direction, Egg, Model } from "./model";
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

function moveEgg(
  egg: Egg,
  dx: number,
  dy: number,
  width: number,
  height: number,
): Egg {
  const minX = 0;
  const maxX = width - egg.width;
  const minY = 0;
  const maxY = height - egg.height;
  const x = Math.max(minX, Math.min(egg.x + dx, maxX));
  const y = Math.max(minY, Math.min(egg.y + dy, maxY));
  return { ...egg, x: x, y: y };
}

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

    Match.tag("Canvas.MsgTick", () => {
      return {
        ...model,
        egg: Match.value(model.egg.direction).pipe(
          Match.when("NORTH", () =>
            moveEgg(model.egg, 0, -model.settings.movementSpeed, 800, 600),
          ),
          Match.when("SOUTH", () =>
            moveEgg(model.egg, 0, model.settings.movementSpeed, 800, 600),
          ),
          Match.when("EAST", () =>
            moveEgg(model.egg, model.settings.movementSpeed, 0, 800, 600),
          ),
          Match.when("WEST", () =>
            moveEgg(model.egg, -model.settings.movementSpeed, 0, 800, 600),
          ),
          Match.when("NONE", () => model.egg),
          Match.exhaustive,
        ),
      };
    }),

    Match.tag("Canvas.MsgMouseDown", () => {
      // Do nothing for now.
    }),
    Match.exhaustive,
  );
