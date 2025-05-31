import { describe, it, expect, beforeEach } from "vitest";
import { Msg } from "../msg";
import { view, renderEgg } from "../view";
import { initModel, Model } from "../model";
import { SolidRectangle, Text } from "cs12242-mvu/src/canvas";


let model: Model;
beforeEach(() => {
  model = initModel;
});

describe ("#view", () => {
    // it("renders the egg", () => {
    //     const rendered = view(mode, msg);
    //     expect(rendered).toContainEqual(
    //         expect.objectContaining({
    //             _tag: "Canvas.SolidRectangle",
    //             x: model.egg?.x,
    //             y: model.egg?.y,
    //             width: model.egg?.width,
    //             height: model.egg?.height,
    //             color: "white",
    //         })
    //     );
    //     expect(rendered).toContainEqual(
    //         expect.objectContaining({
    //             _tag: "Canvas.Text",
    //             x: model.egg ? (model.egg.x + model.egg.width / 2) : 0,
    //             y: model.egg ? (model.egg.y - 8) : 0,
    //             text: `${model.egg?.hp}/${model.egg?.maxHp}`,
    //         })
    //     );
    // })


});

describe("#renderEgg", () => {
  it("renders an egg", () => {

    const result = renderEgg(model);
    expect(result.length).toBe(2);

    const rect = result[0]
    const text = result[1]

    expect(rect._tag).toBe("SolidRectangle");
    if (rect._tag === "SolidRectangle") {
      expect(rect.x).toBe(model.egg?.x);
      expect(rect.y).toBe(model.egg?.y);
      expect(rect.width).toBe(model.egg?.width);
      expect(rect.height).toBe(model.egg?.height);
      expect(rect.color).toBe("white");
    }

    expect(text._tag).toBe("Text");
    if (text._tag === "Text") {
      expect(text.text).toBe(`${model.egg?.hp}/${model.egg?.maxHp}`);
      expect(text.fontSize).toBe(16);
      expect(text.font).toBe("monospace");
      expect(text.color).toBe("white");
      expect(text.textAlign).toBe("center");
      expect(text.x).toBe(model.egg ? (Math.round(model.egg.x + model.egg.width / 2)) : 0);
      expect(text.y).toBe(model.egg ? (model.egg.y - 8) : 0);
      expect(text.text).toBe(`${model.egg?.hp}/${model.egg?.maxHp}`);
    }
  })

  it("returns an empty array if egg is undefined", () => {
    const emptyModel = Model.make({ ...model, egg: undefined });
    const result = renderEgg(emptyModel);
    expect(result).toEqual([]);
  })
})