import { Array, Match, pipe } from "effect";
import {
  Boss,
  Direction,
  Egg,
  Eggnemy,
  Model,
  createBoss,
  createRandomEggnemy,
} from "./model";
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
  if (egg == undefined) {
    return Model.make({
      ...model,
      gameOver: true,
      victoryText: "You Lose!",
      stopTime: true,
    });
  }

  const minX = model.screen.width / 2 - model.world.width / 2;
  const maxX = minX + model.world.width - egg.width;
  const minY = model.screen.height / 2 - model.world.height / 2;
  const maxY = minY + model.world.height - egg.height;
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

function tickMoveTowardsEgg(enemy: Eggnemy | Boss, egg: Egg): Eggnemy | Boss {
  const dx = egg.x - enemy.x;
  const dy = egg.y - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return enemy;

  return {
    ...enemy,
    // Round up so that eggnemies will always move
    x: Math.ceil(enemy.x + (dx / dist) * enemy.speed),
    y: Math.ceil(enemy.y + (dy / dist) * enemy.speed),
  };
}

export function tickMoveEnemiesTowardsEgg(model: Model): Model {
  if (model.egg == undefined) return model;
  const egg = model.egg;

  return Model.make({
    ...model,
    eggnemies: pipe(
      model.eggnemies,
      Array.map((en) => tickMoveTowardsEgg(en, egg)),
    ),
    boss:
      model.boss != undefined ? tickMoveTowardsEgg(model.boss, egg) : undefined,
  });
}

export function tickEnemyDamagesEgg(model: Model): Model {
  if (model.egg == undefined) return model;
  const egg = model.egg;

  const now = Date.now();
  if (now - model.lastDamageTime <= 1000) return model;

  const isEggnemyTouchingEgg = pipe(
    model.eggnemies,
    Array.some((en) => isTouching(en, egg)),
  );
  const isBossTouchingEgg = model.boss && isTouching(model.boss, egg);

  if (!isEggnemyTouchingEgg && !isBossTouchingEgg) return model;

  let damage = isEggnemyTouchingEgg ? 1 : 0;
  if (isBossTouchingEgg) damage += 3;

  const newEggHp = egg.hp - damage;

  return Model.make({
    ...model,
    lastDamageTime: now,
    egg:
      newEggHp > 0
        ? {
            ...egg,
            hp: newEggHp,
          }
        : null,
  });
}

export function tickDamageEnemyIfAttacking(model: Model): Model {
  if (model.egg == undefined) return model;
  const egg = model.egg;

  if (!egg.isAttacking) return model;

  const [alive, defeated] = pipe(
    model.eggnemies,
    Array.map((en) => {
      if (isWithinRange(egg, en)) {
        return {
          ...en,
          hp: en.hp - 1,
        };
      }
      return en;
    }),
    Array.partition((en) => en.hp <= 0),
  );

  let boss = model.boss;
  if (boss && isWithinRange(egg, boss)) {
    boss = { ...boss, hp: boss.hp - 1 };
    if (boss.hp <= 0) {
      boss = undefined; // Boss defeated, remove it
      if (boss == undefined) {
        return Model.make({
          ...model,
          gameOver: true,
          victoryText: "You Win!",
          stopTime: true,
          boss: undefined,
        });
      }
    }
  }
  return Model.make({
    ...model,
    eggnemies: alive,
    boss: boss,
    defeatedCount: model.defeatedCount + defeated.length,
  });
}

export function tickOccassionalSpawnEggnemy(model: Model): Model {
  if (model.egg == undefined) return model;
  let newEggnemies: Eggnemy[] = [];
  if (Math.random() < 0.01) {
    newEggnemies = Array.map(
      Array.range(1, Math.floor(Math.random() * 3) + 1),
      createRandomEggnemy,
    );
  }

  return Model.make({
    ...model,
    eggnemies: [...model.eggnemies, ...newEggnemies],
  });
}

export function tickBossSpawn(model: Model): Model {
  if (model.egg == undefined) return model;

  if (model.boss) return model;

  if (
    !model.bossSpawned &&
    model.boss === undefined &&
    model.defeatedCount >= model.bossSpawnThreshold
  ) {
    return Model.make({
      ...model,
      boss: createBoss(),
      bossSpawned: true,
    });
  }
  return model;
  // Spawn a boss eggnemy if eggnemies count killed is reached.
}

// export function checkEndGame(model: Model): Model {
//   if (model.egg && model.boss && model.boss.hp <= 0) {
//     return Model.make({
//       ...model,
//       gameOver: true,
//       boss: undefined,
//       victoryText: "You Win!",
//       stopTime: true,
//       egg: {
//         ...model.egg,
//         direction: "NONE",
//         isAttacking: false,
//         speed: 0,
//       },
//       eggnemies: Array.map(model.eggnemies, (en) => ({
//         ...en,
//         speed: 0,
//       }))
//     })
//   }
//   return model;
// }

export const update = (msg: Msg, model: Model) =>
  Match.value(msg).pipe(
    Match.tag("Canvas.MsgKeyDown", ({ key }): Model => {
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

    Match.tag("Canvas.MsgKeyUp", ({ key }): Model => {
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

    Match.tag("Canvas.MsgTick", (): Model => {
      if (model.gameOver) return model;
      const now = Date.now();
      const elapsed = now - model.startTime;
      // Note: The order in which we do things is important.
      return pipe(
        {
          ...model,
          elapsedTime: elapsed,
        },
        // checkEndGame, //check if game ended first before moving
        tickOccassionalSpawnEggnemy,
        tickBossSpawn,
        tickMoveEgg,
        // Damage enemies in range before anything!
        tickDamageEnemyIfAttacking,
        // Should we move before or after damaging? Not sure!
        tickMoveEnemiesTowardsEgg,
        tickEnemyDamagesEgg,
      );
    }),

    // Do nothing otherwise
    Match.tag("Canvas.MsgMouseDown", () => model),
    Match.tag("Canvas.MsgMouseUp", () => model),
    Match.exhaustive,
  );
