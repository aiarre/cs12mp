import { Array, Match, pipe } from "effect";
import {
  Boss,
  Direction,
  Egg,
  Eggnemy,
  Model,
  createBoss,
  createNewModel,
  createRandomEggnemy,
  initModel,
} from "./model";
import { Msg } from "./msg";
import { getCenterXY, isTouching, isWithinRange } from "./utils";

function getDirectionFromKey(key: string): Direction | null {
  // Kinda hacky, but it works.
  return Match.value(key).pipe(
    Match.when(
      (key) => key.toLowerCase() === "w" || key === "ArrowUp",
      () => "NORTH",
    ),
    Match.when(
      (key) => key.toLowerCase() === "s" || key === "ArrowDown",
      () => "SOUTH",
    ),
    Match.when(
      (key) => key.toLowerCase() === "a" || key === "ArrowLeft",
      () => "WEST",
    ),
    Match.when(
      (key) => key.toLowerCase() === "d" || key === "ArrowRight",
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

/*
  Convention: tick*(model: Model): Model functions are run on MsgTick
*/

function tickUpdateElapsedTime(model: Model): Model {
  if (model.state.isGameOver && model.egg != undefined) return model;
  return {
    ...model,
    state: {
      ...model.state,
      elapsedTime: Date.now() - model.state.startTime,
    },
  };
}

function tickMoveEgg(model: Model): Model {
  const egg = model.egg;
  if (egg == undefined) {
    return Model.make({
      ...model,
      state: {
        ...model.state,
        isGameOver: true,
      },
    });
  }

  const minX = 0;
  const maxX = model.world.width - egg.width;
  const minY = 0;
  const maxY = model.world.height - egg.height;
  const [dxMultiplier, dyMultiplier] = getDxDyMultiplierFromDirection(
    egg.direction,
  );
  const newEggX = Math.round(egg.x + egg.speed * dxMultiplier);
  const newEggY = Math.round(egg.y + egg.speed * dyMultiplier);

  return Model.make({
    ...model,
    egg: {
      ...egg,
      x: Math.max(minX, Math.min(newEggX, maxX)),
      y: Math.max(minY, Math.min(newEggY, maxY)),
    },
  });
}

function tickAdjustWorldCenter(model: Model): Model {
  if (model.egg == undefined) return model;
  const egg = model.egg;

  const [centerX, centerY] = getCenterXY(egg);
  return {
    ...model,
    world: {
      ...model.world,
      center: {
        x: centerX,
        y: centerY,
      },
    },
  };
}

function moveEnemyTowardsEgg(
  eggnemy: Eggnemy | Boss,
  egg: Egg,
): Eggnemy | Boss {
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

function tickMoveEnemiesTowardsEgg(model: Model): Model {
  if (model.egg == undefined) return model;
  const egg = model.egg;

  return Model.make({
    ...model,
    eggnemies: pipe(
      model.eggnemies,
      Array.map((en) => moveEnemyTowardsEgg(en, egg)),
    ),
    boss:
      model.boss != undefined
        ? moveEnemyTowardsEgg(model.boss, egg)
        : undefined,
  });
}

function tickEnemyDamagesEgg(model: Model): Model {
  if (model.egg == undefined) return model;
  const egg = model.egg;

  const now = Date.now();
  if (now - model.state.lastDamageTime <= 1000) return model;

  const isEggnemyTouchingEgg = pipe(
    model.eggnemies,
    Array.some((en) => isTouching(en, egg)),
  );
  const isBossTouchingEgg = model.boss && isTouching(model.boss, egg);
  if (!isEggnemyTouchingEgg && !isBossTouchingEgg) return model;

  const damage = (isEggnemyTouchingEgg ? 1 : 0) + (isBossTouchingEgg ? 3 : 0);
  const newEggHp = egg.hp - damage;
  return Model.make({
    ...model,
    egg:
      newEggHp > 0
        ? {
            ...egg,
            hp: newEggHp,
          }
        : null,
    state: {
      ...model.state,
      lastDamageTime: now,
    },
  });
}

function tickEggAttacksEnemies(model: Model): Model {
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
          boss: null,
          state: {
            ...model.state,
            isGameOver: true,
          },
        });
      }
    }
  }
  return Model.make({
    ...model,
    eggnemies: alive,
    boss: boss,
    state: {
      ...model.state,
      defeatedEggnemiesCount:
        model.state.defeatedEggnemiesCount + defeated.length,
    },
  });
}

function tickOccasionallySpawnEggnemy(model: Model): Model {
  if (model.egg == undefined) return model;
  // 10% chance of spawning 1-3 eggnemies per tick
  return Model.make({
    ...model,
    eggnemies: pipe(
      model.eggnemies,
      Array.appendAll(
        Math.random() < 0.01
          ? pipe(
              Array.range(1, Math.floor(Math.random() * 3) + 1),
              Array.map(() => createRandomEggnemy(model.world)),
            )
          : [],
      ),
    ),
  });
}

function tickSpawnBossIfNeeded(model: Model): Model {
  if (
    model.egg != undefined &&
    !model.state.hasBossAlreadySpawned &&
    model.boss == undefined &&
    model.state.defeatedEggnemiesCount >= model.settings.bossSpawnThreshold
  ) {
    return Model.make({
      ...model,
      boss: createBoss(model.world),
      state: {
        ...model.state,
        hasBossAlreadySpawned: true,
      },
    });
  }
  return model;
  // Spawn a boss eggnemy if eggnemies count killed is reached.
}

function restartGame(model: Model): Model {
  return createNewModel();
}

export const update = (msg: Msg, model: Model) =>
  Match.value(msg).pipe(
    Match.tag("Canvas.MsgKeyDown", ({ key }): Model => {
      if (key.toUpperCase() == "R" && model.state.isGameOver) {
        return restartGame(model);
      }

      // Things that need the egg to run
      if (model.egg != undefined) {
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
      // Only stop everything when boss is defeated
      if (model.state.isGameOver) {
        if (model.egg != undefined) return model;
        else return tickUpdateElapsedTime(model);
      }
      // Note: The order in which we do things is important.
      return pipe(
        model,
        // Enemy spawning
        tickOccasionallySpawnEggnemy,
        tickSpawnBossIfNeeded,
        // Egg (player) movement
        tickMoveEgg,
        tickAdjustWorldCenter,
        // Attack enemies before calculating damage (!)
        tickEggAttacksEnemies,
        // Enemy movement and attack behavior
        tickMoveEnemiesTowardsEgg,
        tickEnemyDamagesEgg,
        // Do this after everything else
        tickUpdateElapsedTime,
      );
    }),

    // Do nothing otherwise
    Match.tag("Canvas.MsgMouseDown", () => model),
    Match.tag("Canvas.MsgMouseUp", () => model),
    Match.exhaustive,
  );
