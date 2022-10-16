import { DEFAULT_DELAY } from "./constants";
import { Delay, KeyboardRegularButton } from "./types";
import { noop, sleep } from "./utils";

import { _GlobalHotkey } from "./addon";

export enum Reason {
  BY_KEYBOARD,
  BY_ACTION,
  BY_STOP,
}

type HotkeyOnceModeOptions<S, R> = {
  /**
   * * if `"once"` - {@link HotkeyOnceModeOptions.action action} will call one time for each {@link HotkeyOptions.key key} press
   */
  mode: "once";
  /**
   * Method to be executed after the {@link HotkeyOptions.key hotkey} is pressed
   */
  action(this: GlobalHotkey<S, R>): void | Promise<void>;
};

type HotkeyRestModesOptions<S, R> = {
  /**
   * * if `"hold"` - {@link HotkeyRestModesOptions.action action} will repeat every {@link HotkeyRestModesOptions.delay delay} milliseconds while {@link HotkeyOptions.key key} is pressed or {@link HotkeyRestModesOptions.action action} returns `true`
   * * if `"toggle"` - {@link HotkeyRestModesOptions.action action} starts repeat repeat every {@link HotkeyRestModesOptions.delay delay} milliseconds after {@link HotkeyOptions.key key} first time pressed and stops after {@link HotkeyOptions.key key} second time pressed or {@link HotkeyRestModesOptions.action action} returns `false`
   */
  mode: "toggle" | "hold";
  /**
   * Method to check if hotkey is need to be executing
   * @default () => true
   */
  isEnable?(this: GlobalHotkey<S, R>): boolean | Promise<boolean>;
  /**
   * Method to be executed before the {@link HotkeyRestModesOptions.action action} loop
   */
  before?(this: GlobalHotkey<S, R>): void | Promise<void>;
  /**
   * @see {@link HotkeyRestModesOptions.mode mode}
   */
  action(this: GlobalHotkey<S, R>): boolean | Promise<boolean>;
  /**
   * Method to be executed after the {@link HotkeyRestModesOptions.action action} loop
   * @param reason - reason of {@link HotkeyRestModesOptions.action action} loop ending, can be {@link Reason} (if ended by action - {@link Reason.BY_ACTION}, if ended by keyboard - {@link Reason.BY_KEYBOARD}) or any value from {@link GlobalHotkey.stop stop}
   */
  after?(this: GlobalHotkey<S, R>, reason: Reason | R): void | Promise<void>;
  /**
   * Delay in milliseconds between {@link HotkeyRestModesOptions.action action} executions
   * @default 35
   */
  delay?: Delay;
};

export type HotkeyOptions<S = never, R = never> = {
  /** hotkey */
  key: KeyboardRegularButton | number;
} & ([S] extends [never]
  ? {
      defaultState?: undefined;
    }
  : {
      defaultState: S;
    }) &
  (HotkeyOnceModeOptions<S, R> | HotkeyRestModesOptions<S, R>);

class GlobalHotkey<S = never, R = never> extends _GlobalHotkey {
  private _completion?: Promise<void>;
  private _reason?: Reason | R;
  private _withAfter?: boolean;

  /**
   * Any state that can be used via `this` in {@link HotkeyRestModesOptions.isEnable isEnable}, {@link HotkeyRestModesOptions.before before}, {@link HotkeyRestModesOptions.action action}, {@link HotkeyRestModesOptions.after after} methods or via {@link GlobalHotkey} instance
   */
  state: S;

  /**
   * Registers a hotkey, if any hotkey is already registered for this {@link HotkeyOptions.key key}, {@link GlobalHotkey.unregister unregisters} the previous hotkey and registers a new hotkey
   */
  constructor(options: HotkeyOptions<S, R>) {
    super();

    if ("defaultState" in options) {
      this.state = options.defaultState!;
    }

    let isFree = true;

    const { mode } = options;

    const getAction = () => {
      if (mode === "once") {
        const action: OmitThisParameter<typeof options.action> =
          options.action.bind(this);

        return async () => {
          if (isFree) {
            isFree = false;

            await action();

            isFree = true;
          }
        };
      }

      const action: OmitThisParameter<typeof options.action> =
        options.action.bind(this);

      const isEnable: OmitThisParameter<NonNullable<typeof options.isEnable>> =
        options.isEnable?.bind(this) || (() => true);

      const before: OmitThisParameter<NonNullable<typeof options.before>> =
        options.before?.bind(this) || noop;

      let after: () => void | Promise<void>;

      if (options.after) {
        const fn: OmitThisParameter<NonNullable<typeof options.after>> =
          options.after.bind(this);

        after = () => {
          let reason: Reason | R;

          if ("_reason" in this) {
            reason = this._reason!;

            delete this._reason;
          } else {
            reason = this.hotkeyState ? Reason.BY_ACTION : Reason.BY_KEYBOARD;
          }

          return fn(reason);
        };

        this._withAfter = true;
      } else {
        after = noop;
      }

      const { delay = DEFAULT_DELAY } = options;

      const fn = async () => {
        if (isFree && (await isEnable())) {
          isFree = false;

          this.hotkeyState = true;

          let resolve: () => void;

          this._completion = new Promise<void>((_resolve) => {
            resolve = _resolve;
          });

          await before();

          while (this.hotkeyState && (await action())) {
            await sleep(delay);
          }

          await after();

          this.hotkeyState = false;

          isFree = true;

          resolve!();
        }
      };

      if (mode === "hold") {
        return fn;
      }

      if (mode === "toggle") {
        return () => {
          if (this.hotkeyState) {
            this.hotkeyState = false;
          } else {
            return fn();
          }
        };
      }

      throw new Error("Wrong mode");
    };

    this._register(options.key, mode, getAction());
  }

  /**
   * Stops the loop of {@link HotkeyRestModesOptions.action action} executing
   * @param [reason=Reason.BY_STOP] - reason to {@link HotkeyRestModesOptions.after after}, if not provided defaults to {@link Reason.BY_STOP}
   */
  stop(reason?: Reason.BY_STOP | R) {
    if (this.hotkeyState) {
      if (this._withAfter) {
        this._reason = arguments.length ? reason : Reason.BY_STOP;
      }

      this.hotkeyState = false;

      return this._completion;
    }
  }
}

export default GlobalHotkey;
