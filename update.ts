import { Array, Match, Order, pipe } from "effect";
import {
  Eggnemy,
  Model,
  createBoss,
  createNewModel,
  createRandomEggnemy,
} from "./model";
import { Msg } from "./msg";
import {
  formatTime,
  getCenterXY,
  isTouching,
  isWithinRange,
  moveEnemyTowardsEgg,
  getDirectionFromKey,
  getDxDyMultiplierFromDirection,
  keepEgghancementOpen,
} from "./utils";

/*
  Convention: tick*(model: Model): Model functions are run on MsgTick
*/

const sounds = {
  bossDefeated: "resources/sounds/bossDefeated.mp3",
  egghancementUnlocked: "resources/sounds/newEgghancement.mp3",
  eggDefeated: "resources/sounds/eggDefeated.mp3",
};

export function tickRemoveSounds(model: Model): Model {
  return Model.make({
    ...model,
    state: {
      ...model.state,
      soundToPlay: null,
    },
  });
}

export function tickUpdateElapsedTime(model: Model): Model {
  if (model.state.isGameOver && model.egg != null) return model;
  return {
    ...model,
    state: {
      ...model.state,
      elapsedTime: Date.now() - model.state.startTime,
    },
  };
}

export function tickMoveEgg(model: Model): Model {
  const egg = model.egg;
  const eggStats = model.eggStats;
  if (egg == null) {
    return Model.make({
      ...model,
      state: {
        ...model.state,
        isGameOver: true,
        soundToPlay: sounds.eggDefeated,
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
  const newEggX = Math.round(egg.x + eggStats.speed * dxMultiplier);
  const newEggY = Math.round(egg.y + eggStats.speed * dyMultiplier);

  return Model.make({
    ...model,
    egg: {
      ...egg,
      x: Math.max(minX, Math.min(newEggX, maxX)),
      y: Math.max(minY, Math.min(newEggY, maxY)),
    },
  });
}

export function tickAdjustWorldCenter(model: Model): Model {
  if (model.egg == null) return model;
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

export function tickMoveEnemiesTowardsEgg(model: Model): Model {
  if (model.egg == null) return model;
  const egg = model.egg;

  return Model.make({
    ...model,
    eggnemies: pipe(
      model.eggnemies,
      Array.map((en) =>
        moveEnemyTowardsEgg(en, egg, [
          ...model.eggnemies,
          ...(model.boss ? [model.boss] : []),
        ]),
      ),
    ),
    boss:
      model.boss != null
        ? moveEnemyTowardsEgg(model.boss, egg, [...model.eggnemies])
        : null,
  });
}

export function tickEnemyDamagesEgg(model: Model): Model {
  if (model.egg == null) return model;
  const egg = model.egg;

  const now = Date.now();
  if (now - model.state.lastDamageTime <= 1000) return model;

  const isEggnemyTouchingEgg = pipe(
    model.eggnemies,
    Array.some((en) => isTouching(en, egg)),
  );
  const isBossTouchingEgg = model.boss && isTouching(model.boss, egg);
  if (!isEggnemyTouchingEgg && !isBossTouchingEgg) return model;

  const eggnemyDamage: number = pipe(
    model.eggnemies,
    Array.filter((en: Eggnemy) => isTouching(en, egg)),
    Array.map((en: Eggnemy) => en.attackDamage),
    Array.reduce(0, (sum: number, dmg: number) => sum + dmg),
  );

  const bossDamage = isBossTouchingEgg ? model.boss.attackDamage : 0;
  const damage = eggnemyDamage + bossDamage;
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

export function tickEggAttacksEnemies(model: Model): Model {
  if (model.egg == null) return model;
  const egg = model.egg;
  const eggStats = model.eggStats;

  if (!egg.isAttacking) return model;

  if (model.eggStats.eggxperience >= model.settings.egghancementCost) {
    return Model.make({
      ...model,
      state: {
        ...model.state,
        isChoosingEgghancement: true,
        soundToPlay: sounds.egghancementUnlocked,
      },
    });
  }

  const [alive, defeated] = pipe(
    model.eggnemies,
    Array.map((en) => {
      if (isWithinRange(egg, en)) {
        return {
          ...en,
          hp: en.hp - eggStats.attackDamage,
        };
      }
      return en;
    }),
    Array.partition((en) => en.hp <= 0),
  );

  let boss = model.boss;
  let bossDefeated = false;
  let sound = null;
  if (boss && isWithinRange(egg, boss)) {
    boss = { ...boss, hp: boss.hp - eggStats.attackDamage };
    if (boss.hp <= 0) {
      sound = sounds.bossDefeated;
      boss = null;
      bossDefeated = true;
    }
  }

  //boss is either defeated or still alive.
  return Model.make({
    ...model,
    eggnemies: alive,
    boss: boss,
    state: {
      ...model.state,
      defeatedEggnemiesCount:
        model.state.defeatedEggnemiesCount + defeated.length,
      eggnemiesTillNextBoss: bossDefeated
        ? 0
        : model.state.eggnemiesTillNextBoss + defeated.length,
      hasBossAlreadySpawned: bossDefeated
        ? false
        : model.state.hasBossAlreadySpawned,
      bossesDefeated: bossDefeated
        ? model.state.bossesDefeated + 1
        : model.state.bossesDefeated,
      soundToPlay: sound,
    },
    eggStats: {
      ...model.eggStats,
      eggxperience: model.eggStats.eggxperience + defeated.length,
    },
  });
}

export function tickOccasionallySpawnEggnemy(model: Model): Model {
  if (model.egg == null) return model;
  const shouldSpawnEggnemies =
    Math.random() < model.settings.eggnemySpawningRatePerTick;
  if (!shouldSpawnEggnemies) {
    return model;
  } else {
    return Model.make({
      ...model,
      eggnemies: pipe(
        model.eggnemies,
        Array.appendAll(
          pipe(
            Array.range(1, Math.floor(Math.random() * 3) + 1),
            Array.map(() =>
              createRandomEggnemy(model.world, model.state.bossesDefeated),
            ),
          ),
        ),
      ),
    });
  }
}

export function tickSpawnBossIfNeeded(model: Model): Model {
  if (
    model.egg != null &&
    !model.state.hasBossAlreadySpawned &&
    model.boss == null &&
    model.state.eggnemiesTillNextBoss >= model.settings.bossSpawnThreshold
  ) {
    return Model.make({
      ...model,
      boss: createBoss(model.world, model.state.bossesDefeated),
      state: {
        ...model.state,
        hasBossAlreadySpawned: true,
        eggnemiesTillNextBoss: 0,
      },
    });
  }
  return model;
}

export function updateLeaderboard(model: Model): Model {
  return {
    ...model,
    state: {
      ...model.state,
      leaderboard: pipe(
        model.state.leaderboard,
        Array.append(formatTime(model.state.elapsedTime)),
        Array.sort(Order.reverse(Order.string)),
        Array.take(3),
      ),
    },
  };
}

export function restartGame(model: Model): Model {
  const newModel = createNewModel();
  return {
    ...newModel,
    state: {
      ...newModel.state,
      leaderboard: model.state.isGameOver
        ? updateLeaderboard(model).state.leaderboard
        : model.state.leaderboard,
    },
  };
}

export const update = (msg: Msg, model: Model) =>
  Match.value(msg).pipe(
    Match.tag("Canvas.MsgKeyDown", ({ key }): Model => {
      if (key.toUpperCase() == "R" && model.state.isGameOver) {
        return restartGame(model);
      } else if (model.egg && model.state.isChoosingEgghancement) {
        switch (key) {
          case "1":
            return Model.make({
              ...model,
              egg: {
                ...model.egg,
                hp: model.egg.hp + model.egghancements.hpUp,
                maxHp: model.egg.maxHp + model.egghancements.hpUp,
              },
              state: {
                ...model.state,
                isChoosingEgghancement: keepEgghancementOpen(
                  model.eggStats.eggxperience,
                  model.settings.egghancementCost,
                ),
              },
              eggStats: {
                ...model.eggStats,
                eggxperience:
                  model.eggStats.eggxperience - model.settings.egghancementCost,
              },
            });
          case "2":
            return Model.make({
              ...model,
              eggStats: {
                ...model.eggStats,
                attackDamage:
                  model.eggStats.attackDamage +
                  model.egghancements.attackDamageUp,
                eggxperience:
                  model.eggStats.eggxperience - model.settings.egghancementCost,
              },
              state: {
                ...model.state,
                isChoosingEgghancement: keepEgghancementOpen(
                  model.eggStats.eggxperience,
                  model.settings.egghancementCost,
                ),
              },
            });
          case "3":
            return Model.make({
              ...model,
              eggStats: {
                ...model.eggStats,
                speed: model.eggStats.speed + model.egghancements.speedUp,
                eggxperience:
                  model.eggStats.eggxperience - model.settings.egghancementCost,
              },
              state: {
                ...model.state,
                isChoosingEgghancement: keepEgghancementOpen(
                  model.eggStats.eggxperience,
                  model.settings.egghancementCost,
                ),
              },
            });
          default:
            return model;
        }
      }

      // Things that need the egg to run
      if (model.egg != null) {
        const egg = model.egg;
        const newDirection = getDirectionFromKey(key);

        if (newDirection !== null) {
          return Model.make({
            ...model,
            egg: {
              ...egg,
              direction: newDirection,
            },
          });
        } else if (key.toLowerCase() === "l") {
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
      if (model.egg == null) return model;
      const egg = model.egg;
      const pressedDirection = getDirectionFromKey(key);
      if (pressedDirection !== null) {
        return Model.make({
          ...model,
          egg: {
            ...egg,
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
      // Please don't play sounds over and over...
      model = tickRemoveSounds(model);
      if (model.state.isGameOver) return model;
      if (model.state.isChoosingEgghancement) return model;

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

    Match.tag("Canvas.MsgMouseDown", () => model),
    Match.tag("Canvas.MsgMouseUp", () => model),
    Match.exhaustive,
  );
