import { _getWindowChildren } from "./addon";
import { WindowInfo } from "./types";
import { normalizeWindowInfo, stringsToBuffers } from "./utils";

type GetWindowChildren = {
  /** @returns array with objects {handle, title, className} of all `parentHandle`'s children. */
  (parentHandle: number): WindowInfo[];
  /** @returns array with objects {handle, title, className} with all children of window with `parentTitle` and/or `parentClassName`. */
  (parentTitle: string | null, parentClassName?: string | null): WindowInfo[];
};

const getWindowChildren: GetWindowChildren = (...args: any[]) =>
  //@ts-expect-error
  _getWindowChildren(...stringsToBuffers(args)).map(normalizeWindowInfo);

export default getWindowChildren;
