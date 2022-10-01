import { _getWindowChildren } from "./addon";
import { WindowInfo } from "./types";
import { normalizeWindowInfo, stringsToBuffers } from "./utils";

const getWindowChildren: {
  (parentHandle: number): WindowInfo[];
  (parentTitle: string | null, parentClassName?: string | null): WindowInfo[];
} = (...args) =>
  //@ts-expect-error
  _getWindowChildren(...stringsToBuffers(args)).map(normalizeWindowInfo);

export default getWindowChildren;
