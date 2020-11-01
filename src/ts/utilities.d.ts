import {
  KeyboardButtonType,
  RandomFromRangeType,
  SizeType,
  WindowInfoType,
  ImageType,
  textToImgOptions,
} from "./types.d";

/**
 * Draws text using the specified font (supports .ttf and .otf only).
 * @param text - text to draw.
 * @param path - path to font.
 * @param fontSize - font size in px.
 * @param options - object with options
 * @param options.enableActualHeight - if true - height of returned img be equal to {fontSize} (some characters may be trimmed top or bottom),
 * if not provided defaults to false.
 * @param options.enableAntiAliasing - if true - anti-aliasing enabled,
 * if not provided defaults to true.
 * @param options.color - text color, could be [r, g, b] or "rrggbb" or number,
 * if not provided defaults to 0xffffff(white).
 * @param options.backgroundColor - background color, could be [r, g, b] or "rrggbb" or number,
 * if not provided defaults to 0(black).
 * @param options.format - color format of return data, could be "rgba", "bgra", "grey",
 * if not provided defaults to "rgba".
 * @returns object {data, width, height}.
 */
export declare function textToImg(
  text: string,
  path: string,
  fontSize: number,
  options?: textToImgOptions
): ImageType;

/** @returns string name of {virtualKey} */
export declare function vkToString(virtualKey: number): KeyboardButtonType;

/** Pause current thread for {ms} milliseconds. */
export declare function sleep(ms: number | RandomFromRangeType): void;

/** @returns object {width, height} with screen size. */
export declare function getScreenSize(): SizeType;

/** @returns array with objects {handle, title, className} of all open windows. */
export declare function getAllWindows(): WindowInfoType[];

/** @returns array with objects {handle, title, className} of all {parentHandle} children. */
export declare function getWindowChildren(
  parentHandle: number
): WindowInfoType[];
/** @returns array with objects {handle, title, className} with all children of window with {parentTitle} and/or {parentClassName}. */
export declare function getWindowChildren(
  parentTitle: string | null,
  parentClassName?: string | null
): WindowInfoType[];
