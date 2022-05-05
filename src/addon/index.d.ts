import {
  KeyboardButton,
  MouseButton,
  Position,
  Size,
  Image,
  KeyboardRegularButton,
  TextToImgOptions,
} from "../types";

export type AddonWindowInfo = {
  handle: number;
  title: Buffer;
  className: Buffer;
};

export class Worker {
  /** @returns current cursor position relative to workwindow. */
  getPos(): Position;

  toggleMb(button: MouseButton, state: boolean): void;

  move(x: number, y: number, isAbsolute: boolean): void;

  scrollWheel(amount: number): void;

  toggleKey(key: KeyboardButton | number, state: boolean): void;

  printChar(charCode: number): void;

  isOpen(): boolean;

  isForeground(): boolean;

  setForeground(): void;

  capture(part: Position & Size, format?: "rgba" | "bgra" | "grey"): Image;
  capture(
    part: Position & Size,
    format: "monochrome",
    threshold?: number
  ): Image;
  capture(format?: "rgba" | "bgra" | "grey"): Image;
  capture(format: "monochrome", threshold?: number): Image;

  getColor(x: number, y: number): number;

  kill(): void;

  close(): void;

  refresh(): boolean;

  setWorkwindow(handle?: number): void;
  setWorkwindow(title: Buffer | null, className?: Buffer | null): void;
  setWorkwindow(
    parentHandle: number,
    childClassName: Buffer | null,
    childTitle?: Buffer | null
  ): void;
  setWorkwindow(
    parentTitle: Buffer | null,
    parentClassName: Buffer | null,
    childClassName: Buffer | null,
    childTitle?: Buffer | null
  ): void;

  getWorkwindow(): AddonWindowInfo;

  get lastCoords(): Position;

  set saveMode(value: boolean);

  windowView: Position & Size;
}

export { Worker as _Hardware };

export { Worker as _Virtual };

export class _GlobalHotkey {
  protected _register(
    key: KeyboardRegularButton | number,
    mode: "once" | "toggle" | "hold",
    action: () => Promise<void> | void
  ): void;

  /** Reassigns hotkey to {newKey}, if some hotkey already registered for {newKey}, {unregister} previous hotkey and registers new hotkey */
  reassignment(newKey: KeyboardRegularButton | number): void;
  /** Unregister hotkey, hotkey can be reassignment by {reassignment} method. */
  unregister(): void;
  /** Unregister all hotkeys, hotkeys can be reassignment by {reassignment} method. */
  static unregisterAll(): void;
  /** Delete hotkey. */
  delete(): void;
  /** Delete all hotkeys. */
  static deleteAll(): void;

  /**
   * if `options.mode` is `"hold"` - state of `options.key` (true if `options.key` is pressed, false if it isn't),
   * if `options.mode` is "toggle" - state of toggler,
   * if `options.mode` is "once" - always true.
   */
  hotkeyState: boolean;
}

export const _textToImg: (
  text: Buffer,
  path: Buffer,
  fontName: Buffer,
  fontSize: number,
  options?: TextToImgOptions
) => Image;

export const _getAllWindows: () => AddonWindowInfo[];

export function _getWindowChildren(parentHandle: number): AddonWindowInfo[];
export function _getWindowChildren(
  parentTitle: Buffer | null,
  parentClassName?: Buffer | null
): AddonWindowInfo[];

/** @returns string name of `virtualKey` */
export declare function vkToString(virtualKey: number): KeyboardButton;

/** @returns object {width, height} with screen size. */
export declare function getScreenSize(): Size;
