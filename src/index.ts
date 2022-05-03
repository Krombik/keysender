import { _Hardware, _Virtual } from "./addon";
import handleWorker from "./worker";

export const Hardware = handleWorker(_Hardware);

export const Virtual = handleWorker(_Virtual);

export { default as GlobalHotkey } from "./GlobalHotkey";
