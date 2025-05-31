import { describe, it, expect, beforeEach } from "vitest";
import { update } from "./update"; 
import { Msg } from "./msg";
import { initModel, Model } from "./model";


let model: Model;
beforeEach(() => {
  model = initModel;
});

describe("#update", () => {
  it("moves the egg north on key press W", () => {
    const msg: Msg = { _tag: "Canvas.MsgKeyDown", key: "w" };
    const updatedModel = update(msg, model);
    expect(updatedModel.egg?.direction).toBe("NORTH");
  });

  it("moves the egg south on key press S", () => {
    const msg: Msg = { _tag: "Canvas.MsgKeyDown", key: "s" };
    const updatedModel = update(msg, model);
    expect(updatedModel.egg?.direction).toBe("SOUTH");
  });

  it("moves the egg east on key press D", () => {
    const msg: Msg = { _tag: "Canvas.MsgKeyDown", key: "d" };
    const updatedModel = update(msg, model);
    expect(updatedModel.egg?.direction).toBe("EAST");
  });
    it("moves the egg east on key press A", () => {
    const msg: Msg = { _tag: "Canvas.MsgKeyDown", key: "a" };
    const updatedModel = update(msg, model);
    expect(updatedModel.egg?.direction).toBe("WEST");
  });
});
 