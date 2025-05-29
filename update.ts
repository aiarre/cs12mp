import { Array, Match, pipe } from "effect";
import { Direction, Egg, Eggnemy, Model } from "./model";
import { Msg } from "./msg";
import { isTouching, isWithinRange } from "./utils";

function getDirectionFromKey(key: string): Direction | null {
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

function tickMoveTowardsEgg(eggnemy: Eggnemy, egg: Egg): Eggnemy {
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

export function tickMoveEggnemiesTowardsEgg(model: Model): Model {
  if (model.egg == undefined) return model;
  const egg = model.egg;

  return Model.make({
    ...model,
    eggnemies: pipe(
      model.eggnemies,
      Array.map((en) => tickMoveTowardsEgg(en, egg)),
    ),
  });
}

export function tickDamageEgg(model: Model): Model {
  if (model.egg == undefined) return model;
  const egg = model.egg;

  const now = Date.now();
  if (now - model.lastDamageTime <= 1000) return model;

  const numEnemiesTouchingEgg = pipe(
    model.eggnemies,
    Array.countBy((en) => isTouching(en, egg)),
  );
  if (numEnemiesTouchingEgg < 1) return model;
  const newEggHp = egg.hp - numEnemiesTouchingEgg;

  return Model.make({
    ...model,
    lastDamageTime: now,
    egg:
      egg.hp > 0
        ? {
            ...egg,
            hp: newEggHp,
          }
        : null,
  });
}

export function tickDamageEggnemiesIfAttacking(model: Model): Model {
  if (model.egg == undefined) return model;
  const egg = model.egg;

  if (!egg.isAttacking) return model;

  return Model.make({
    ...model,
    eggnemies: pipe(
      model.eggnemies,
      Array.filter((en) => !isWithinRange(egg, en)),
    ),
  });
}

export const update = (msg: Msg, model: Model) =>
  Match.value(msg).pipe(
    Match.tag("MsgKeyDown", ({ key }): Model => {
      if (model.egg == undefined) return model;
      const egg = model.egg;
      const newDirection = getDirectionFromKey(key);
      // Change direction, but keep current direction if other keys are
      // pressed.
      if (newDirection !== null) {
        return Model.make({
          ...model,
          egg: {
            ...egg,
            direction: newDirection,
          },
        });
      }
      // Set attacking.
      else if (key.toLowerCase() === "l") {
        return Model.make({
          ...model,
          egg: {
            ...egg,
            isAttacking: true,
          },
        });
      }

      return model;
    }),

    Match.tag("MsgKeyUp", ({ key }): Model => {
      if (model.egg == undefined) return model;
      const egg = model.egg;
      const pressedDirection = getDirectionFromKey(key);
      if (pressedDirection !== null) {
        return Model.make({
          ...model,
          egg: {
            ...egg,
            // Only stop if lifted key is specifically current direction
            direction:
              pressedDirection === egg.direction ? "NONE" : egg.direction,
          },
        });
      }
      // Set attacking.
      else if (key.toLowerCase() === "l") {
        return Model.make({
          ...model,
          egg: {
            ...egg,
            isAttacking: false,
          },
        });
      }

      return model;
    }),

    Match.tag("MsgTick", (): Model => {
      // Note: The order in which we do things is important.
      return pipe(
        model,
        tickMoveEgg,
        // Damage enemies in range before anything!
        tickDamageEggnemiesIfAttacking,
        // Should we move before or after damaging? Not sure!
        tickMoveEggnemiesTowardsEgg,
        tickDamageEgg,
      );
    }),

    // Currently unused.
    Match.tag("MsgError", ({ error }) => {
      return {
        ...model,
        error: error,
      };
    }),
    Match.exhaustive,
  );
