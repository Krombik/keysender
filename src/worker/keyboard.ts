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

  const printText = async (text: string, delay: Delay = 0) => {
    const l = text.length - 1;

    for (var i = 0; i < l; i++) {
      worker.printChar(text.codePointAt(i)!);

      await sleep(delay);
    }

    worker.printChar(text.codePointAt(i)!);
  };

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

  const sendKey = async (
    key: KeyboardButton | KeyboardButton[],
    keyTogglerDelay: Delay = DEFAULT_DELAY,
    keySenderDelay: Delay = 0
  ) => {
    if (Array.isArray(key)) {
      await _toggleKeys(key, true);

      await sleep(keyTogglerDelay);

      await _toggleKeys(key, false);
    } else {
      worker.toggleKey(key, true);

      await sleep(keyTogglerDelay);

      worker.toggleKey(key, false);
    }

    return sleep(keySenderDelay);
  };

  const sendKeys = async (
    keys: (KeyboardButton | KeyboardButton[])[],
    keyTogglerDelay: Delay = DEFAULT_DELAY,
    keySenderDelay: Delay = DEFAULT_DELAY,
    delay: Delay = 0
  ) => {
    const l = keys.length - 1;

    for (let i = 0; i < l; i++) {
      await sendKey(keys[i], keyTogglerDelay, keySenderDelay);
    }

    return sendKey(keys[l], keyTogglerDelay, delay);
  };

  return {
    printText,
    toggleKey,
    sendKey,
    sendKeys,
  };
};

export default handleKeyboard;
