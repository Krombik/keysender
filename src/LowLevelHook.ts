import { Device, _Hook } from "./addon";
import { Reason } from "./constants";
import { KeyboardButton, MouseButton } from "./types";
import handleAction, { Hotkey, HotkeyOptions } from "./utils/handleAction";

export type LowLevelHookOptions<S, R> = (
  | {
      device: "keyboard";
      button: KeyboardButton | number;
    }
  | {
      device: "mouse";
      button: MouseButton;
    }
) &
  HotkeyOptions<LowLevelHook<S, R>, S, R>;

class LowLevelHook<S = never, R = never> extends _Hook implements Hotkey<S, R> {
  state: S;

  isRunning = false;

  stop: (reason?: Reason.BY_STOP | R) => Promise<void> | undefined;

  constructor(options: LowLevelHookOptions<S, R>) {
    super();

    this._register(
      options.device,
      options.button,
      true,
      handleAction.call(this, options)
    );
  }

  /**
   * adds {@link listener} for given {@link device}, {@link button} and {@link state}
   * @param state
   * * if {@link button} is `"wheel"`: `true` for wheel going forward, `false` for wheel going back,
   * * overwise: `true` for {@link button} press, `false` for {@link button} release
   * @returns unlisten method
   */
  static on<D extends Device>(
    device: D,
    button: D extends "mouse" ? MouseButton | "wheel" : KeyboardButton | number,
    state: boolean,
    listener: () => void
  ) {
    const hook = new _Hook();

    //@ts-expect-error
    hook._register(device, button, state, listener);

    return () => hook.delete();
  }
}

export default LowLevelHook;
