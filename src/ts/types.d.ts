import { MergeTypes } from "./helpers";
import { GlobalHotkey } from "./hotkey";

export declare type RandomFromRangeType = [from: number, to: number];

export declare type KeyboardRegularButtonType =
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

export declare type KeyboardSpecButtonType =
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

export declare type KeyboardButtonType =
  | KeyboardRegularButtonType
  | KeyboardSpecButtonType;

export declare type MouseButtonType = "left" | "right" | "middle";

export declare type KeyboardEventType =
  | "beforePrintText"
  | "beforeToggleKey"
  | "beforeSendKey"
  | "beforeSendKeys"
  | "afterPrintText"
  | "afterToggleKey"
  | "afterSendKey"
  | "afterSendKeys";

export declare type MouseEventType =
  | "beforeToggle"
  | "beforeClick"
  | "beforeMoveTo"
  | "beforeMoveCurveTo"
  | "beforeMove"
  | "beforeScrollWheel"
  | "afterToggle"
  | "afterClick"
  | "afterMoveTo"
  | "afterMoveCurveTo"
  | "afterMove"
  | "afterScrollWheel";

export declare type WorkwindowEventType = "capture";

export declare type ImageType = {
  data: Buffer;
  height: number;
  width: number;
};

export declare type WindowInfoType = {
  handle: number;
  className: string;
  title: string;
};

export declare type SizeType = {
  width: number;
  height: number;
};

export declare type PositionType = {
  x: number;
  y: number;
};

export declare type HotkeyOptions<
  Props,
  State,
  This = GlobalHotkey<Props, State>
> = {
  key: KeyboardRegularButtonType | number;
  isEnabled?(this: This): boolean | Promise<boolean>;
} & MergeTypes<
  [
    {
      mode?: "once";
      action(this: This, props: Props): void | Promise<void>;
    },
    {
      mode: "toggle" | "hold";
      action(this: This, props: Props): boolean | Promise<boolean>;
      finalizerCallback?(this: This, props: Props): void | Promise<void>;
      delay?: number;
    }
  ]
> &
  MergeTypes<
    [
      {
        getProps(
          this: This,
          state: State,
          prevState: State,
          prevProps: Props
        ): Props;
        updateState?(this: This, currState: State): State;
        initialState?: State extends {} ? Partial<State> : State;
        initialProps?: Props;
      },
      { getProps?: undefined }
    ]
  >;

export type RgbType = [red: number, green: number, blue: number];

export declare type TextToImgOptions = {
  enableActualHeight?: boolean;
  enableAntiAliasing?: boolean;
  color?: number | string | RgbType;
  backgroundColor?: number | string | RgbType;
  format?: "rgba" | "bgra" | "grey";
};

export declare interface EventEmitter<event> {
  addListener(event: event | string, listener: (...args: any[]) => void): this;
  on(event: event | string, listener: (...args: any[]) => void): this;
  once(event: event | string, listener: (...args: any[]) => void): this;
  removeListener(
    event: event | string,
    listener: (...args: any[]) => void
  ): this;
  off(event: event | string, listener: (...args: any[]) => void): this;
  removeAllListeners(event?: event | string): this;
  setMaxListeners(n: number): this;
  getMaxListeners(): number;
  listeners(event: event | string): Function[];
  rawListeners(event: event | string): Function[];
  emit(event: event | string, ...args: any[]): boolean;
  listenerCount(type: event | string): number;
  prependListener(
    event: event | string,
    listener: (...args: any[]) => void
  ): this;
  prependOnceListener(
    event: event | string,
    listener: (...args: any[]) => void
  ): this;
  eventNames(): Array<event | string>;
}
