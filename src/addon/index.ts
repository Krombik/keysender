import {
  KeyboardButton,
  MouseButton,
  Position,
  Size,
  Image,
  KeyboardRegularButton,
  TextToImgOptions,
} from "../types";

export declare type _WindowInfo = {
  handle: number;
  title: Buffer;
  className: Buffer;
};

export declare class _Worker {
  /** @returns current cursor position relative to workwindow */
  getPos(): Position;

  toggleMb(button: MouseButton, state: boolean): void;

  move(x: number, y: number, isAbsolute: boolean): void;

  scrollWheel(amount: number): void;

  toggleKey(key: KeyboardButton | number, state: boolean): void;

  printChar(buffer: Buffer): void;

  /**
   * Checks if the current workwindow exist
   */
  isOpen(): boolean;

  /**
   * Checks if the current workwindow is a foreground window
   */
  isForeground(): boolean;

  /**
   * Makes the current workwindow the foreground window
   */
  setForeground(): void;

  /**
   * Captures {@link part} of current workwindow (or screen if `handle` is `0`)
   * @param part - top left corner position and size of part to capture
   * @param [format="rgba"] - color format of returned data, if not provided defaults to `"rgba"`
   */
  capture(part: Position & Size, format?: "rgba" | "bgra" | "grey"): Image;
  /**
   * Captures part of current workwindow (or screen if `handle` is `0`)
   * @param part - top left corner position and size of part to capture
   * @param format - color format of returned data
   * @param [threshold=127] - color limit, if the pixel value is smaller than the threshold, it is set to `0`, otherwise it is set to `255`, if not provided defaults to `127`
   */
  capture(
    part: Position & Size,
    format: "monochrome",
    threshold?: number
  ): Image;
  /**
   * Captures part of current workwindow (or screen if `handle` is `0`)
   * @param [format="rgba"] - color format of returned data, if not provided defaults to `"rgba"`
   */
  capture(format?: "rgba" | "bgra" | "grey"): Image;
  /**
   * Captures part of current workwindow (or screen if `handle` is `0`)
   * @param format - color format of returned data
   * @param [threshold=127] - color limit, if the pixel value is smaller than the threshold, it is set to `0`, otherwise it is set to `255`, if not provided defaults to `127`
   */
  capture(format: "monochrome", threshold?: number): Image;

  getColor(x: number, y: number): number;

  /** Terminates current workwindow by killing it's thread */
  kill(): void;

  /** Closes current workwindow by sending close message */
  close(): void;

  /**
   * Tries to find a new workwindow using already defined `handle`, `className`, `childTitle`, `childClassName`
   * @returns `true` if new workwindow successfully find (new handle not equal to 0), `false` if it is not
   */
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

  getWorkwindow(): _WindowInfo;

  get lastCoords(): Position;

  /**
   * Sets workwindow position and/or size
   */
  setView(view: Partial<Position & Size>): void;

  getView(): Position & Size;
}

export declare class _Hardware extends _Worker {}

export declare class _Virtual extends _Worker {}

export declare class _GlobalHotkey {
  protected _register(
    key: KeyboardRegularButton | number,
    action: () => Promise<void> | void
  ): void;

  protected _getButtonState(): boolean;

  /** reassigns hotkey to {@link newKey}, if some hotkey already registered for {@link newKey}, {@link _GlobalHotkey.unregister unregister} previous hotkey and registers new hotkey */
  reassignment(newKey: KeyboardRegularButton | number): void;
  /** unregister hotkey, hotkey can be reassignment by {@link _GlobalHotkey.reassignment reassignment} method */
  unregister(): void;
  /** unregister all hotkeys, hotkeys can be reassignment by {@link _GlobalHotkey.reassignment reassignment} method */
  static unregisterAll(): void;
  /** delete hotkey */
  delete(): void;
  /** delete all hotkeys */
  static deleteAll(): void;
}

export declare const _textToImg: (
  text: Buffer,
  path: Buffer,
  fontName: Buffer,
  fontSize: number,
  options: Required<TextToImgOptions>
) => Image;

export declare const _getAllWindows: () => _WindowInfo[];

export declare function _getWindowChildren(parentHandle: number): _WindowInfo[];
export declare function _getWindowChildren(
  parentTitle: Buffer | null,
  parentClassName?: Buffer | null
): _WindowInfo[];

/** @returns string name of {@link virtualKey} */
export declare function vkToString(
  virtualKey: number
): Exclude<KeyboardButton, number>;

export declare function getScreenSize(): Size;

export declare type Device = "mouse" | "keyboard";

export declare function isButtonPressed<D extends Device>(
  device: D,
  button: D extends "keyboard" ? KeyboardButton : MouseButton
): boolean;

export declare type DisableInputOptions = {
  mouse?: (MouseButton | "wheel-forward" | "wheel-back" | "move")[];
  keyboard?: KeyboardButton[];
};

export declare type BlockedInput = { state: boolean } & (
  | { device: "mouse"; button: MouseButton | "wheel" }
  | { device: "keyboard"; button: Exclude<KeyboardButton, number> }
);

/**
 * disables the device buttons provided in {@link options}
 * @param options - if some device was not provided, disables all functionality of it
 */
export declare function disableInput(
  disable: true,
  options?: DisableInputOptions
): void;
/**
 * enables the device buttons provided in {@link options}
 * @param options - if some device was not provided, enables all functionality of it
 * @returns array with information about blocked inputs since the last time {@link disableInput} execution (skips mouse move records because it is called too often)
 */
export declare function disableInput(
  disable: false,
  options?: DisableInputOptions
): BlockedInput[];

export declare class _Hook {
  protected _register(
    device: Device,
    button: MouseButton | "wheel" | KeyboardButton,
    state: boolean,
    callback: () => void
  ): void;

  protected _getButtonState(): boolean;

  delete(): void;

  static deleteAll(): void;
}

module.exports = require("../../build/Release/key_sender.node");
