import { _Worker } from "./addon";

export type Delay = [from: number, to: number] | number;

export type KeyboardRegularButton =
  | "backspace"
  | "tab"
  | "enter"
  | "pause"
  | "capslock"
  | "escape"
  | "space"
  | "pageup"
  | "pagedown"
  | "end"
  | "home"
  | "left"
  | "up"
  | "right"
  | "down"
  | "prntscrn"
  | "insert"
  | "delete"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "num0"
  | "num0"
  | "num1"
  | "num2"
  | "num3"
  | "num4"
  | "num5"
  | "num6"
  | "num7"
  | "num8"
  | "num9"
  | "num*"
  | "num+"
  | "num,"
  | "num-"
  | "num."
  | "num/"
  | "f1"
  | "f2"
  | "f3"
  | "f4"
  | "f5"
  | "f6"
  | "f7"
  | "f8"
  | "f9"
  | "f10"
  | "f11"
  | "f12"
  | "f13"
  | "f14"
  | "f15"
  | "f16"
  | "f17"
  | "f18"
  | "f19"
  | "f20"
  | "f21"
  | "f22"
  | "f23"
  | "f24"
  | "numlock"
  | "scrolllock"
  | ";"
  | "="
  | ","
  | "-"
  | "."
  | "/"
  | "~"
  | "["
  | "|"
  | "]"
  | "'";

export type KeyboardSpecButton =
  | "alt"
  | "ctrl"
  | "shift"
  | "lshift"
  | "rshift"
  | "lctrl"
  | "rctrl"
  | "lalt"
  | "ralt"
  | "lwin"
  | "rwin";

export type KeyboardButton =
  | KeyboardRegularButton
  | KeyboardSpecButton
  | number;

export type MouseButton = "left" | "right" | "middle";

export type Image = {
  data: Buffer;
  height: number;
  width: number;
};

export type WindowInfo = {
  handle: number;
  className: string;
  title: string;
};

export type Size = {
  width: number;
  height: number;
};

export type Position = {
  x: number;
  y: number;
};

export type RGB = [red: number, green: number, blue: number];

export declare type TextToImgOptions = {
  /**
   * if `true` - height of returned img will be equal to `fontSize` (some characters may be trimmed top or bottom)
   * @default false
   */
  enableActualHeight?: boolean;
  /**
   * @default true
   */
  enableAntiAliasing?: boolean;
  /**
   * Text color
   * @default 0xffffff
   */
  color?: number | string | RGB;
  /**
   * @default 0
   */
  backgroundColor?: number | string | RGB;
  /**
   * Color format of returned image
   * * Note: `bgra` format has the best performance, but alpha chanel of each pixel is `0`
   * @default "rgba"
   */
  format?: "rgba" | "bgra" | "grey";
};

export type SetWorkwindow = {
  /** Sets current workwindow by {@link handle}. */
  (handle?: number): void;
  /** Sets current workwindow by first window with {@link title} and/or {@link className} and sets it as current workwindow. */
  (title: string | null, className?: string | null): void;
  /** Sets current workwindow by first child window with {@link childClassName} and/or {@link childTitle} of window with {@link parentHandle}. */
  (
    parentHandle: number,
    childClassName: string | null,
    childTitle?: string | null
  ): void;
  /** Sets current workwindow by first child window with {@link childClassName} and/or {@link childTitle} of the first founded window with {@link parentTitle} and/or {@link parentClassName}. */
  (
    parentTitle: string | null,
    parentClassName: string | null,
    childClassName: string | null,
    childTitle?: string | null
  ): void;
};

export interface Keyboard {
  /**
   * Prints given text
   * @param text - string to print
   * @param [delayAfterCharTyping=0] - milliseconds to await after each char typing (excluding last), if not provided defaults to `0`
   * @param [delay=0] - milliseconds to await after {@link text} printed, if not provided defaults to `0`
   */
  printText(
    text: string,
    delayAfterCharTyping?: Delay,
    delay?: Delay
  ): Promise<void>;

  /**
   * Toggling {@link key key or combination of keys} to provided {@link state}
   * @param key - key or array with combination of keys
   * @param state - {@link key} state selection: `true` for press, `false` for release
   * @param [delay=35]- milliseconds to await after {@link key} toggling, if not provided defaults to `35`
   */
  toggleKey(
    key: KeyboardButton | KeyboardButton[],
    state: boolean,
    delay?: Delay
  ): Promise<void>;

