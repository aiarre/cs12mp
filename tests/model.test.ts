import { describe, it, expect, beforeEach } from "vitest";
import { initModel, Model } from "../model";
import * as settings from "../settings.json";

let model: Model;
beforeEach(() => {
  model = initModel;
});

describe("#model", () => {
  it("world of model initializes with valid parameters", () => {
    expect(model.world).toBeDefined();
    expect(model.world.width).toBeGreaterThan(0);
    expect(model.world.height).toBeGreaterThan(0);
    expect(model.world.center).toBeDefined();
    expect(model.world.center.x).toBeGreaterThanOrEqual(0);
    expect(model.world.center.x).toBeLessThanOrEqual(model.world.width);
    expect(model.world.center.y).toBeGreaterThanOrEqual(0);
    expect(model.world.center.y).toBeLessThanOrEqual(model.world.height);
  });

  it("egg is initialized with valid parameters", () => {
    expect(model.egg).toBeDefined();

    expect(model.egg?.x).toBeGreaterThanOrEqual(0);
    expect(model.egg?.x).toBeLessThanOrEqual(
      model.world.width - (model.egg?.width ?? 0),
    );

    expect(model.egg?.y).toBeGreaterThanOrEqual(0);
    expect(model.egg?.y).toBeLessThanOrEqual(
      model.world.height - (model.egg?.height ?? 0),
    );

    expect(model.egg?.width).toBeGreaterThan(0);
    expect(model.egg?.height).toBeGreaterThan(0);

    expect(model.egg?.hp).toBeGreaterThan(0);
    expect(model.egg?.maxHp).toBeGreaterThan(0);
    expect(model.egg?.direction).toBe("NONE");
    expect(model.egg?.isAttacking).toBe(false);
    expect(model.egg?.attackRange).toBeGreaterThan(0);
  });

  it("eggnemies are initialized with valid parameters", () => {
    for (const eggnemy of model.eggnemies) {
      expect(eggnemy).toBeDefined();

      expect(eggnemy.x).toBeGreaterThanOrEqual(0);
      expect(eggnemy.x).toBeLessThanOrEqual(
        model.world.width - (eggnemy.width ?? 0),
      );

      expect(eggnemy.y).toBeGreaterThanOrEqual(0);
      expect(eggnemy.y).toBeLessThanOrEqual(
        model.world.height - (eggnemy.height ?? 0),
      );

      expect(eggnemy.width).toBeGreaterThan(0);
      expect(eggnemy.height).toBeGreaterThan(0);

      expect(eggnemy.hp).toBeGreaterThan(0);
      expect(eggnemy.maxHp).toBeGreaterThan(0);
      expect(eggnemy.speed).toBeGreaterThan(0);
    }
  });

  it("boss is null at start of game", () => {
    expect(model.boss).toBeNull();
  });

  it("state is initialized with valid parameters", () => {
    expect(model.state).toBeDefined();
    expect(model.state.isGameOver).toBe(false);
    expect(model.state.elapsedTime).toBe(0);
    expect(model.state.defeatedEggnemiesCount).toBe(0);
    expect(model.state.hasBossAlreadySpawned).toBe(false);
    expect(model.state.lastDamageTime).toBeDefined();
    expect(model.state.leaderboard).toBeDefined();
    expect(model.state.leaderboard.length).toBe(0);
    expect(model.state.startTime).toBeDefined();
    expect(model.state.startTime).toBeGreaterThan(0);
  });

  it("settings are initialized with valid parameters", () => {
    expect(model.settings).toBeDefined();
    expect(model.settings.bossSpawnThreshold).toBeGreaterThan(0);
    expect(model.settings.victoryText).toBeDefined();
    expect(model.settings.errorText).toBeDefined();
  });

  it("checks if all parameters from settings.json are present in the model", () => {
    expect(model.world.width).toStrictEqual(settings.game.world.width);
    expect(model.world.height).toStrictEqual(settings.game.world.height);

    expect(model.egg?.width).toStrictEqual(settings.egg.width);
    expect(model.egg?.height).toStrictEqual(settings.egg.height);
    expect(model.egg?.hp).toStrictEqual(settings.egg.initialHp);
    expect(model.egg?.maxHp).toStrictEqual(settings.egg.initialHp);
    expect(model.egg?.attackRange).toStrictEqual(settings.egg.attackRange);

    expect(model.eggnemies.length).toBe(settings.eggnemies.initialCount);

    for (const eggnemy of model.eggnemies) {
      expect(eggnemy.width).toStrictEqual(settings.eggnemies.width);
      expect(eggnemy.height).toStrictEqual(settings.eggnemies.height);
      expect(eggnemy.hp).toStrictEqual(settings.eggnemies.initialHp);
      expect(eggnemy.maxHp).toStrictEqual(settings.eggnemies.initialHp);
      expect(eggnemy.speed).toStrictEqual(settings.eggnemies.speed);
    }

    expect(model.settings.bossSpawnThreshold).toStrictEqual(
      settings.game.bossSpawnThreshold,
    );
    expect(model.settings.eggnemySpawningRatePerTick).toStrictEqual(
      settings.game.eggnemySpawningRatePerTick,
    );
    expect(model.settings.victoryText).toStrictEqual(settings.game.victoryText);
    expect(model.settings.errorText).toStrictEqual(settings.game.errorText);
  });
});
