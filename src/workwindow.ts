import { Position, RGB, Size, WindowInfo } from "./types";
import { Worker } from "./types/key_sender";
import { stringsToBuffers } from "./utils";

export interface SetWorkwindow {
  /** Sets current workwindow by `handle`. */
  (handle?: number): void;
  /** Finds the first window with `title` and/or `className` and sets it as current workwindow. */
  (title: string | null, className?: string | null): void;
  /** Finds the first child window with `childClassName` and/or `childTitle` of window with `parentHandle` and sets it as current workwindow. */
  (
    parentHandle: number,
    childClassName: string | null,
    childTitle?: string | null
  ): void;
  /** Finds the first child window with `childClassName` and/or `childTitle` of the first found window with `parentTitle` and/or `parentClassName` and sets it as current workwindow. */
  (
    parentTitle: string | null,
    parentClassName: string | null,
    childClassName: string | null,
    childTitle?: string | null
  ): void;
}

export const handleSetWorkwindow = (worker: Worker) =>
  ((...args: any[]) => {
    worker.setWorkwindow(...stringsToBuffers(args));
  }) as SetWorkwindow;

interface ColorAt {
  /** @param returnType - type of return value, "string" for hexadecimal color representation "rrggbb", "array" for array representation of color [r,g,b], "number" for color representation in decimal
   * if not provided defaults to "string".
   * @returns pixel color in [x, y] from current workwindow (or screen if {handle} is 0). */
  (x: number, y: number, returnType?: "string"): string;
  (x: number, y: number, returnType: "array"): RGB;
  (x: number, y: number, returnType: "number"): number;
}

const handleWorkwindow = (worker: Worker) => {
  const add0 = (item: string) => (item.length > 1 ? item : "0" + item);

  const hex = (...rgb: RGB) =>
    rgb.reduce((hex, color) => hex + add0(color.toString(16)), "");

  const get = (): WindowInfo => {
    const workwindow = worker.getWorkwindow();

    return {
      ...workwindow,
      className: workwindow.className.toString("ucs2"),
      title: workwindow.title.toString("ucs2"),
    };
  };

  const colorAt = ((x, y, returnType) => {
    const t = worker.getColor(x, y);

    const color: RGB = [t & 0xff, (t >> 8) & 0xff, (t >> 16) & 0xff];

    switch (returnType) {
      case "array":
        return color;

      case "number":
        return (color[0] << 16) | (color[1] << 8) | color[2];

      default:
        return hex(...color);
    }
  }) as ColorAt;

  return {
    refresh: worker.refresh,
    setForeground: worker.setForeground,
    isForeground: worker.isForeground,
    isOpen: worker.isOpen,
    capture: worker.capture,
    kill: worker.kill,
    close: worker.close,

    set: handleSetWorkwindow(worker),

    set view(view: Position & Size) {
      worker.windowView = view;
    },

    get view() {
      return worker.windowView;
    },

    get,
    colorAt,
  };
};

export default handleWorkwindow;
