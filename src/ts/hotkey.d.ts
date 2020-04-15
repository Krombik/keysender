import { keyboardRegularButton } from './types.d'
export declare class GlobalHotkey {
    /**
     * Registers {hotkey}, if {hotkey} already registered, re-registers it.
     * @param func - function to be call in new thread after hotkey was pressed.
     * @param mode - if "once" - {func} will repeat one time for each {hotkey} press, if "hold" - {func} will repeat while {hotkey} is pressed or {func} returns true, if "toggle" - {func} starts repeat after {hotkey} first time pressed and end repeat after {hotkey} second time pressed or {func} returns false,
     * if not provided defaults to "once".
     * @param delay - if {mode} is "hold" or "toggle" - sets delay between {func} calls,
     * if not provided defaults to 0.
     * @param finalizerCallback - if {mode} is "hold" or "toggle" - function to be call after hotkey work is end.
     */
    constructor(hotkey: keyboardRegularButton | number, func: () => boolean | Promise<boolean>, mode: "hold" | "toggle", delay?: number, finalizerCallback?: () => void | Promise<void>);
    constructor(hotkey: keyboardRegularButton | number, func: () => void | Promise<void>, mode?: "once");
    /** Reassigns {hotkey} to {newHotkey}, if {newHotkey} already registered, re-registers it */
    reassignment(newHotkey: keyboardRegularButton | number): void;
    /** Unregister hotkey, hotkey can be re-register by {reassignment} method. */
    unregister(): void;
    /** Unregister all hotkeys, hotkeys can be re-register by {reassignment} method. */
    static unregisterAll(): void;
    /** Delete hotkey. */
    delete(): void;
    /** Delete all hotkeys. */
    static deleteAll(): void;
}