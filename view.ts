import { h } from "cs12242-mvu/src";
import * as O from "effect/Option";
import { Model } from "./model";
import {
  Msg,
  MsgKeyDown,
  MsgKeyTick,
  MsgUserAttacks,
  MsgUserTouchedEggnemy,
} from "./msg";

let listenerAdded = false;

export const view = (model: Model, dispatch: (msg: Msg) => void) => {
  if (!listenerAdded) {
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          dispatch(MsgKeyDown.make({ key: "w" }));
          dispatch(MsgKeyTick.make());
          break;

        case "ArrowDown":
        case "s":
        case "S":
          dispatch(MsgKeyDown.make({ key: "s" }));
          dispatch(MsgKeyTick.make());
          break;

        case "ArrowLeft":
        case "a":
        case "A":
          dispatch(MsgKeyDown.make({ key: "a" }));
          dispatch(MsgKeyTick.make());
          break;

        case "ArrowRight":
        case "d":
        case "D":
          dispatch(MsgKeyDown.make({ key: "d" }));
          dispatch(MsgKeyTick.make());
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
          O.match(model.egg, {
            onNone: () => {},
            onSome: (egg) => {
              ctx.fillStyle = "white";
              ctx.fillRect(egg.x, egg.y, egg.width, egg.height);

              ctx.fillStyle = "red";
              ctx.font = "16px sans-serif";
              ctx.fillText(`HP: ${egg.hp}/${egg.maxHp}`, 10, 20);
            },
          });
        },

        update: (oldVNode, newVNode) => {
          //how to draw the state on the screen
          const canvas = newVNode.elm as HTMLCanvasElement;
          const ctx = canvas.getContext("2d")!;

          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          //EGG
          O.match(model.egg, {
            onNone: () => {},
            onSome: (egg) => {
              ctx.fillStyle = "white";
              ctx.fillRect(egg.x, egg.y, egg.width, egg.height);

              ctx.fillStyle = "red";
              ctx.font = "16px sans-serif";
              ctx.fillText(`HP: ${egg.hp}/${egg.maxHp}`, 10, 20);
            },
          });

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
