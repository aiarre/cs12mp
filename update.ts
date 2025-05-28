import { Cmd } from "cs12242-mvu/src"
import { Array, Match, pipe, Order } from "effect"
import { Model, type Egg } from "./model"
import { Msg } from "./msg"

export const [MsgKeyUp, MsgKeyDown, MsgKeyTick, MsgError] = Msg.members

export const update = (msg: Msg, model: Model) =>
  Match.value(msg).pipe(

    Match.tag("MsgKeyDown", ( { key } ) => {
        const keyPressed = model.keyPressed.includes(key.toLowerCase()) ?
        model.keyPressed :
        [...model.keyPressed, key.toLowerCase()]
        console.log("Key pressed:", keyPressed) 

      return {
        model: Model.make({
          ...model,
          keyPressed,
        }),
      }
    }
    ),

    Match.tag("MsgKeyUp", ( { key } ) => {
        // const keyPressed = model.keyPressed.filter((k) => k !== key.toLowerCase())
        const keyPressed = Array.filter(model.keyPressed, (k) => k !== key.toLowerCase())

        return {
        model: Model.make({
          ...model,
          keyPressed,
        }),
      }
    }),

    Match.tag("MsgKeyTick", () => {
        let { x, y } = model.egg;

        if (model.keyPressed.includes("w")) {y -= 10}
        if (model.keyPressed.includes("s")) {y += 10}
        if (model.keyPressed.includes("a")) {x -= 10}
        if (model.keyPressed.includes("d")) {x += 10}

        return {
            model: Model.make({
            ...model,
            egg: { ...model.egg, x, y },
            }),
        };
    }),
    Match.tag("MsgError", ( {error} ) => {
        return {
            model: Model.make({
            ...model,
            error,
            }),
        }
    }),
    Match.exhaustive,
  )