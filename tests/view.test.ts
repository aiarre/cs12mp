import { describe, it, expect, beforeEach } from "vitest";
import { Msg } from "../msg";
import { initModel, Model } from "../model";
import { Array } from 'effect'
import { getCenterX, formatTime } from "../utils";
import * as settings from "../settings.json"
import { 
  type CanvasElement,
  canvasView,
  OutlinedRectangle,
  SolidRectangle,
  Text 
} from "cs12242-mvu/src/canvas";
import { 
  view, 
  renderEgg, 
  renderEggnemies, 
  renderBoss, 
  offsetElementBy, 
  renderLeaderboard, 
  renderWorld, 
  renderUIElements, 
  renderScreen 
} from "../view";


let model: Model;
beforeEach(() => {
  model = initModel;
});

describe("#view", () => {
  const screenWidth = settings.game.screen.width;
  const screenHeight = settings.game.screen.height;

  it("returns a canvas node with correct dimensions and id", () => {
    const vnode = view(model);

    expect(vnode.sel).toBe("canvas");
    expect(vnode.data?.props?.width).toBe(screenWidth);
    expect(vnode.data?.props?.height).toBe(screenHeight);
    expect(vnode.data?.props?.id).toBe("mpScreen");
    expect(typeof vnode.data?.hook?.create).toBe("function");
  });
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

describe("#renderEggnemies", () => {
  it("renders SolidRectangle and HP Text for each eggnemy", () => {
   const result = renderEggnemies(model);
   expect(result.length).toBe(model.eggnemies.length * 2)
  });

  it("filters rectangles and texts from result", () => {
  const result = renderEggnemies(model);

  const eggnemyRects = Array.filter(result, (_, i) => i % 2 === 0);
  const eggnemyTexts = Array.filter(result, (_, i) => i % 2 !== 0);

  expect(eggnemyRects.length).toBe(model.eggnemies.length);
  expect(eggnemyTexts.length).toBe(model.eggnemies.length);

  Array.forEach(eggnemyRects, (rect, index) => {
    expect(rect._tag).toBe("SolidRectangle");

    if (rect._tag === "SolidRectangle") {
      const en = model.eggnemies[index];
      expect(rect.x).toBe(en.x);
      expect(rect.y).toBe(en.y);
      expect(rect.width).toBe(en.width);
      expect(rect.height).toBe(en.height);
      expect(rect.color).toBe("pink");
    }
  });

  eggnemyTexts.forEach((text, index) => {
    expect(text._tag).toBe("Text");

    if (text._tag === "Text") {
      const en = model.eggnemies[index];
      expect(text.text).toBe(`${en.hp}/${en.maxHp}`);
      expect(text.fontSize).toBe(12);
      expect(text.font).toBe("monospace");
      expect(text.color).toBe("pink");
      expect(text.textAlign).toBe("center");
      expect(text.x).toBe(getCenterX(en));
      expect(text.y).toBe(en.y - 6);
    }
  });
});
})

describe("#renderBoss", () => {
  it("returns empty array when boss is undefined", () => {
    const result = renderBoss(model);
    expect(result).toEqual([]);
  });

  it("renders boss rectangle and HP text correctly", () => {
    const modelWithBoss = { ...model, boss: {
      x: model.world.width / 2,
      y: model.world.height/2,
      width: 50,
      height: 50,
      hp: 10,
      maxHp: 10,
      speed: 8
    } };

    const result = renderBoss(modelWithBoss);

    expect(result.length).toBe(2);

    const [rect, text] = result;

    expect(rect._tag).toBe("SolidRectangle");
    if (rect._tag === "SolidRectangle") {
      const boss = modelWithBoss.boss!;
      expect(rect.x).toBe(boss.x);
      expect(rect.y).toBe(boss.y);
      expect(rect.width).toBe(boss.width);
      expect(rect.height).toBe(boss.height);
      expect(rect.color).toBe("red");
    }

    expect(text._tag).toBe("Text");
    if (text._tag === "Text") {
      const boss = modelWithBoss.boss!;
      expect(text.text).toBe(`${boss.hp}/${boss.maxHp}`);
      expect(text.fontSize).toBe(16);
      expect(text.font).toBe("monospace");
      expect(text.color).toBe("red");
      expect(text.textAlign).toBe("center");
      expect(text.x).toBe(getCenterX(boss));
      expect(text.y).toBe(boss.y - 6);
    }
  });
});

describe("#offsetElementBy", () => {
  it("correctly offsets a SolidRectangle element", () => {
    const rect: CanvasElement = SolidRectangle.make({
      x: 10,
      y: 20,
      width: 50,
      height: 30,
      color: "blue",
    });

    const offset = offsetElementBy(rect, 5.6, -3.2);

    expect(offset._tag).toBe("SolidRectangle");
    if (offset._tag === "SolidRectangle") {
      expect(offset.x).toBe(16); // 10 + 5.6 → 15.6 = 16
      expect(offset.y).toBe(17); // 20 - 3.2 → 16.8 = 17
    }
  });

  it("correctly offsets a Text element", () => {
    const text: CanvasElement = Text.make({
      x: 100,
      y: 50,
      text: "Hello",
      fontSize: 16,
      font: "monospace",
      color: "white",
      textAlign: "left",
    });

    const offset = offsetElementBy(text, -10.3, 4.8);

    expect(offset._tag).toBe("Text");
    if (offset._tag === "Text"){
    expect(offset.x).toBe(90); // 100 - 10.3 = 90
    expect(offset.y).toBe(55); // 50 + 4.8 = = 55
    }
  });
});

describe("#renderWorld", () => {
  it("includes base world background and outline", () => {
    const result = renderWorld(model);
    const background = result[0];
    const outline = result[1];

    expect(background._tag).toBe("SolidRectangle");
    if (background._tag === "SolidRectangle") {
    expect(background.width).toBe(model.world.width);
    expect(background.height).toBe(model.world.height);
    expect(background.color).toBe("black");
    }

    expect(outline._tag).toBe("OutlinedRectangle");
    if (outline._tag === "OutlinedRectangle") {
    expect(outline.width).toBe(model.world.width);
    expect(outline.height).toBe(model.world.height);
    expect(outline.color).toBe("white");
    expect(outline.lineWidth).toBe(5);
    }
  });

  it("includes egg, eggnemies, and boss elements", () => {
    const modelWithBoss = { ...model, boss: {
      x: model.world.width / 2,
      y: model.world.height/2,
      width: 50,
      height: 50,
      hp: 10,
      maxHp: 10,
      speed: 8
    } };
    const result = renderWorld(modelWithBoss);

    const solidRects = Array.filter(result, e => e._tag === "SolidRectangle");
    const texts = Array.filter(result, e => e._tag === "Text");

    // 1 base + 1 boss + 1 egg + 5 eggnemy = 8
    expect(solidRects.length).toStrictEqual(8);
    // 1 boss HP text + 1 egg HP text + 5 eggnemy HP text = 7
    expect(texts.length).toStrictEqual(7);
  });
});

describe("#renderLeaderboard", () => {
  const modelWithLeaderboard = {
    ...model,
    state: {
      startTime: Date.now(),
      elapsedTime: 10,
      lastDamageTime: 0,
      isGameOver: false,
      hasBossAlreadySpawned: false,
      defeatedEggnemiesCount: 0,
      leaderboard: ["00:10", "00:20"],
    },
  } 

  it("renders at least 3 entries padded with '--:--' if needed", () => {
    const elements = renderLeaderboard(modelWithLeaderboard, 10, 50);

    expect(elements.length).toBe(3);
    expect(elements.every(el => el._tag === "Text")).toBe(true);
    expect(elements[2]._tag === "Text" && elements[2].text.includes("--:--")).toBe(true);
  });

  it("renders each time with correct y offset", () => {
    const y = 100;
    const gap = 25;
    const elements = renderLeaderboard(modelWithLeaderboard, 0, y, gap);

    elements.forEach((el, i) => {
      if ("y" in el) {
        expect(el.y).toBe(y + gap * i);
      }
    });
  });

  it("first entry has 'Top' prefix", () => {
    const elements = renderLeaderboard(modelWithLeaderboard, 0, 0);
    expect(elements[0]._tag === "Text" && elements[0].text.startsWith("Top")).toBe(true);
    expect(elements[1]._tag === "Text" && elements[1].text.startsWith("    ")).toBe(true);
  });

  it("uses correct style", () => {
    const elements = renderLeaderboard(modelWithLeaderboard, 0, 0);
    for (const el of elements) {
      if (el._tag === "Text") {
        expect(el.fontSize).toBe(16);
        expect(el.font).toBe("monospace");
        expect(el.color).toBe("white");
        expect(el.textAlign).toBe("left");
      }
    }
  });
});

describe("#renderUIElements", () => {
  it("renders defeated count and elapsed time", () => {
    const modelChanged = Model.make({
      ...model,
      state: {
        ...model.state,
        elapsedTime: 75000,
        defeatedEggnemiesCount: 3,
      }
    })
    const elements = renderUIElements(modelChanged, modelChanged.world.width, modelChanged.world.height);
    const texts = elements.filter((e) => e._tag === "Text");

    expect(texts.length).toBeGreaterThanOrEqual(2);

    const countText = texts.find((t) => t.text === "3");
    expect(countText).toBeDefined();

    const timeText = texts.find((t) => t.text === formatTime(75000));
    expect(timeText).toBeDefined();
    expect(timeText?.text).toStrictEqual("01:15")
  });
  
  it("renders victory message when game is over and egg exists", () => {
  const modelVictory: Model = Model.make({
    ...model,
    state: { ...model.state, isGameOver: true },
  })

  const elements = renderUIElements(modelVictory, modelVictory.world.width, modelVictory.world.height);
  const texts = elements.filter((e) => e._tag === "Text");

  const victoryText = texts.find((t) => t.text === "You Win!");
  expect(victoryText).toBeDefined();
  });


  it("renders defeat message when game is over and egg is missing", () => {
    const modelDefeat: Model = Model.make({
      ...model,
      state: { ...model.state, isGameOver: true },
      egg: undefined,
    });

    const elements = renderUIElements(modelDefeat, modelDefeat.world.width, modelDefeat.world.height);
    const texts = elements.filter((e) => e._tag === "Text");

    const defeatText = texts.find((t) => t.text === "You Lose!");
    expect(defeatText).toBeDefined();
  });

  it("renders leaderboard entries", () => {
  const elements = renderUIElements(model, model.world.width, model.world.height);
  const texts = elements.filter((e) => e._tag === "Text");

  expect(texts.some((t) => t.text?.includes("Top 1"))).toBe(true);
  expect(texts.some((t) => t.text?.includes("2"))).toBe(true);
  });

})

describe("#renderScreen", () => {
  

  it("renders a black background rectangle covering the whole screen", () => {
    const modelWithWorld = Model.make({
    ...model,
    world: {
      width: 1000,
      height: 800,
      center: { x: 500, y: 400 },
    },
  });
    const elements = renderScreen(modelWithWorld, modelWithWorld.world.width, modelWithWorld.world.height);
    const bg = elements.find(
      (el) =>
        el._tag === "SolidRectangle" &&
        el.x === 0 &&
        el.y === 0 &&
        el.width === modelWithWorld.world.width &&
        el.height === modelWithWorld.world.height &&
        el.color === "black",
    );
    expect(bg).toBeDefined();
  });

  it("offsets elements from renderWorld by the correct amount", () => {
    const modelWithWorld = Model.make({
    ...model,
    world: {
      width: 1000,
      height: 800,
      center: { x: 500, y: 400 },
    },
  });
    const offsetX = modelWithWorld.world.width / 2 - modelWithWorld.world.center.x;
    const offsetY = modelWithWorld.world.height / 2 - modelWithWorld.world.center.y;

    const worldElements = renderWorld(modelWithWorld);
    const screenElements = renderScreen(modelWithWorld, modelWithWorld.world.width, modelWithWorld.world.height);

    const offsetElements = screenElements.filter((el) =>
      worldElements.some(
        (we) =>
          we._tag === el._tag &&
          "x" in we && "y" in we && "width" in we && "height" in we &&
          "x" in el && "y" in el && "width" in el && "height" in el &&
          we.x + offsetX === el.x &&
          we.y + offsetY === el.y &&
          we.width === el.width &&
          we.height === el.height,
      ),
    );

    expect(offsetElements.length).toBeGreaterThan(0);
  });

  it("includes UI elements", () => {
    const modelWithWorld = Model.make({
    ...model,
    world: {
      width: 1000,
      height: 800,
      center: { x: 500, y: 400 },
    },
  });
    const elements = renderScreen(modelWithWorld, modelWithWorld.world.width, modelWithWorld.world.height);
    const texts = elements.filter((el) => el._tag === "Text");

    expect(texts.length).toBeGreaterThan(0);

    texts.forEach((text) => {
      expect(text.x).toBeGreaterThanOrEqual(0);
      expect(text.x).toBeLessThanOrEqual(modelWithWorld.world.width);
      expect(text.y).toBeGreaterThanOrEqual(0);
      expect(text.y).toBeLessThanOrEqual(modelWithWorld.world.height);
    });
  });
});
