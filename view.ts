import { h } from "cs12242-mvu/src"
import { Model } from "./model"
import { Msg } from "./msg"
import { Array } from 'effect'


export const [MsgKeyUp, MsgKeyDown, MsgKeyTick, MsgError] = Msg.members
 

export const view = (model: Model, dispatch: (msg: Msg) => void) =>
h("div", [
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
]) // closing bracket for the whole div
    