import handleKeyboard from "./keyboard";
import handleMouse from "./mouse";
import { Worker } from "./types/key_sender";
import { lazyGetters } from "./utils";
import handleWorkwindow, { handleSetWorkwindow } from "./workwindow";

const handleWorker = (WorkerClass: typeof Worker) =>
  class {
    readonly keyboard: ReturnType<typeof handleKeyboard>;
    readonly mouse: ReturnType<typeof handleMouse>;
    readonly workwindow: ReturnType<typeof handleWorkwindow>;

    /** Sets current workwindow by `handle`. */
    constructor(handle?: number);
    /** Finds the first window with `title` and/or `className` and sets it as current workwindow. */
    constructor(title: string | null, className?: string | null);
    /** Finds the first child window with `childClassName` and/or `childTitle` of window with `parentHandle` and sets it as current workwindow. */
    constructor(
      parentHandle: number,
      childClassName: string | null,
      childTitle?: string | null
    );
    /** Finds the first child window with `childClassName` and/or `childTitle` of the first found window with `parentTitle` and/or `parentClassName` and sets it as current workwindow. */
    constructor(
      parentTitle: string | null,
      parentClassName: string | null,
      childClassName: string | null,
      childTitle?: string | null
    );

    constructor(...args: any) {
      const worker = new WorkerClass();

      handleSetWorkwindow(worker)(...args);

      lazyGetters(this, worker, [
        { key: "keyboard", handleModule: handleKeyboard },
        { key: "mouse", handleModule: handleMouse },
        { key: "workwindow", handleModule: handleWorkwindow },
      ]);
    }
  };

export default handleWorker;
