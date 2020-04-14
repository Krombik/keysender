import { EventEmitter, randomFromRange, keyboardButton, keyboardEvent } from './types.d'
export declare interface keyboard extends EventEmitter<keyboardEvent> {
    keyTogglerDelay: number | randomFromRange;
    keySenderDelay: number | randomFromRange;
    /** Prints text.
     * @param text - string to print.
     * @param afterTypeDelay - milliseconds to sleep after each char typed excluding last,
     * if not provided defaults to 0.
     */
    printText(text: string, afterTypeDelay?: number | randomFromRange): void;
    /** Prints text async.
     * @param text - string to print.
     * @param afterTypeDelay - milliseconds to await after each char typed excluding last,
     * if not provided defaults to 0.
     */
    printTextAsync(text: string, afterTypeDelay?: number | randomFromRange): Promise<void>;
    /**
     * Toggles key or combination of keys to provided state.
     * @param key - key or array with combination of keys.
     * @param state - key state selection: true for press, false for release,
     * if not provided defaults to true.
     * @param delay - milliseconds to sleep after key toggled,
     * if not provided defaults to keyboard.keyTogglerDelay.
     */
    toggleKey(key: keyboardButton | keyboardButton[] | number | number[], state?: boolean, delay?: number | randomFromRange): void;
    /**
     * Toggles key or combination of keys to provided state async.
     * @param key - key or array with combination of keys.
     * @param state - key state selection: true for press, false for release,
     * if not provided defaults to true.
     * @param delay -milliseconds to await after key toggled,
     * if not provided defaults to keyboard.keyTogglerDelay.
     */
    toggleKeyAsync(key: keyboardButton | keyboardButton[] | number | number[], state?: boolean, delay?: number | randomFromRange): Promise<void>;
    /**
     * Press and release key or combination of keys.
     * @param key - key or array with combination of keys.
     * @param afterPressDelay - milliseconds to sleep after key pressed,
     * if not provided defaults to keyboard.keyTogglerDelay.
     * @param afterReleaseDelay - milliseconds to sleep after key released,
     * if not provided defaults to 0.
     */
    sendKey(key: keyboardButton | keyboardButton[] | number | number[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): void;
    /**
     * Press and release key or combination of keys async.
     * @param key - key or array with combination of keys.
     * @param afterPressDelay - milliseconds to await after key pressed,
     * if not provided defaults to keyboard.keyTogglerDelay.
     * @param afterReleaseDelay - milliseconds to await after key released,
     * if not provided defaults to 0.
     */
    sendKeyAsync(key: keyboardButton | keyboardButton[] | number | number[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): Promise<void>;
    /**
     * Press and release array of keys.
     * @param keys - array with keys.
     * @param afterPressDelay - milliseconds to sleep after each key pressed,
     * if not provided defaults to keyboard.keyTogglerDelay.
     * @param afterReleaseDelay - delay in milliseconds to sleep after each key released excluding last,
     * if not provided defaults to {afterPressDelay}, if {afterPressDelay} not provided defaults to keyboard.keySenderDelay.
     */
    sendKeys(keys: keyboardButton[] | number[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): void;
    /**
     * Press and release array of keys async.
     * @param keys - array with keys.
     * @param afterPressDelay - milliseconds to await after each key pressed,
     * if not provided defaults to keyboard.keyTogglerDelay.
     * @param afterReleaseDelay - delay in milliseconds to await after each key released excluding last,
     * if not provided defaults to {afterPressDelay}, if {afterPressDelay} not provided defaults to keyboard.keySenderDelay.
     */
    sendKeysAsync(keys: keyboardButton[] | number[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): Promise<void>;
}