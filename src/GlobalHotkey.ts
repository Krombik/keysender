import { Reason } from "./constants";
import { KeyboardRegularButton } from "./types";

import { _GlobalHotkey } from "./addon";
import handleAction, { Hotkey, HotkeyOptions } from "./utils/handleAction";

export type GlobalHotkeyOptions<S = never, R = never> = {
  key: KeyboardRegularButton | number;
} & HotkeyOptions<GlobalHotkey<S, R>, S, R>;

class GlobalHotkey<S = never, R = never>
  extends _GlobalHotkey
  implements Hotkey<S, R>
{
  state: S;

  isRunning = false;

  stop: (reason?: Reason.BY_STOP | R) => Promise<void> | undefined;

  /**
   * Registers a hotkey, if any hotkey is already registered for this {@link GlobalHotkeyOptions.key key}, {@link GlobalHotkey.unregister unregisters} the previous hotkey and registers a new hotkey
   */
  constructor(options: GlobalHotkeyOptions<S, R>) {
    super();

    this._register(options.key, handleAction.call(this, options));
  }
}

export default GlobalHotkey;
