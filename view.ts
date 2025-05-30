import { h } from "cs12242-mvu/src";
import { Model } from "./model";
import { Msg, MsgKeyDown, MsgKeyUp, MsgTick } from "./msg";
import { formatTime } from "./utils";

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
            })
              
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
          const offsetX = ((screenWidth - worldWidth) / 2);
          const offsetY = ((screenHeight - worldHeight) / 2);

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
          ctx.fillText(`${formatTime(model.elapsedTime)}`, model.screen.width-100, 20);

          //VICTORY TEXT
          ctx.fillStyle = "white";
          ctx.font = "20px sans-serif";
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(`${model.victoryText}`, model.world.width/2, model.world.height/2)

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
          const offsetX = ((screenWidth - worldWidth) / 2);
          const offsetY = ((screenHeight - worldHeight) / 2);

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
            ctx.fillText(`${egg.hp}/${egg.maxHp}`, egg.x, egg.y-5);
            
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
          ctx.fillText(`${formatTime(model.elapsedTime)}`, model.screen.width-100, 20);

          //VICTORY TEXT
          ctx.fillStyle = "white";
          ctx.font = "20px sans-serif";
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(`${model.victoryText}`, model.world.width/2, model.world.height/2)
        },
      },
    }),
  ]);
};