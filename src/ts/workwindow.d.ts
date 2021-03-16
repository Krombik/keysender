import {
  EventEmitter,
  PositionType,
  SizeType,
  ImageType,
  WindowInfoType,
  WorkwindowEventType,
  RgbType,
} from "./types";
export declare interface workwindow extends EventEmitter<WorkwindowEventType> {
  /** Sets current workwindow by {handle}. */
  set(handle?: number): void;
  /** Finds the first window with {title} and/or {className} and sets it as current workwindow. */
  set(title: string | null, className?: string | null): void;
  /** Finds the first child window with {childClassName} and/or {childTitle} of window with {parentHandle} and sets it as current workwindow. */
  set(
    parentHandle: number,
    childClassName: string | null,
    childTitle?: string | null
  ): void;
  /** Finds the first child window with {childClassName} and/or {childTitle} of the first found window with {parentTitle} and/or {parentClassName} and sets it as current workwindow. */
  set(
    parentTitle: string | null,
    parentClassName: string | null,
    childClassName: string | null,
    childTitle?: string | null
  ): void;
  /** Tries to find a new workwindow using already defined {handle}, {className}, {childTitle}, {childClassName}.
   * @returns "true" if new workwindow successfully find (new handle not equal to 0), "false" if it is not.
   */
  refresh(): boolean;
  /** @returns object with {handle}, {title} and {className} of current workwindow. */
  get(): WindowInfoType;
  /** Sets workwindow position and(or) size.
   * @param view - object {x, y, width, height}
   */
  setView(view: Partial<PositionType & SizeType>): void;
  /** @returns object with {x, y, width, height} of current workwindow */
  getView(): PositionType & SizeType;
  /** Makes the current workwindow a foreground window. */
  setForeground(): void;
  isForeground(): boolean;
  isOpen(): boolean;
  /**
   * Captures part of current workwindow (or screen if {handle} is 0).
   * @param part - position of top left corner and size to be capture
   * @param format - color format of return data, could be "rgba", "bgra", "grey", "monochrome"
   * if not provided defaults to "rgba".
   * Note: the bgra format has the best performance, but the alpha channel of pixels is not always 255.
   * @param threshold - color limit for "monochrome" format, if the pixel value is smaller than the threshold, it is set to 0, otherwise it is set to 255
   * if not provided defaults to 127.
   * @returns object {data, width, height}.
   */
  capture(
    part: PositionType & SizeType,
    format?: "rgba" | "bgra" | "grey"
  ): ImageType;
  capture(
    part: PositionType & SizeType,
    format: "monochrome",
    threshold?: number
  ): ImageType;
  capture(format?: "rgba" | "bgra" | "grey"): ImageType;
  capture(format: "monochrome", threshold?: number): ImageType;
  /** @param returnType - type of return value, "string" for hexadecimal color representation "rrggbb", "array" for array representation of color [r,g,b], "number" for color representation in decimal
   * if not provided defaults to "string".
   * @returns pixel color in [x, y] from current workwindow (or screen if {handle} is 0). */
  colorAt(x: number, y: number, returnType?: "string"): string;
  colorAt(x: number, y: number, returnType: "array"): RgbType;
  colorAt(x: number, y: number, returnType: "number"): number;
  /** Terminates current workwindow by killing it's thread. */
  kill(): void;
  /** Closes current workwindow by sending close message. */
  close(): void;
}
