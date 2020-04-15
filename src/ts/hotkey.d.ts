import { keyboardRegularButton } from './types.d'
export declare class GlobalHotkey {
    /**
     * Registers {hotkey}, if {hotkey} already registered, re-registers it.
     * @param func - function to be calling in new thread after hotkey was pressed.
     * @param mode - if "once" - {func} will repeat one time for each {hotkey} press, if "hold" - {func} will repeat while {hotkey} is pressed, if "toggle" - {func} starts repeat after {hotkey} first time pressed and end repeat after {hotkey} second time pressed,
     * if not provided defaults to "once".
     * @param delay - if {mode} is "hold" or "toggle" - sets delay between {func} calls,
     * if not provided defaults to 0.
     */
    constructor(hotkey: keyboardRegularButton | number, func: () => boolean | Promise<boolean>, mode: "hold" | "toggle", delay?: number);
    constructor(hotkey: keyboardRegularButton | number, func: () => void | Promise<void>, mode?: "once");
    /** Reassigns {hotkey} to {newHotkey}, if {newHotkey} already registered, re-registers it */
    reassignment(newHotkey: keyboardRegularButton | number): void;
    /** Unregister hotkey. */
    unregister(): void;
    /** Unregister all hotkeys. */
    static unregisterAll(): void;
}