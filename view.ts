import { h } from "cs12242-mvu/src";
import * as O from "effect/Option";
import { Model } from "./model";
import { Msg, MsgKeyDown, MsgKeyUp, MsgTick, MsgUserAttacks } from "./msg";

let listenerAdded = false;

export const view = (model: Model, dispatch: (msg: Msg) => void) => {
  if (!listenerAdded) {
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          dispatch(MsgKeyDown.make({ key: "w" }));
          break;

        case "ArrowDown":
        case "s":
        case "S":
          dispatch(MsgKeyDown.make({ key: "s" }));
          break;

        case "ArrowLeft":
        case "a":
        case "A":
          dispatch(MsgKeyDown.make({ key: "a" }));
          break;

        case "ArrowRight":
        case "d":
        case "D":
          dispatch(MsgKeyDown.make({ key: "d" }));
          break;

        case "l":
        case "L":
          dispatch(MsgUserAttacks.make());
          break;
      }
      listenerAdded = true;
    });
  }

  return h("div", [
    h("canvas", {
      props: {
        width: 800,
        height: 600,
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
          setInterval(
            () => requestAnimationFrame(() => dispatch(MsgTick.make())),
            1000.0 / model.fps,
          );
        },
        insert: (vnode) => {
          const canvas = vnode.elm as HTMLCanvasElement;
          const ctx = canvas.getContext("2d")!;

          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          //EGGNEMIES
          for (const en of model.eggnemies) {
            ctx.fillStyle = "pink"; // different from egg
            ctx.fillRect(en.x, en.y, en.width, en.height);
          }

          //EGG
          if (model.egg != undefined) {
            const egg = model.egg;
            ctx.fillStyle = "white";
            ctx.fillRect(egg.x, egg.y, egg.width, egg.height);

            ctx.fillStyle = "red";
            ctx.font = "16px sans-serif";
            ctx.fillText(`HP: ${egg.hp}/${egg.maxHp}`, 10, 20);
          }
        },

        update: (oldVNode, newVNode) => {
          //how to draw the state on the screen
          const canvas = newVNode.elm as HTMLCanvasElement;
          const ctx = canvas.getContext("2d")!;

          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          //EGG
          if (model.egg != undefined) {
            const egg = model.egg;
            ctx.fillStyle = "white";
            ctx.fillRect(egg.x, egg.y, egg.width, egg.height);

            ctx.fillStyle = "red";
            ctx.font = "16px sans-serif";
            ctx.fillText(`HP: ${egg.hp}/${egg.maxHp}`, 10, 20);
          }

          //EGGNEMIES
          for (const en of model.eggnemies) {
            ctx.fillStyle = "pink"; // different from egg
            ctx.fillRect(en.x, en.y, en.width, en.height);
          }
        },
      },
    }),
  ]);
};

// ctx.fillStyle = "white"
// if (model.egg) {
//   const egg = model.egg;
//   ctx.fillRect(egg.x, egg.y, egg.width, egg.height);
// }

// ctx.fillStyle = "red"
// ctx.font = "16px sans-serif"
// if (model.egg) {
//   const egg = model.egg;
//   ctx.fillText(`HP: ${model.egg.hp}/${model.egg.maxHp}`, 10, 20);
// }

// if (model.egg.isSome()) {
//   const egg = model.egg.unwrap();
//   ctx.fillRect(egg.x, egg.y, egg.width, egg.height);
//}
