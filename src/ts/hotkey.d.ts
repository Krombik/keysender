import { keyboardRegularButton } from './types.d'
export declare class GlobalHotkey {
    /**
     * Register hotkey.
     * @param func - function to be calling in new thread after hotkey was pressed.
     * @param mode - if "once" - {func} will repeat one time for each {hotkey} press, if "hold" - {func} will repeat while {hotkey} is pressed, if "toggle" - {func} starts repeat after {hotkey} first time pressed and end repeat after {hotkey} second time pressed,
     * if not provided defaults to "once".
     * @param delay - if {mode} is "hold" or "toggle" - sets delay between {func} calls,
     * if not provided defaults to 0.
     */
    static register(hotkey: keyboardRegularButton | number, hotkeyName: string, func: () => boolean | Promise<boolean>, mode: "hold" | "toggle", delay?: number): void;
    static register(hotkey: keyboardRegularButton | number, hotkeyName: string, func: () => void | Promise<void>, mode: "once"): void;
    static register(hotkey: keyboardRegularButton | number, hotkeyName: string, func: () => void | Promise<void>): void;
    /** Unregister hotkeys by name. */
    static unregister(hotkeyName: string): void;
    /** Unregister all hotkeys. */
    static unregisterAll(): void;
    /** @returns name of {hotkey} or undefined if {hotkey} is not registered. */
    static findHotkeyName(hotkey: keyboardRegularButton | number): string | undefined;
}