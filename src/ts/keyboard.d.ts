import { GenericEventEmitter } from "./helpers";
import { RandomFromRangeType, KeyboardButtonType } from "./types";

interface _Keyboard {
  keyTogglerDelay: number | RandomFromRangeType;
  keySenderDelay: number | RandomFromRangeType;
  /** Prints text.
   * @param text - string to print.
   * @param afterTypeDelay - milliseconds to sleep after each char typed excluding last,
   * if not provided defaults to 0.
   */
  printText(text: string, afterTypeDelay?: number | RandomFromRangeType): void;
  /** Prints text async.
   * @param text - string to print.
   * @param afterTypeDelay - milliseconds to await after each char typed excluding last,
   * if not provided defaults to 0.
   */
  printTextAsync(
    text: string,
    afterTypeDelay?: number | RandomFromRangeType
  ): Promise<void>;
  /**
   * Toggles key or combination of keys to provided state.
   * @param key - key or array with combination of keys.
   * @param state - key state selection: true for press, false for release,
   * if not provided defaults to true.
   * @param delay - milliseconds to sleep after key toggled,
   * if not provided defaults to keyboard.keyTogglerDelay.
   */
  toggleKey(
    key: KeyboardButtonType | KeyboardButtonType[] | number | number[],
    state?: boolean,
    delay?: number | RandomFromRangeType
  ): void;
  /**
   * Toggles key or combination of keys to provided state async.
   * @param key - key or array with combination of keys.
   * @param state - key state selection: true for press, false for release,
   * if not provided defaults to true.
   * @param delay -milliseconds to await after key toggled,
   * if not provided defaults to keyboard.keyTogglerDelay.
   */
  toggleKeyAsync(
    key: KeyboardButtonType | KeyboardButtonType[] | number | number[],
    state?: boolean,
    delay?: number | RandomFromRangeType
  ): Promise<void>;
  /**
   * Press and release key or combination of keys.
   * @param key - key or array with combination of keys.
   * @param afterPressDelay - milliseconds to sleep after key pressed,
   * if not provided defaults to keyboard.keyTogglerDelay.
   * @param afterReleaseDelay - milliseconds to sleep after key released,
   * if not provided defaults to 0.
   */
  sendKey(
    key: KeyboardButtonType | KeyboardButtonType[] | number | number[],
    afterPressDelay?: number | RandomFromRangeType,
    afterReleaseDelay?: number | RandomFromRangeType
  ): void;
  /**
   * Press and release key or combination of keys async.
   * @param key - key or array with combination of keys.
   * @param afterPressDelay - milliseconds to await after key pressed,
   * if not provided defaults to keyboard.keyTogglerDelay.
   * @param afterReleaseDelay - milliseconds to await after key released,
   * if not provided defaults to 0.
   */
  sendKeyAsync(
    key: KeyboardButtonType | KeyboardButtonType[] | number | number[],
    afterPressDelay?: number | RandomFromRangeType,
    afterReleaseDelay?: number | RandomFromRangeType
  ): Promise<void>;
  /**
   * Press and release array of keys.
   * @param keys - array with keys.
   * @param afterPressDelay - milliseconds to sleep after each key pressed,
   * if not provided defaults to keyboard.keyTogglerDelay.
   * @param afterReleaseDelay - delay in milliseconds to sleep after each key released excluding last,
   * if not provided defaults to {afterPressDelay}, if {afterPressDelay} not provided defaults to keyboard.keySenderDelay.
   */
  sendKeys(
    keys: KeyboardButtonType[] | number[],
    afterPressDelay?: number | RandomFromRangeType,
    afterReleaseDelay?: number | RandomFromRangeType
  ): void;
  /**
   * Press and release array of keys async.
   * @param keys - array with keys.
   * @param afterPressDelay - milliseconds to await after each key pressed,
   * if not provided defaults to keyboard.keyTogglerDelay.
   * @param afterReleaseDelay - delay in milliseconds to await after each key released excluding last,
   * if not provided defaults to {afterPressDelay}, if {afterPressDelay} not provided defaults to keyboard.keySenderDelay.
   */
  sendKeysAsync(
    keys: KeyboardButtonType[] | number[],
    afterPressDelay?: number | RandomFromRangeType,
    afterReleaseDelay?: number | RandomFromRangeType
  ): Promise<void>;
}

type Keyboard = _Keyboard &
  GenericEventEmitter<
    _Keyboard,
    "printText" | "toggleKey" | "sendKey" | "sendKeys"
  >;

export default Keyboard;
