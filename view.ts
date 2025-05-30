import { h } from "cs12242-mvu/src";
import {
  type CanvasElement,
  OutlinedRectangle,
  SolidRectangle,
  Text,
} from "cs12242-mvu/src/canvas";
import { Array, pipe, Struct } from "effect";
import { Model } from "./model";
import { Msg, MsgKeyDown, MsgKeyUp, MsgTick } from "./msg";
import { formatTime } from "./utils";

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
          x: model.egg.x,
          y: model.egg.y - 5,
          text: `${model.egg.hp}/${model.egg.maxHp}`,
          fontSize: 16,
          font: "sans-serif",
          color: "white",
          textAlign: "left",
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
        x: en.x,
        y: en.y - 5,
        text: `${en.hp}/${en.maxHp}`,
        fontSize: 10,
        font: "sans-serif",
        color: "pink",
        textAlign: "left",
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
          x: model.boss.x,
          y: model.boss.y - 5,
          text: `${model.boss.hp}/${model.boss.maxHp}`,
          fontSize: 16,
          font: "sans-serif",
          color: "red",
          textAlign: "left",
        }),
      ]
    : [];
}

function offsetElementBy(element: CanvasElement, dx: number, dy: number) {
  return Struct.evolve(element, {
    x: (x) => x + dx,
    y: (y) => y + dy,
  });
}

function renderWorld(model: Model): CanvasElement[] {
  const offsetX = model.screen.width - model.world.center.x;
  const offsetY = model.screen.height - model.world.center.y;
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
    // I love functional programming.
    Array.map((element) => offsetElementBy(element, offsetX, offsetY)),
  );
}

function renderUIElements(model: Model): CanvasElement[] {
  return pipe(
    [
      // Eggnemies defeated count
      Text.make({
        x: 10,
        y: 20,
        text: `${model.defeatedCount}`,
        fontSize: 16,
        font: "sans-serif",
        color: "white",
        textAlign: "left",
      }),

      // Timer
      Text.make({
        x: model.screen.width - 100,
        y: 20,
        text: `${formatTime(model.elapsedTime)}`,
        fontSize: 16,
        font: "sans-serif",
        color: "white",
        textAlign: "left",
      }),
    ],
    Array.appendAll(
      model.victoryText
        ? [
            // Victory text
            Text.make({
              x: model.screen.width / 2,
              y: model.screen.height / 2,
              text: model.victoryText,
              fontSize: 20,
              font: "sans-serif",
              color: "white",
              textAlign: "center",
            }),
          ]
        : [],
    ),
  );
}

function renderScreen(model: Model): CanvasElement[] {
  return pipe(
    [],
    Array.appendAll(renderWorld(model)),
    Array.appendAll(renderUIElements(model)),
  );
}

