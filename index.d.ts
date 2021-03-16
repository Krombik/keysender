import { keyboard } from "./src/ts/keyboard";
import { mouse } from "./src/ts/mouse";
import { workwindow } from "./src/ts/workwindow";

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
  declare keyboard: keyboard;
  /** Provides methods to synthesize mouse motions, and button clicks. */
  declare mouse: mouse;
  /** Provides methods to work with workwindow. */
  declare workwindow: workwindow;
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
