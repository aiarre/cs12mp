import { Match } from "effect";
import { Option } from "effect";
import { Direction, Egg, Model, Eggnemy } from "./model";
import { Msg } from "./msg";
import { isTouching, isWithinRange } from "./utils";
import { modelRun } from "effect/FastCheck";

export const [
  MsgKeyTick,
  MsgKeyDown,
  MsgError,
  MsgUserTouchedEggnemy,
  MsgEggnemyFollows,
  MsgUserAttacks,
] = Msg.members;

function getDirectionFromKey(key: string): Direction {
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
    Match.orElse(() => "NONE"),
  ) as Direction;
}

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

export function followEgg(eggnemy: Eggnemy, egg: Egg): Eggnemy {
  const dx = egg.x - eggnemy.x;
  const dy = egg.y - eggnemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return eggnemy;

  return {
    ...eggnemy,
    x: eggnemy.x + (dx / dist) * eggnemy.speed,
    y: eggnemy.y + (dy / dist) * eggnemy.speed,
  };
}

export const update = (msg: Msg, model: Model) =>
  Match.value(msg).pipe(
    Match.tag("MsgKeyDown", ({ key }) => {
      return {
        ...model,
        egg: {
          ...model.egg,
          direction: getDirectionFromKey(key),
        },
      };
    }),

    Match.tag("MsgKeyTick", () => {
      if (!model.egg) return model;

      return {
        ...model,
        egg: Option.match(model.egg, {
          onSome: (egg: Egg) =>
            Match.value(egg.direction).pipe(
              Match.when("NORTH", () => moveEgg(egg, 0, -egg.speed, 800, 600)),
              Match.when("SOUTH", () => moveEgg(egg, 0, egg.speed, 800, 600)),
              Match.when("EAST", () => moveEgg(egg, egg.speed, 0, 800, 600)),
              Match.when("WEST", () => moveEgg(egg, -egg.speed, 0, 800, 600)),
              Match.when("NONE", () => egg),
              Match.exhaustive,
            ),
          onNone: () => model.egg,
        }),
      };
    }),

    Match.tag("MsgEggnemyFollows", () => {
      return Match.value(model.egg).pipe(
        Match.tag("Some", ({ value: egg }: { value: Egg }) => ({
          ...model,
          eggnemies: model.eggnemies.map((e) => followEgg(e, egg)),
        })),
        Match.tag("None", () => model),
        Match.exhaustive,
      );
    }),

    Match.tag("MsgUserTouchedEggnemy", () => {
      return Match.value(model.egg).pipe(
        Match.tag("Some", ({ value: egg }: { value: Egg }) => {
          const now = Date.now();
          const touching_eggnemies = model.eggnemies.some((en) =>
            isTouching(egg, en),
          );

          let newHp = egg.hp;
          let shouldUpdateHp = false;

          if (touching_eggnemies && now - model.lastDamageTime >= 1000) {
            newHp = egg.hp - 1;
            shouldUpdateHp = true;

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
        Match.tag("None", () => model),
        Match.exhaustive,
      );
    }),

    Match.tag("MsgUserAttacks", () => {
      return Option.match(model.egg, {
        onSome: (egg: Egg) => ({
          ...model,
          eggnemies: model.eggnemies.filter((en) => !isWithinRange(egg, en)),
        }),
        onNone: () => model,
      });
    }),

    Match.tag("MsgError", ({ error }) => {
      return {
        ...model,
        error: error,
      };
    }),
    Match.exhaustive,
  );
