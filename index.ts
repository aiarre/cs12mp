import { Cmd, h, startModelCmd } from "cs12242-mvu/src"

import { initModel } from "./model"
import { update } from "./update"
import { view } from "./view"

const root = document.getElementById("app")!

startModelCmd(root, initModel, update, view)