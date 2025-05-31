import {
  type CanvasElement,
  canvasView,
  OutlinedRectangle,
  SolidRectangle,
  Text,
} from "cs12242-mvu/src/canvas";
import { Array, pipe, Struct } from "effect";
import { Model } from "./model";
import type { Msg } from "./msg";
import * as settings from "./settings.json";
import { formatTime, getCenterX } from "./utils";

function renderEgg(model: Model): CanvasElement[] {
  return model.egg != undefined
    ? [
        // Actual Egg
        SolidRectangle.make({
          x: model.egg.x,
          y: model.egg.y,
          width: model.egg.width,
          height: model.egg.height,
          // TODO: Extract out to setting.
          color: "white",
        }),
        // HP text
        Text.make({
          x: getCenterX(model.egg),
          y: model.egg.y - 8,
          text: `${model.egg.hp}/${model.egg.maxHp}`,
          fontSize: 16,
          font: "monospace",
          color: "white",
          textAlign: "center",
        }),
      ]
    : [];
}

function renderEggnemies(model: Model): CanvasElement[] {
  return pipe(
    model.eggnemies,
    Array.map((en) => [
      // Actual eggnemy
      SolidRectangle.make({
        x: en.x,
        y: en.y,
        width: en.width,
        height: en.height,
        // TODO: Extract out to setting.
        color: "pink", // different from egg
      }),
      // HP text
      Text.make({
        x: getCenterX(en),
        y: en.y - 6,
        text: `${en.hp}/${en.maxHp}`,
        fontSize: 12,
        font: "monospace",
        color: "pink",
        textAlign: "center",
      }),
    ]),
    Array.flatten,
  );
}

function renderBoss(model: Model): CanvasElement[] {
  return model.boss != undefined
    ? [
        SolidRectangle.make({
          x: model.boss.x,
          y: model.boss.y,
          width: model.boss.width,
          height: model.boss.height,
          color: "red",
        }),
        Text.make({
          x: getCenterX(model.boss),
          y: model.boss.y - 6,
          text: `${model.boss.hp}/${model.boss.maxHp}`,
          fontSize: 16,
          font: "monospace",
          color: "red",
          textAlign: "center",
        }),
      ]
    : [];
}

function offsetElementBy(element: CanvasElement, dx: number, dy: number) {
  return Struct.evolve(element, {
    x: (x) => Math.round(x + dx),
    y: (y) => Math.round(y + dy),
  });
}

function renderWorld(model: Model): CanvasElement[] {
  return pipe(
    [
      SolidRectangle.make({
        x: 0,
        y: 0,
        width: model.world.width,
        height: model.world.height,
        color: "black",
      }),
      OutlinedRectangle.make({
        x: 0,
        y: 0,
        width: model.world.width,
        height: model.world.height,
        color: "white",
        lineWidth: 5,
      }),
    ],
    Array.appendAll(renderEgg(model)),
    Array.appendAll(renderEggnemies(model)),
    Array.appendAll(renderBoss(model)),
  );
}

function renderUIElements(
  model: Model,
  screenWidth: number,
  screenHeight: number,
): CanvasElement[] {
  return pipe(
    [
      // Eggnemies defeated count
      Text.make({
        x: 15,
        y: 30,
        text: `${model.state.defeatedEggnemiesCount}`,
        fontSize: 16,
        font: "monospace",
        color: "white",
        textAlign: "left",
      }),

      // Elapsed time
      Text.make({
        x: screenWidth - 20,
        y: 30,
        // TODO: Properly extract back into model.
        text: `${formatTime(Date.now() - model.state.startTime)}`,
        fontSize: 16,
        font: "monospace",
        color: "white",
        textAlign: "right",
      }),
    ],
    Array.appendAll(
      model.state.isGameOver
        ? [
            // Victory text
            Text.make({
              x: screenWidth / 2,
              y: screenHeight / 2,
              text:
                model.egg == undefined
                  ? model.settings.defeatText
                  : model.settings.victoryText,
              fontSize: 20,
              font: "monospace",
              color: "white",
              textAlign: "center",
            }),
          ]
        : [],
    ),
  );
}

function renderScreen(
  model: Model,
  screenWidth: number,
  screenHeight: number,
): CanvasElement[] {
  const offsetX = screenWidth / 2 - model.world.center.x;
  const offsetY = screenHeight / 2 - model.world.center.y;
  return pipe(
    [
      SolidRectangle.make({
        x: 0,
        y: 0,
        width: screenWidth,
        height: screenHeight,
        color: "black",
      }),
    ],
    Array.appendAll(
      pipe(
        renderWorld(model),
        Array.map((element) => offsetElementBy(element, offsetX, offsetY)),
      ),
    ),
    Array.appendAll(renderUIElements(model, screenWidth, screenHeight)),
  );
}

export const view = canvasView<Model, Msg>(
  settings.game.screen.width,
  settings.game.screen.height,
  settings.game.fps,
  "mpScreen",
  (model) =>
    renderScreen(
      model,
      settings.game.screen.width,
      settings.game.screen.height,
    ),
);
