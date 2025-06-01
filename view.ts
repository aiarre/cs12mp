import {
  type CanvasElement,
  canvasView,
  OutlinedRectangle,
  SolidRectangle,
  Text,
  CanvasImage,
} from "./cs12242-mvu/src/canvas";
import { Array, pipe, Struct } from "effect";
import { Model } from "./model";
import type { Msg } from "./msg";
import * as settings from "./settings.json";
import { formatTime, getCenterX } from "./utils";

const resources = {
  sprites: {
    egg: new Image(),
    eggnemy: new Image(),
    boss: new Image(),
  },
};

resources.sprites.egg.src = "resources/sprites/egg.png";
resources.sprites.eggnemy.src = "resources/sprites/eggnemy.png";
resources.sprites.boss.src = "resources/sprites/boss.png";

export function renderEgg(model: Model): CanvasElement[] {
  return model.egg != undefined
    ? [
        CanvasImage.make({
          x: model.egg.x - 8,
          y: model.egg.y - 5, //-8 and -5 due to offset of egg image
          src: resources.sprites.egg.src,
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

export function renderEggnemies(model: Model): CanvasElement[] {
  return pipe(
    model.eggnemies,
    Array.map((en) => [
      // Actual eggnemy
      // SolidRectangle.make({
      //   x: en.x,
      //   y: en.y,
      //   width: en.width,
      //   height: en.height,
      //   // TODO: Extract out to setting.
      //   color: "pink", // different from egg
      // }),

      CanvasImage.make({
        x: en.x - 2,
        y: en.y - 2, //-8 and -5 due to offset of egg image
        src: resources.sprites.eggnemy.src,
      }),

      // HP text
      Text.make({
        x: getCenterX(en),
        y: en.y - 6,
        text: `${en.hp}/${en.maxHp}`,
        fontSize: 14,
        font: "monospace",
        color: "yellow",
        textAlign: "center",
      }),
    ]),
    Array.flatten,
  );
}

export function renderBoss(model: Model): CanvasElement[] {
  return model.boss != undefined
    ? [
        // SolidRectangle.make({
        //   x: model.boss.x,
        //   y: model.boss.y,
        //   width: model.boss.width,
        //   height: model.boss.height,
        //   color: "red",
        // }),

        CanvasImage.make({
          x: model.boss.x - 4,
          y: model.boss.y - 10, //-8 and -5 due to offset of egg image
          src: resources.sprites.boss.src,
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

export function offsetElementBy(
  element: CanvasElement,
  dx: number,
  dy: number,
) {
  return Struct.evolve(element, {
    x: (x) => Math.round(x + dx),
    y: (y) => Math.round(y + dy),
  });
}

export function renderWorld(model: Model): CanvasElement[] {
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

export function renderLeaderboard(
  model: Model,
  x: number,
  y: number,
  gap: number = 20,
): CanvasElement[] {
  return pipe(
    // Why do I need to type cast here? I don't get it.
    model.state.leaderboard as string[],
    Array.pad(3, "--:--"),
    Array.map((time, i) =>
      Text.make({
        x: x,
        y: y + gap * i,
        text: `${i === 0 ? "Top " : "    "}${i + 1}  ${time}`, // note the double space!
        fontSize: 16,
        font: "monospace",
        color: "white",
        textAlign: "left",
      }),
    ),
  );
}

export function renderEggStats(
  model: Model,
  x: number,
  y: number,
  gap: number = 20,
): CanvasElement[] {
  const stats: [string, string][] = [
    ["Atk", `${model.eggStats.attackDamage}`],
    ["Spd", `${model.eggStats.speed}`],
    ["Exp", `${model.eggStats.eggxperience}`],
  ];
  return pipe(
    stats,
    Array.flatMap(([label, value], i) => [
      Text.make({
        x,
        y: y + gap * i,
        text: label,
        fontSize: 16,
        font: "monospace",
        color: "white",
        textAlign: "right",
      }),
      Text.make({
        x: x + gap,
        y: y + gap * i,
        text: value,
        fontSize: 16,
        font: "monospace",
        color: "white",
        textAlign: "left",
      }),
    ]),
  );
}

export function renderEgghancementMenu(
  model: Model,
  x: number,
  y: number,
  gap: number = 20,
): CanvasElement[] {
  return model.state.isChoosingEgghancement
    ? pipe([
        OutlinedRectangle.make({
          x: x - gap,
          y: y - gap,
          color: "white",
          width: gap + 300,
          height: gap + 90,
          lineWidth: 2.5,
        }),
        SolidRectangle.make({
          x: x - gap,
          y: y - gap,
          color: "black",
          width: gap + 300,
          height: gap + 90,
        }),
        Text.make({
          x,
          y: y + gap,
          text: `[1] Increase max HP by ${model.egghancements.hpUp}`,
          fontSize: 16,
          font: "monospace",
          color: "white",
          textAlign: "left",
        }),
        Text.make({
          x,
          y: y + gap * 2,
          text: `[2] Increase attack by ${model.egghancements.speedUp}`,
          fontSize: 16,
          font: "monospace",
          color: "white",
          textAlign: "left",
        }),
        Text.make({
          x,
          y: y + gap * 3,
          text: `[3] Increase speed by ${model.egghancements.attackDamageUp}`,
          fontSize: 16,
          font: "monospace",
          color: "white",
          textAlign: "left",
        }),
      ])
    : [];
}

export function renderUIElements(
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
        text: `${formatTime(model.state.elapsedTime)}`,
        fontSize: 16,
        font: "monospace",
        color: "white",
        textAlign: "right",
      }),
    ],
    Array.appendAll(
      model.state.isGameOver
        ? [
            // Text background to ensure readability
            SolidRectangle.make({
              x: screenWidth / 2 - 150,
              y: screenHeight / 2 - 25 - 75,
              color: "black",
              height: 50,
              width: 300,
            }),
            OutlinedRectangle.make({
              x: screenWidth / 2 - 150,
              y: screenHeight / 2 - 25 - 75,
              color: "white",
              height: 50,
              width: 300,
              lineWidth: 2.5,
            }),
            // Victory text
            Text.make({
              x: screenWidth / 2,
              y: screenHeight / 2 - 75 + 7,
              text: model.egg == undefined ? model.settings.victoryText : "",
              fontSize: 20,
              font: "monospace",
              color: "white",
              textAlign: "center",
            }),
          ]
        : [],
    ),
    Array.appendAll(renderLeaderboard(model, 25, screenHeight - 75)),
    Array.appendAll(renderEggStats(model, screenWidth - 60, screenHeight - 75)),
    Array.appendAll(renderEgghancementMenu(model, screenWidth / 2 - 115, 70)),
  );
}

export function renderScreen(
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
