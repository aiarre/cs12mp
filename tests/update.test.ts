import { describe, it, expect, beforeEach } from "vitest";
import { update } from "../update"; 
import { Msg } from "../msg";
import { initModel, Model } from "../model";


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

  it("should set egg to attacking when 'l' is pressed", () => {
    const msg: Msg = { _tag: "Canvas.MsgKeyDown", key: "l" };
    let updatedModel = update(msg, model);
    expect(updatedModel.egg?.isAttacking).toStrictEqual(true);
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
  });

  it("does not reset game when 'r' is pressed and game is not over", () => {
    let updatedModel = Model.make({
      ...model,
      state: { ...model.state, isGameOver: false }});

    const msg: Msg = { _tag: "Canvas.MsgKeyDown", key: "r" };
    updatedModel = update(msg, model);
    expect(updatedModel.state.isGameOver).toStrictEqual(false);
  });
});
 

// describe("#tickMoveEgg", () => { 
//   it("should not move egg when direction is NONE", () => {
//     const updatedModel = update({ _tag: "Tick" }, model);
//     expect(updatedModel.egg?.x).toBe(model.egg?.x);
//     expect(updatedModel.egg?.y).toBe(model.egg?.y);
//   });

//   it("should move egg north when direction is NORTH", () => {
//     model = { ...model, egg: { ...model.egg, direction: "NORTH" } };
//     const updatedModel = update({ _tag: "Tick" }, model);
//     expect(updatedModel.egg?.y).toBe(model.egg?.y - 1);
//   });

//   it("should move egg south when direction is SOUTH", () => {
//     model = { ...model, egg: { ...model.egg, direction: "SOUTH" } };
//     const updatedModel = update({ _tag: "Tick" }, model);
//     expect(updatedModel.egg?.y).toBe(model.egg?.y + 1);
//   });

//   it("should move egg east when direction is EAST", () => {
//     model = { ...model, egg: { ...model.egg, direction: "EAST" } };
//     const updatedModel = update({ _tag: "Tick" }, model);
//     expect(updatedModel.egg?.x).toBe(model.egg?.x + 1);
//   });

//   it("should move egg west when direction is WEST", () => {
//     model = { ...model, egg: { ...model.egg, direction: "WEST" } };
//     const updatedModel = update({ _tag: "Tick" }, model);
//     expect(updatedModel.egg?.x).toBe(model.egg?.x - 1);
//   });
// })