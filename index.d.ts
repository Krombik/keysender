import { Keyboard } from "./src/ts/keyboard";
import { Mouse } from "./src/ts/mouse";
import { Workwindow } from "./src/ts/workwindow";

declare class Worker {
  /** Sets current workwindow by {handle}. */
  constructor(handle?: number);
  /** Finds the first window with {title} and/or {className} and sets it as current workwindow. */
  constructor(title: string | null, className?: string | null);
  /** Finds the first child window with {childClassName} and/or {childTitle} of window with {parentHandle} and sets it as current workwindow. */
  constructor(
    parentHandle: number,
    childClassName: string | null,
    childTitle?: string | null
  );
  /** Finds the first child window with {childClassName} and/or {childTitle} of the first found window with {parentTitle} and/or {parentClassName} and sets it as current workwindow. */
  constructor(
    parentTitle: string | null,
    parentClassName: string | null,
    childClassName: string | null,
    childTitle?: string | null
  );
  /** Provides methods to synthesize keystrokes. */
  declare keyboard: Keyboard;
  /** Provides methods to synthesize mouse motions, and button clicks. */
  declare mouse: Mouse;
  /** Provides methods to work with workwindow. */
  declare workwindow: Workwindow;
}

/** Provides methods implementations on hardware level. */
export declare class Hardware extends Worker {}

/** Provides methods implementations on virtual level. */
export declare class Virtual extends Worker {}

export {
  vkToString,
  getScreenSize,
  getAllWindows,
  getWindowChildren,
  sleep,
  textToImg,
} from "./src/ts/utilities";

export { GlobalHotkey } from "./src/ts/hotkey";

export * from "./src/ts/types";
