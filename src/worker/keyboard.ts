import { DEFAULT_DELAY, MICRO_DELAY } from "../constants";
import { Delay, KeyboardButton } from "../types";
import { Worker } from "../addon";
import { sleep } from "../utils";

const handleKeyboard = (worker: Worker) => {
  const _toggleKey = (key: KeyboardButton, state: boolean) => {
    worker.toggleKey(key, state);

    return sleep(MICRO_DELAY);
  };

  const _toggleKeys = async (keys: KeyboardButton[], state: boolean) => {
    const l = keys.length - 1;

    if (state) {
      for (let i = 0; i < l; i++) {
        await _toggleKey(keys[i], true);
      }

      worker.toggleKey(keys[l], true);
    } else {
      for (let i = l; i--; ) {
        await _toggleKey(keys[i], false);
      }

      worker.toggleKey(keys[0], false);
    }
  };

  /**
   * Prints given text
   * @param text - string to print
   * @param [delay=0] - milliseconds to await after each char typing (excluding last), if not provided defaults to `0`
   */
  const printText = async (text: string, delay: Delay = 0) => {
    const l = text.length - 1;

    for (var i = 0; i < l; i++) {
      worker.printChar(text.codePointAt(i)!);

      await sleep(delay);
    }

    worker.printChar(text.codePointAt(i)!);
  };

  /**
   * Toggling key or combination of keys to provided state
   * @param key - key or array with combination of keys
   * @param state - key state selection: `true` for press, `false` for release
   * @param [delay=35]- milliseconds to await after key toggling, if not provided defaults to `35`
   */
  const toggleKey = async (
    key: KeyboardButton | KeyboardButton[],
    state: boolean,
    delay: Delay = DEFAULT_DELAY
  ) => {
    if (Array.isArray(key)) {
      await _toggleKeys(key, state);
    } else {
      worker.toggleKey(key, state);
    }

    return sleep(delay);
  };

  /**
   * Pressing and releasing key or combination of keys
   * @param key - key or array with combination of keys
   * @param [delayAfterPress=35] - milliseconds to await after key pressed, if not provided defaults to `35`
   * @param [delayAfterRelease=0] - milliseconds to await after key released, if not provided defaults to `0`
   */
  const sendKey = async (
    key: KeyboardButton | KeyboardButton[],
    delayAfterPress: Delay = DEFAULT_DELAY,
    delayAfterRelease: Delay = 0
  ) => {
    if (Array.isArray(key)) {
      await _toggleKeys(key, true);

      await sleep(delayAfterPress);

      await _toggleKeys(key, false);
    } else {
      worker.toggleKey(key, true);

      await sleep(delayAfterPress);

      worker.toggleKey(key, false);
    }

    return sleep(delayAfterRelease);
  };

  /**
   * Pressing and releasing array of keys or combinations of keys
   * @param keys - array with keys.
   * @param [delayAfterPress=35] - milliseconds to await after each key pressed, if not provided defaults to `35`
   * @param [delayAfterRelease=35] - milliseconds to await after each key released (excluding last), if not provided defaults to `35`
   * @param [delay=0] - milliseconds to await after last key released, if not provided defaults to `0`
   */
  const sendKeys = async (
    keys: (KeyboardButton | KeyboardButton[])[],
    delayAfterPress: Delay = DEFAULT_DELAY,
    delayAfterRelease: Delay = DEFAULT_DELAY,
    delay: Delay = 0
  ) => {
    const l = keys.length - 1;

    for (let i = 0; i < l; i++) {
      await sendKey(keys[i], delayAfterPress, delayAfterRelease);
    }

    return sendKey(keys[l], delayAfterPress, delay);
  };

  return {
    printText,
    toggleKey,
    sendKey,
    sendKeys,
  };
};

export default handleKeyboard;