export const view = (model: Model, dispatch: (msg: Msg) => void) => {
  let intervalID: number | null;
  return h("div", [
    h("canvas", {
      props: {
        width: model.screen.width,
        height: model.screen.height,
      },
      style: {
        background: "black",
      },
      hook: {
        // Inspired from: https://github.com/UPD-CS12-242/cs12242-mvu/blob/main/src/canvas.ts
        create: () => {
          window.addEventListener("keydown", (e) =>
            dispatch(
              MsgKeyDown.make({
                key: e.key,
              }),
            ),
          );
          window.addEventListener("keyup", (e) =>
            dispatch(
              MsgKeyUp.make({
                key: e.key,
              }),
            ),
          );

          intervalID = setInterval(() => {
            requestAnimationFrame(() => {
              if (!model.gameOver) {
                dispatch(MsgTick.make());
              }
            });
          }, 1000.0 / model.fps);

          // setInterval(
          //   () => requestAnimationFrame(() => dispatch(MsgTick.make())),
          //   1000.0 / model.fps,
          // );
        },
        insert: (vNode) => {
          const canvas = vNode.elm as HTMLCanvasElement;
          const ctx = canvas.getContext("2d")!;
          const screenWidth = model.screen.width;
          const screenHeight = model.screen.height;
          const worldWidth = model.world.width;
          const worldHeight = model.world.height;
          const offsetX = (screenWidth - worldWidth) / 2;
          const offsetY = (screenHeight - worldHeight) / 2;

          //SCREEN
          ctx.fillStyle = "black";
          ctx.lineWidth = 5;
          ctx.fillRect(0, 0, screenWidth, screenHeight);

          //BORDER
          ctx.strokeStyle = "white";
          ctx.lineWidth = 5;
          ctx.strokeRect(offsetX, offsetY, worldWidth, worldHeight);

          //EGGNEMIES
          ctx.fillStyle = "white";
          ctx.font = "16px sans-serif";
          ctx.fillText(`${model.defeatedCount}`, 10, 20);
          for (const en of model.eggnemies) {
            ctx.fillStyle = "pink";
            ctx.font = "10px sans-serif";
            ctx.fillText(`${en.hp}/${en.maxHp}`, en.x, en.y - 5);

            ctx.fillStyle = "pink"; // different from egg
            ctx.fillRect(en.x, en.y, en.width, en.height);
          }

          //EGG
          if (model.egg != undefined) {
            const egg = model.egg;
            ctx.fillStyle = "white";
            ctx.fillRect(egg.x, egg.y, egg.width, egg.height);

            ctx.fillStyle = "white";
            ctx.font = "16px sans-serif";
            ctx.fillText(`${egg.hp}/${egg.maxHp}`, egg.x, egg.y - 5);
          }

          //BOSS
          if (model.boss != undefined) {
            const boss = model.boss;
            ctx.fillStyle = "red";
            ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

            ctx.fillStyle = "red";
            ctx.font = "16px sans-serif";
            ctx.fillText(`${boss.hp}/${boss.maxHp}`, boss.x, boss.y - 5);
          }

          //TIMER
          ctx.fillStyle = "white";
          ctx.font = "16px sans-serif";
          ctx.fillText(
            `${formatTime(model.elapsedTime)}`,
            model.screen.width - 100,
            20,
          );

          //VICTORY TEXT
          ctx.fillStyle = "white";
          ctx.font = "20px sans-serif";
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(
            `${model.victoryText}`,
            model.world.width / 2,
            model.world.height / 2,
          );
        },

        update: (oldVNode, newVNode) => {
          if (model.gameOver && intervalID) {
            clearInterval(intervalID);
            intervalID = null;
          }
          //how to draw the state on the screen
          const canvas = newVNode.elm as HTMLCanvasElement;
          const ctx = canvas.getContext("2d")!;
          const screenWidth = model.screen.width;
          const screenHeight = model.screen.height;
          const worldWidth = model.world.width;
          const worldHeight = model.world.height;
          const offsetX = (screenWidth - worldWidth) / 2;
          const offsetY = (screenHeight - worldHeight) / 2;

          //SCREEN
          ctx.fillStyle = "black";
          ctx.lineWidth = 5;
          ctx.fillRect(0, 0, screenWidth, screenHeight);

          //BORDER
          ctx.strokeStyle = "white";
          ctx.lineWidth = 5;
          ctx.strokeRect(offsetX, offsetY, worldWidth, worldHeight);

          //EGG
          if (model.egg != undefined) {
            const egg = model.egg;
            ctx.fillStyle = "white";
            ctx.fillRect(egg.x, egg.y, egg.width, egg.height);

            ctx.fillStyle = "white";
            ctx.font = "16px sans-serif";
            ctx.fillText(`${egg.hp}/${egg.maxHp}`, egg.x, egg.y - 5);
          }

          //EGGNEMIES
          ctx.fillStyle = "white";
          ctx.font = "16px sans-serif";
          ctx.fillText(`${model.defeatedCount}`, 10, 20);
          for (const en of model.eggnemies) {
            ctx.fillStyle = "pink";
            ctx.font = "10px sans-serif";
            ctx.fillText(`${en.hp}/${en.maxHp}`, en.x, en.y - 5);

            ctx.fillStyle = "pink"; // different from egg
            ctx.fillRect(en.x, en.y, en.width, en.height);
          }

          //BOSS
          if (model.boss != undefined) {
            const boss = model.boss;
            ctx.fillStyle = "red";
            ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

            ctx.fillStyle = "red";
            ctx.font = "16px sans-serif";
            ctx.fillText(`${boss.hp}/${boss.maxHp}`, boss.x, boss.y - 5);
          }

          //TIMER
          ctx.fillStyle = "white";
          ctx.font = "16px sans-serif";
          ctx.fillText(
            `${formatTime(model.elapsedTime)}`,
            model.screen.width - 100,
            20,
          );

          //VICTORY TEXT
          ctx.fillStyle = "white";
          ctx.font = "20px sans-serif";
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(
            `${model.victoryText}`,
            model.world.width / 2,
            model.world.height / 2,
          );
        },
      },
    }),
  ]);
};
