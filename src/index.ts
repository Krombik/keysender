import { _Hardware, _Virtual } from "./addon";
import handleWorker from "./worker";

export const Hardware = handleWorker(_Hardware);

export const Virtual = handleWorker(_Virtual);

export { default as GlobalHotkey, HotkeyOptions } from "./GlobalHotkey";

export { default as textToImg } from "./textToImg";

export { default as getAllWindows } from "./getAllWindows";

export { vkToString, getScreenSize } from "./addon";

export { sleep } from "./utils";
