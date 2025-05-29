import { Array, Match, Option, pipe } from "effect";
import { Direction, Egg, Eggnemy, Model } from "./model";
import { Msg } from "./msg";
import { isTouching, isWithinRange } from "./utils";

function getDirectionFromKey(key: string): Direction | null {
  // Kinda hacky, but it works.
  key = key.toLowerCase();
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
    Match.orElse(() => null),
  ) as Direction | null;
}

function getDxDyMultiplierFromDirection(
  direction: Direction,
): [-1 | 0 | 1, -1 | 0 | 1] {
  return Match.value(direction).pipe(
    Match.when("NORTH", () => [0, -1]),
    Match.when("SOUTH", () => [0, 1]),
    Match.when("WEST", () => [-1, 0]),
    Match.when("EAST", () => [1, 0]),
    Match.when("NONE", () => [0, 0]),
    Match.exhaustive,
  ) as [-1 | 0 | 1, -1 | 0 | 1];
}

export function tickMoveEgg(model: Model): Model {
  const egg = model.egg;
  if (egg == undefined) return model;

  const minX = 0;
  const maxX = model.width - egg.width;
  const minY = 0;
  const maxY = model.height - egg.height;
  const [dxMultiplier, dyMultiplier] = getDxDyMultiplierFromDirection(
    egg.direction,
  );

  return Model.make({
    ...model,
    egg: {
      ...egg,
      x: Math.max(minX, Math.min(egg.x + egg.speed * dxMultiplier, maxX)),
      y: Math.max(minY, Math.min(egg.y + egg.speed * dyMultiplier, maxY)),
    },
  });
}

export function tickFollowEgg(eggnemy: Eggnemy, egg: Egg): Eggnemy {
  const dx = egg.x - eggnemy.x;
  const dy = egg.y - eggnemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return eggnemy;

  return {
    ...eggnemy,
    // Round up so that eggnemies will always move
    x: Math.ceil(eggnemy.x + (dx / dist) * eggnemy.speed),
    y: Math.ceil(eggnemy.y + (dy / dist) * eggnemy.speed),
  };
}

export const update = (msg: Msg, model: Model) =>
  Match.value(msg).pipe(
    Match.tag("MsgKeyDown", ({ key }): Model => {
      if (model.egg == undefined) return model;
      const egg = model.egg;
      return Model.make({
        ...model,
        egg: {
          ...egg,
          // Keep current direction if other keys are pressed
          direction: getDirectionFromKey(key) ?? egg.direction,
        },
      });
    }),

    Match.tag("MsgKeyUp", ({ key }): Model => {
      if (model.egg == undefined) return model;
      const egg = model.egg;
      return Model.make({
        ...model,
        egg: {
          ...egg,
          // Only stop if lifted key is specifically current direction
          direction:
            getDirectionFromKey(key) === egg.direction ? "NONE" : egg.direction,
        },
      });
    }),

    Match.tag("MsgTick", (): Model => {
      // Probably shouldn't put this at the start, but for now, it's OK.
      if (model.egg == undefined) return model;
      const egg = model.egg;

      return pipe(
        model,
        (model) => tickMoveEgg(model),
        (model) => ({
          ...model,
          eggnemies: pipe(
            model.eggnemies,
            Array.map((en) => tickFollowEgg(en, egg)),
          ),
        }),
      );
    }),

    Match.tag("MsgUserTouchedEggnemy", () => {
      if (model.egg == undefined) return model;
      const egg = model.egg;
      const now = Date.now();
      const isTouchingEggnemy = pipe(
        model.eggnemies,
        Array.some((en) => isTouching(egg, en)),
      );

      let newHp = egg.hp;
      let shouldUpdateHp = false;

      if (isTouchingEggnemy && now - model.lastDamageTime >= 1000) {
        newHp = egg.hp - 1;
        shouldUpdateHp = true;

        // TODO: Extract out.
        if (newHp <= 0) {
          return {
            ...model,
            egg: Option.none(),
          };
        }
      }
      return {
        ...model,
        egg: {
          ...egg,
          hp: shouldUpdateHp ? newHp : egg.hp,
        },
        lastDamageTime: shouldUpdateHp ? now : model.lastDamageTime,
      };
    }),

    Match.tag("MsgUserAttacks", () => {
      if (model.egg == undefined) return model;
      const egg = model.egg;
      return Model.make({
        ...model,
        eggnemies: pipe(
          model.eggnemies,
          Array.filter((en) => !isWithinRange(egg, en)),
        ),
      });
    }),

    // Currently unused.
    // Match.tag("MsgError", ({ error }) => {
    //   return {
    //     ...model,
    //     error: error,
    //   };
    // }),
    Match.exhaustive,
  );
