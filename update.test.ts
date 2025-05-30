import { describe, it, expect } from "vitest";
import { update } from "./update"; // adjust the path
import { Msg } from "./msg";
import { Model } from "./model";

const model = Model.make({
  fps: 60,
  screen: { width: 800, height: 600 },
  world: { width: 800, height: 600 },
  egg: {
    width: 1,
    height: 1,
    x: 0,
    y: 0,
    hp: 10,
    maxHp: 10,
    direction: "SOUTH",
    isAttacking: false,
    attackRange: 1,
    speed: 1,
  },
  eggnemies: [],
  boss: null,
  bossSpawnThreshold: 10,
  bossSpawned: false,
  lastDamageTime: Date.now(),
  defeatedCount: 0,
  startTime: Date.now(),
  elapsedTime: 0,
  stopTime: false,
  gameOver: false,
  victoryText: "",
  error: "",
});

describe("#update", () => {
  it("moves the egg north on key press W", () => {
    const msg: Msg = { _tag: "MsgKeyDown", key: "w" };

    const updatedModel = update(msg, model);

    expect(updatedModel.egg?.direction).toBe("NORTH");
  });

  it("moves the egg south on key press S", () => {
    const msg: Msg = { _tag: "MsgKeyDown", key: "s" };

    const updatedModel = update(msg, model);

    expect(updatedModel.egg?.direction).toBe("SOUTH");
  });
  it("moves the egg east on key press D", () => {
    const msg: Msg = { _tag: "MsgKeyDown", key: "d" };

    const updatedModel = update(msg, model);

    expect(updatedModel.egg?.direction).toBe("EAST");
  });
});
