import { _getWindowChildren } from "./addon";
import { WindowInfo } from "./types";
import { normalizeWindowInfo, stringsToBuffers } from "./utils";

type GetWindowChildren = {
  (parentHandle: number): WindowInfo[];
  (parentTitle: string | null, parentClassName?: string | null): WindowInfo[];
};

const getWindowChildren: GetWindowChildren = (...args: any[]) =>
  //@ts-expect-error
  _getWindowChildren(...stringsToBuffers(args)).map(normalizeWindowInfo);

export default getWindowChildren;
