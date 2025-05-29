import { h } from "cs12242-mvu/src";
import { Model } from "./model";
import { Msg } from "./msg";

export const [MsgKeyTick, MsgKeyDown, MsgEggnemyFollows, MsgUserTouchedEggnemy, MsgError] = Msg.members;

let listenerAdded = false;
let intervalStarted = false;

export const view = (model: Model, dispatch: (msg: Msg) => void) => {
  if (!listenerAdded) {
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        dispatch(MsgKeyDown.make({ key:"w" }));
        dispatch(MsgKeyTick.make());
        break

      case "ArrowDown":
      case "s":
      case "S":
        dispatch(MsgKeyDown.make({ key: "s" }));
        dispatch(MsgKeyTick.make());
        break

      case "ArrowLeft":
      case "a":
      case "A":
        dispatch(MsgKeyDown.make({ key: "a" }));
        dispatch(MsgKeyTick.make());
        break

      case "ArrowRight":
      case "d":
      case "D":
        dispatch(MsgKeyDown.make({ key: "d"}));
        dispatch(MsgKeyTick.make());
        break

      }
      listenerAdded = true;  
    });
  }

  if (!intervalStarted) {
    setInterval(() => {
      dispatch(MsgUserTouchedEggnemy.make());
      // dispatch(MsgEggnemyFollows.make())
    }, 1000);
    intervalStarted = true;
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
          const canvas = vnode.elm as HTMLCanvasElement
          const ctx = canvas.getContext("2d")!
          
          ctx.fillStyle = "black"
          ctx.fillRect(0,0, canvas.width, canvas.height)

          ctx.fillStyle = "white"
          ctx.fillRect(model.egg.x, model.egg.y, model.egg.width, model.egg.height)
          
          ctx.fillStyle = "red"
          ctx.font = "16px sans-serif"
          ctx.fillText(`HP: ${model.egg.hp}/${model.egg.maxHp}`, 10, 20)
        },
        
        update: (oldVNode, newVNode) => { //how to draw the state on the screen
          const canvas = newVNode.elm as HTMLCanvasElement
          const ctx = canvas.getContext("2d")!
          
          ctx.fillStyle = "black"
          ctx.fillRect(0,0, canvas.width, canvas.height)
          
          ctx.fillStyle = "white"
          ctx.fillRect(model.egg.x, model.egg.y, model.egg.width, model.egg.height)
          
          ctx.fillStyle = "red"
          ctx.font = "16px sans-serif"
          ctx.fillText(`HP: ${model.egg.hp}/${model.egg.maxHp}`, 10, 20)
        }
      }
    })
  ]);
};