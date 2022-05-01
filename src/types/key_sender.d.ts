import {
  KeyboardButton,
  MouseButton,
  Position,
  Size,
  Image,
  WindowInfo,
  KeyboardRegularButton,
} from ".";

export class Worker {
  getPos(): Position;

  toggleMb(button: MouseButton, state: boolean): void;

  move(x: number, y: number, isAbsolute: boolean): void;

  scrollWheel(amount: number): void;

  toggleKey(key: KeyboardButton | number, state: boolean): void;

  printChar(charCode: number): void;

  isOpen(): boolean;

  isForeground(): boolean;

  setForeground(): void;

  capture(part: Position & Size, format?: "rgba" | "bgra" | "grey"): Image;
  capture(
    part: Position & Size,
    format: "monochrome",
    threshold?: number
  ): Image;
  capture(format?: "rgba" | "bgra" | "grey"): Image;
  capture(format: "monochrome", threshold?: number): Image;

  getColor(x: number, y: number): number;

  kill(): void;

  close(): void;

  refresh(): boolean;

  setWorkwindow(handle?: number): void;
  setWorkwindow(title: Buffer | null, className?: Buffer | null): void;
  setWorkwindow(
    parentHandle: number,
    childClassName: Buffer | null,
    childTitle?: Buffer | null
  ): void;
  setWorkwindow(
    parentTitle: Buffer | null,
    parentClassName: Buffer | null,
    childClassName: Buffer | null,
    childTitle?: Buffer | null
  ): void;

  getWorkwindow(): { handle: number; title: Buffer; className: Buffer };

  get lastCoords(): Position;

  set saveMode(value: boolean);

  windowView: Position & Size;
}

declare module "*key_sender.node" {
  export { Worker as _Hardware };

  export { Worker as _Virtual };

  export class _GlobalHotkey {
    private _register(
      key: KeyboardRegularButton | number,
      mode: "once" | "toggle" | "hold",
      action: () => Promise<void> | void
    );

    /** Reassigns hotkey to {newKey}, if some hotkey already registered for {newKey}, {unregister} previous hotkey and registers new hotkey */
    reassignment(newKey: KeyboardRegularButton | number): void;
    /** Unregister hotkey, hotkey can be reassignment by {reassignment} method. */
    unregister(): void;
    /** Unregister all hotkeys, hotkeys can be reassignment by {reassignment} method. */
    static unregisterAll(): void;
    /** Delete hotkey. */
    delete(): void;
    /** Delete all hotkeys. */
    static deleteAll(): void;

    /**
     * if `options.mode` is `"hold"` - state of `options.key` (true if `options.key` is pressed, false if it isn't),
     * if {options.mode} is "toggle" - state of toggler,
     * if {options.mode} is "once" - always true.
     */
    hotkeyState: boolean;
  }
}
