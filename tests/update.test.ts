import { describe, it, expect, beforeEach } from "vitest";
import { Msg } from "../msg";
import { Boss, initModel, Model } from "../model";
import { 
  update,
  tickUpdateElapsedTime,
  tickMoveEgg,
  tickAdjustWorldCenter,
  tickMoveEnemiesTowardsEgg,
  tickEnemyDamagesEgg,
  tickEggAttacksEnemies,
  tickOccasionallySpawnEggnemy,
  tickSpawnBossIfNeeded,
  updateLeaderboard,
  restartGame
 } from "../update";


let model: Model;
beforeEach(() => {
  model = initModel;
});

describe("#update", () => {
  it("doesn't move egg by not pressing any key", () => {
    const msg1: Msg = { _tag: "Canvas.MsgKeyUp", key: "w" };
    const updatedModel = update(msg1, model);
    expect(updatedModel.egg?.direction).toStrictEqual("NONE");
  });

  it("moves the egg north on KeyDown W then egg stops after KeyUp W", () => {
    const msg1: Msg = { _tag: "Canvas.MsgKeyDown", key: "w" };
    let updatedModel = update(msg1, model);
    expect(updatedModel.egg?.direction).toStrictEqual("NORTH");

    const msg2: Msg = { _tag: "Canvas.MsgKeyUp", key: "w" };
    updatedModel = update(msg2, model);
    expect(updatedModel.egg?.direction).toStrictEqual("NONE");
  });

  it("moves the egg south on KeyDown S then egg stops after KeyUp S", () => {
    const msg1: Msg = { _tag: "Canvas.MsgKeyDown", key: "s" };
    let updatedModel = update(msg1, model);
    expect(updatedModel.egg?.direction).toStrictEqual("SOUTH");

    const msg2: Msg = { _tag: "Canvas.MsgKeyUp", key: "s" };
    updatedModel = update(msg2, model);
    expect(updatedModel.egg?.direction).toStrictEqual("NONE");
  });

  it("moves the egg east on KeyDown D then egg stops after KeyUp D", () => {  
    const msg1: Msg = { _tag: "Canvas.MsgKeyDown", key: "d" };
    let updatedModel = update(msg1, model);
    expect(updatedModel.egg?.direction).toStrictEqual("EAST");

    const msg2: Msg = { _tag: "Canvas.MsgKeyUp", key: "d" };
    updatedModel = update(msg2, model);
    expect(updatedModel.egg?.direction).toStrictEqual("NONE");
  });

  it("moves the egg west on KeyDown A then egg stops after KeyUp A", () => {
    const msg1: Msg = { _tag: "Canvas.MsgKeyDown", key: "a" };
    let updatedModel = update(msg1, model);
    expect(updatedModel.egg?.direction).toStrictEqual("WEST");

    const msg2: Msg = { _tag: "Canvas.MsgKeyUp", key: "a" };
    updatedModel = update(msg2, model);
    expect(updatedModel.egg?.direction).toStrictEqual("NONE");
  });

  it("moves the egg north on KeyDown ArrowUp then egg stops after KeyUp ArrowUp", () => {
    const msg1: Msg = { _tag: "Canvas.MsgKeyDown", key: "ArrowUp" };
    let updatedModel = update(msg1, model);
    expect(updatedModel.egg?.direction).toStrictEqual("NORTH");

    const msg2: Msg = { _tag: "Canvas.MsgKeyUp", key: "ArrowUp" };
    updatedModel = update(msg2, model);
    expect(updatedModel.egg?.direction).toStrictEqual("NONE");
  });

  it("moves the egg south on KeyDown ArrowDown then egg stops after KeyUp ArrowDown", () => {
    const msg1: Msg = { _tag: "Canvas.MsgKeyDown", key: "ArrowDown" };
    let updatedModel = update(msg1, model);
    expect(updatedModel.egg?.direction).toStrictEqual("SOUTH");

    const msg2: Msg = { _tag: "Canvas.MsgKeyUp", key: "ArrowDown" };
    updatedModel = update(msg2, model);
    expect(updatedModel.egg?.direction).toStrictEqual("NONE");
  });

  it("moves the egg east on KeyDown ArrowRight then egg stops after KeyUp ArrowRight", () => {  
    const msg1: Msg = { _tag: "Canvas.MsgKeyDown", key: "ArrowRight" };
    let updatedModel = update(msg1, model);
    expect(updatedModel.egg?.direction).toStrictEqual("EAST");

    const msg2: Msg = { _tag: "Canvas.MsgKeyUp", key: "ArrowRight" };
    updatedModel = update(msg2, model);
    expect(updatedModel.egg?.direction).toStrictEqual("NONE");
  });

  it("moves the egg west on KeyDown ArrowLeft then egg stops after KeyUp ArrowLeft", () => {
    const msg1: Msg = { _tag: "Canvas.MsgKeyDown", key: "ArrowLeft" };
    let updatedModel = update(msg1, model);
    expect(updatedModel.egg?.direction).toStrictEqual("WEST");

    const msg2: Msg = { _tag: "Canvas.MsgKeyUp", key: "ArrowLeft" };
    updatedModel = update(msg2, model);
    expect(updatedModel.egg?.direction).toStrictEqual("NONE");
  });

  it("should set egg to attacking when 'l' is pressed", () => {
    const msg1: Msg = { _tag: "Canvas.MsgKeyDown", key: "l" };
    let updatedModel = update(msg1, model);
    expect(updatedModel.egg?.isAttacking).toStrictEqual(true);
    
    const msg2: Msg = { _tag: "Canvas.MsgKeyUp", key: "l" };
    updatedModel = update(msg2, model);
    expect(updatedModel.egg?.isAttacking).toStrictEqual(false);
  });

  it("resets game when 'r' is pressed and game is over", () => {
    let updatedModel = Model.make({
      ...model,
      state: { ...model.state, isGameOver: true }});

    const msg: Msg = { _tag: "Canvas.MsgKeyDown", key: "r" };
    updatedModel = update(msg, model);
    expect(updatedModel.state.isGameOver).toStrictEqual(false);
    expect(updatedModel.egg?.direction).toStrictEqual("NONE");
    expect(updatedModel.egg?.isAttacking).toStrictEqual(false);
    expect(updatedModel.eggnemies.length).toBe(5);
    expect(updatedModel.boss).toStrictEqual(null);
    expect(updatedModel.state.elapsedTime).toStrictEqual(0);
    expect(updatedModel.state.defeatedEggnemiesCount).toStrictEqual(0);
    expect(updatedModel.state.hasBossAlreadySpawned).toStrictEqual(false);
  });

  it("does not reset game when 'r' is pressed and game is not over", () => {
    let updatedModel = Model.make({
      ...model,
      state: { ...model.state, isGameOver: false }});

    const msg: Msg = { _tag: "Canvas.MsgKeyDown", key: "r" };
    updatedModel = update(msg, model);
    expect(updatedModel.state.isGameOver).toStrictEqual(false);
  });

  it("moves egg right on MsgTick", () => {
  const modelBefore = Model.make({
    ...model,
    egg: {
      x: 0, y: 0, width: 10, height: 10,
      hp: 10, maxHp: 10,
      direction: "EAST", isAttacking: false,
      attackRange: 10,
    },
    eggStats: {
      speed: 5, attackDamage: 1, eggxperience: 0,
    }
  });

  const modelAfter = update({ _tag: "Canvas.MsgTick" }, modelBefore);
    if (modelAfter.egg!.x <= modelBefore.egg!.x) {
      throw new Error("Expected egg to move right");
    }
  });

  it("reduces enemy hp if egg attacks on MsgTick", () => {
    const modelBefore = Model.make({
      ...model,
      egg: {
        x: 0, y: 0, width: 10, height: 10,
        hp: 10, maxHp: 10,
        direction: "NONE", isAttacking: true,
        attackRange: 10,
      },
      eggStats: {
        speed: 0, attackDamage: 2, eggxperience: 0,
      },
      eggnemies: [{
        x: 0, y: 0, width: 10, height: 10, hp: 5, maxHp: 5, speed: 1, attackDamage: 1,
      }],
    });

    const modelAfter = update({ _tag: "Canvas.MsgTick" }, modelBefore);
    expect(modelAfter.eggnemies[0].hp).toBeLessThan(modelBefore.eggnemies[0].hp);
  });

  it("reduces boss hp if egg attacks on MsgTick", () => {
    const modelBefore = Model.make({
      ...model,
      egg: {
        x: 0, y: 0, width: 10, height: 10,
        hp: 10, maxHp: 10,
        direction: "NONE", isAttacking: true,
        attackRange: 10,
      },
      eggStats: {
        speed: 0, attackDamage: 2, eggxperience: 0,
      },
      boss: {
        x: 0, y: 0, width: 10, height: 10, hp: 5, maxHp: 5, speed: 1, attackDamage: 1,
      },
    });

    const modelAfter = update({ _tag: "Canvas.MsgTick" }, modelBefore);
    expect(modelAfter.boss!.hp).toBeLessThan(modelBefore.boss!.hp);
  });

  it("doesn't reduce enemy hp if egg is not attacking on MsgTick", () => {
    const modelBefore = Model.make({
      ...model,
      egg: {
        x: 0, y: 0, width: 10, height: 10,
        hp: 10, maxHp: 10,
        direction: "NONE", isAttacking: false,
        attackRange: 10,
      },
      eggStats: {
        speed: 0, attackDamage: 2, eggxperience: 0,
      },
      eggnemies: [{
        x: 0, y: 0, width: 10, height: 10, hp: 5, maxHp: 5, speed: 1, attackDamage: 1,
      }],
    });

    const modelAfter = update({ _tag: "Canvas.MsgTick" }, modelBefore);
    expect(modelAfter.eggnemies[0].hp).toStrictEqual(modelBefore.eggnemies[0].hp);
  });

  it("doesn't reduce boss hp if egg is not attacking on MsgTick", () => {
    const modelBefore = Model.make({
      ...model,
      egg: {
        x: 0, y: 0, width: 10, height: 10,
        hp: 10, maxHp: 10,
        direction: "NONE", isAttacking: false,
        attackRange: 10,
      },
      eggStats: {
        speed: 0, attackDamage: 2, eggxperience: 0,
      },
      boss: {
        x: 0, y: 0, width: 10, height: 10, hp: 5, maxHp: 5, speed: 1, attackDamage: 1,
      },
    });

    const modelAfter = update({ _tag: "Canvas.MsgTick" }, modelBefore);
    expect(modelAfter.boss!.hp).toStrictEqual(modelBefore.boss!.hp);
  });

  it("reduces egg hp when boss is touching on MsgTick", () => {
    const modelBefore = Model.make({
      ...model,
      egg: {
        ...model.egg,
        x: 0, y: 0, width: 10, height: 10,
        hp: 10, maxHp: 10,
        direction: "NONE", isAttacking: false,
        attackRange: 10,
      },
      eggStats: { speed: 0, attackDamage: 0, eggxperience: 0 },
      boss: {
        x: 0, y: 0, width: 10, height: 10, hp: 5, maxHp: 5, speed: 1, attackDamage: 1,
      },
      state: {
        ...model.state,
        lastDamageTime: 0,
        startTime: Date.now() - 1000,
        elapsedTime: 0,
      },
    });

    const modelAfter = update({ _tag: "Canvas.MsgTick" }, modelBefore);
    expect(modelAfter.egg!.hp).toBeLessThan(modelBefore.egg!.hp);
  });

  it("reduces egg hp when eggnemy is touching on MsgTick", () => {
    const modelBefore = Model.make({
      ...model,
      egg: {
        ...model.egg,
        x: 0, y: 0, width: 10, height: 10,
        hp: 10, maxHp: 10,
        direction: "NONE", isAttacking: false,
        attackRange: 10,
      },
      eggStats: { speed: 0, attackDamage: 0, eggxperience: 0 },
      eggnemies: [{
        x: 0, y: 0, width: 10, height: 10, hp: 5, maxHp: 5, speed: 1, attackDamage: 1,
      }],
      state: {
        ...model.state,
        lastDamageTime: 0,
        startTime: Date.now() - 1000,
        elapsedTime: 0,
      },
    });

    const modelAfter = update({ _tag: "Canvas.MsgTick" }, modelBefore);
    expect(modelAfter.egg!.hp).toBeLessThan(modelBefore.egg!.hp);
  });

  it("does not update if isChoosingEgghancement is true on MsgTick", () => {
    const modelBefore = Model.make({
      ...model,
      state: {
        ...model.state,
        isChoosingEgghancement: true,
      },
    });
    const modelAfter = update({ _tag: "Canvas.MsgTick" }, modelBefore);
    expect(modelAfter.eggStats !== modelBefore.eggStats)
  });

  it("spawns boss if threshold is met on MsgTick", () => {
    const modelBefore = Model.make({
      ...model,
      boss: undefined,
      state: {
        ...model.state,
        hasBossAlreadySpawned: false,
        eggnemiesTillNextBoss: 5,
      },
      settings: {
        ...model.settings,
        bossSpawnThreshold: 5,
      },
    });
    const modelAfter = update({ _tag: "Canvas.MsgTick" }, modelBefore);
    expect(modelAfter.boss).toBeDefined();
    expect(modelAfter.state.hasBossAlreadySpawned).toBe(true);
  });

  it("selects HP egghancement when key 1 pressed", () => {
    const modelBefore = Model.make({
      ...model,
      egg: { 
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        direction: "NONE",
        isAttacking: false,
        attackRange: 10,
        hp: 5, 
        maxHp: 5 
      },
      state: { 
        ...model.state, isChoosingEgghancement: true },
      eggStats: {
        ...model.eggStats, eggxperience: 10 },
      egghancementUpgrade: { 
        ...model.egghancementUpgrade, hpInc: 5 },
      settings: { 
        ...model.settings, egghancementCost: 5 },
    });

    const modelAfter = update({ _tag: "Canvas.MsgKeyDown", key: "1" }, modelBefore);
    expect(modelAfter.egg!.hp).toStrictEqual(10);
  });

  it("selects Attack egghancement when key 2 pressed", () => {
    const modelBefore = Model.make({
      ...model,
      egg: { 
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        direction: "NONE",
        isAttacking: false,
        attackRange: 10,
        hp: 5, 
        maxHp: 5 
      },
      state: { 
        ...model.state, isChoosingEgghancement: true },
      eggStats: {
        ...model.eggStats, eggxperience: 10, attackDamage: 1 },
      egghancementUpgrade: { 
        ...model.egghancementUpgrade, attackDamageInc: 1 },
      settings: { 
        ...model.settings, egghancementCost: 5 },
    });

    const modelAfter = update({ _tag: "Canvas.MsgKeyDown", key: "2" }, modelBefore);
    expect(modelAfter.eggStats.attackDamage).toStrictEqual(2);
  });

  it("selects Speed egghancement when key 3 pressed", () => {
    const modelBefore = Model.make({
      ...model,
      egg: { 
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        direction: "NONE",
        isAttacking: false,
        attackRange: 10,
        hp: 5, 
        maxHp: 5 
      },
      state: { 
        ...model.state, isChoosingEgghancement: true },
      eggStats: {
        ...model.eggStats, eggxperience: 10, speed: 1 },
      egghancementUpgrade: { 
        ...model.egghancementUpgrade, speedInc: 1 },
      settings: { 
        ...model.settings, egghancementCost: 5 },
    });

    const modelAfter = update({ _tag: "Canvas.MsgKeyDown", key: "3" }, modelBefore);
    expect(modelAfter.eggStats.speed).toStrictEqual(2);
  });

});



