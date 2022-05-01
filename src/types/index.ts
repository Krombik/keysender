export type RandomFromRange = [from: number, to: number];

export type Delay = RandomFromRange | number;

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

export type TextToImgOptions = {
  enableActualHeight?: boolean;
  enableAntiAliasing?: boolean;
  color?: number | string | RGB;
  backgroundColor?: number | string | RGB;
  format?: "rgba" | "bgra" | "grey";
};

type MergeTypesFromArray<T extends {}[]> = T[keyof T extends string
  ? keyof T
  : never];

type AddEmptyFields<T extends {}[], K extends {}> = {
  [i in keyof T]: Omit<K, keyof T[i]> & T[i];
};

type ArrayOfFieldKeys<T extends {}[]> = {
  [i in keyof T]: keyof T[i];
};

type FieldKeysFromArray<T extends string[]> = T[keyof T extends string
  ? keyof T
  : never];

export type XOR<T extends {}[]> = MergeTypesFromArray<
  AddEmptyFields<
    T,
    Partial<Record<FieldKeysFromArray<ArrayOfFieldKeys<T>>, undefined>>
  >
>;