  /**
   * Pressing and releasing {@link key key or combination of keys}
   * @param key - key or array with combination of keys
   * @param [delayAfterPress=35] - milliseconds to await after {@link key} pressed, if not provided defaults to `35`
   * @param [delayAfterRelease=0] - milliseconds to await after {@link key} released, if not provided defaults to `0`
   */
  sendKey(
    key: KeyboardButton | KeyboardButton[],
    delayAfterPress?: Delay,
    delayAfterRelease?: Delay
  ): Promise<void>;

  /**
   * Pressing and releasing array of {@link keys keys or combinations of keys}
   * @param keys - array with keys
   * @param [delayAfterPress=35] - milliseconds to await after each key pressed, if not provided defaults to `35`
   * @param [delayAfterRelease=35] - milliseconds to await after each key released (excluding last), if not provided defaults to `35`
   * @param [delay=0] - milliseconds to await after last key released, if not provided defaults to `0`
   */
  sendKeys(
    keys: (KeyboardButton | KeyboardButton[])[],
    delayAfterPress?: Delay,
    delayAfterRelease?: Delay,
    delay?: Delay
  ): Promise<void>;
}

export interface Mouse extends Pick<_Worker, "getPos" | "saveMode"> {
  /**
   * Switch mouse button state
   * @param button - name of mouse button
   * @param state - {@link button} state selection: `true` for press, `false` for release
   * @param [delay=35] - milliseconds to await after switching {@link button} {@link state}, if not provided defaults to `35`
   */
  toggle(button: MouseButton, state: boolean, delay?: Delay): Promise<void>;

  /**
   * @param [button="left"] - name of mouse button, if not provided defaults to `"left"`
   * @param [delayAfterPress=35] - milliseconds to await after {@link button} pressed, if not provided defaults to `35`
   * @param [delayAfterRelease=0] - milliseconds to await after {@link button} released, if not provided defaults to `0`
   */
  click(
    button?: MouseButton,
    delayAfterPress?: Delay,
    delayAfterRelease?: Delay
  ): Promise<void>;

  /**
   * Move mouse to [{@link x}, {@link y}]
   * @param [delay=0] - milliseconds to await after mouse movement, if not provided defaults to `0`
   */
  moveTo(x: number, y: number, delay?: Delay): Promise<void>;

  /**
   * Simulate human similar mouse movement from current cursor position to [{@link x}, {@link y}]
   * @param [speed=5] - move speed, if not provided defaults to `5`
   * @param [deviation=30] - movement curvature, if not provided defaults to `30`
   */
  moveCurveTo(
    x: number,
    y: number,
    speed?: number,
    deviation?: number
  ): Promise<void>;

  /**
   * Move mouse from current position by [{@link x}, {@link y}] relatively
   * @param [delay=0] - milliseconds to await after mouse movement, if not provided defaults to `0`
   */
  move(x: number, y: number, delay?: Delay): Promise<void>;

  /**
   * @param amount - the amount of wheel movement. A positive value indicates that the wheel was rotated forward, away from the user, a negative value indicates that the wheel was rotated backward, toward the user
   * @param [delay=0] - milliseconds to await after wheel scroll, if not provided defaults to `0`
   */
  scrollWheel(amount: number, delay?: Delay): Promise<void>;
}

export interface Workwindow
  extends Pick<
    _Worker,
    | "refresh"
    | "setForeground"
    | "isForeground"
    | "isOpen"
    | "capture"
    | "kill"
    | "close"
    | "getView"
    | "setView"
  > {
  set: SetWorkwindow;
  get(): WindowInfo;
  colorAt: {
    /**
     * @param format - type of return value:
     * * `"string"` for hexadecimal color representation "rrggbb"
     * * `"array"` for array representation of color [r,g,b]
     * * `"number"` for color representation in decimal
     * * if not provided defaults to `"string"`
     * @returns pixel color in [{@link x}, {@link y}] of current workwindow (or screen if `handle` was unset)
     */
    (x: number, y: number, format?: "string"): string;
    (x: number, y: number, format: "array"): RGB;
    (x: number, y: number, format: "number"): number;
  };
}
