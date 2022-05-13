import { contextBridge } from "electron";
import { theming } from "./renderer/theming";

export const api = {
  theming,
};
contextBridge.exposeInMainWorld("Main", api);
