import { noop, sleep } from ".";
import { DEFAULT_DELAY, Reason } from "../constants";
import { Delay } from "../types";

type HotkeyOnceModeOptions<This> = {
  /**
   * * if `"once"` - {@link HotkeyOnceModeOptions.action action} will call one time for each hotkey press
   */
  mode: "once";
  /**
   * Method to be executed after the {@link HotkeyOptions.key hotkey} is pressed
   */
  action(this: This): void | Promise<void>;
};

type HotkeyRestModesOptions<This, R> = {
  /**
   * * if `"hold"` - {@link HotkeyRestModesOptions.action action} will repeat every {@link HotkeyRestModesOptions.delay delay} milliseconds while hotkey is pressed or {@link HotkeyRestModesOptions.action action} returns `true`
   * * if `"toggle"` - {@link HotkeyRestModesOptions.action action} starts repeat repeat every {@link HotkeyRestModesOptions.delay delay} milliseconds after hotkey first time pressed and stops after hotkey second time pressed or {@link HotkeyRestModesOptions.action action} returns `false`
   */
  mode: "toggle" | "hold";
  /**
   * Method to check if hotkey is need to be executing
   * @default () => true
   */
  isEnable?(this: This): boolean | Promise<boolean>;
  /**
   * Method to be executed before the {@link HotkeyRestModesOptions.action action} loop
   */
  before?(this: This): void | Promise<void>;
  /**
   * @see {@link HotkeyRestModesOptions.mode mode}
   */
  action(this: This): boolean | Promise<boolean>;
  /**
   * Method to be executed after the {@link HotkeyRestModesOptions.action action} loop
   * @param reason - reason of {@link HotkeyRestModesOptions.action action} loop ending, can be {@link Reason} (if ended by action - {@link Reason.BY_ACTION}, if ended by keyboard - {@link Reason.BY_KEYBOARD}) or any value from {@link This.stop stop}
   */
  after?(this: This, reason: Reason | R): void | Promise<void>;
  /**
   * Delay in milliseconds between {@link HotkeyRestModesOptions.action action} executions
   * @default 35
   */
  delay?: Delay;
};

export type HotkeyOptions<This, S, R> = ([S] extends [never]
  ? {
      defaultState?: undefined;
    }
  : {
      defaultState: S;
    }) &
  (HotkeyOnceModeOptions<This> | HotkeyRestModesOptions<This, R>);

declare class _Hotkey<S, R> {
  /**
   * Any state that also can be used via `this` in {@link HotkeyRestModesOptions.isEnable isEnable}, {@link HotkeyRestModesOptions.before before}, {@link HotkeyRestModesOptions.action action}, {@link HotkeyRestModesOptions.after after} methods
   */
  state: S;

  isRunning: boolean;

  /**
   * Stops the loop of {@link HotkeyRestModesOptions.action action} executing
   * @param [reason=Reason.BY_STOP] - reason to {@link HotkeyRestModesOptions.after after}, if not provided defaults to {@link Reason.BY_STOP}
   */
  stop(reason?: Reason.BY_STOP | R): Promise<void> | undefined;

  protected _getButtonState(): boolean;
}

export type Hotkey<S, R> = Omit<_Hotkey<S, R>, never>;

function handleAction<S, R>(
  this: _Hotkey<S, R>,
  options: HotkeyOptions<_Hotkey<S, R>, S, R>
) {
  if ("defaultState" in options) {
    this.state = options.defaultState!;
  }

  const { mode } = options;

  if (mode === "once") {
    const action: OmitThisParameter<typeof options.action> =
      options.action.bind(this);

    this.stop = () => {
      throw new Error('available only for "toggle" and "hold" modes');
    };

    return async () => {
      if (!this.isRunning) {
        this.isRunning = true;

        await action();

        this.isRunning = false;
      }
    };
  }

  let innerToggler = false;

  let outerToggler = true;

  let reason: Reason | R | undefined;

  let completion: Promise<void>;

  this.stop = function (_reason) {
    if (this.isRunning) {
      reason = arguments.length ? _reason : Reason.BY_STOP;

      outerToggler = false;

      return completion.then(() => {
        reason = undefined;

        outerToggler = true;
      });
    }
  };

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

    after = () =>
      fn(
        outerToggler
          ? innerToggler
            ? Reason.BY_ACTION
            : Reason.BY_KEYBOARD
          : reason!
      );
  } else {
    after = noop;
  }

  const { delay = DEFAULT_DELAY } = options;

  const getFn = (getInnerToggler: () => boolean) => async () => {
    if (!this.isRunning) {
      let resolve: () => void;

      completion = new Promise<void>((_resolve) => {
        resolve = _resolve;
      });

      this.isRunning = true;

      if (await isEnable()) {
        await before();

        while (outerToggler && getInnerToggler() && (await action())) {
          await sleep(delay);
        }

        await after();
      }

      this.isRunning = innerToggler = false;

      resolve!();
    }
  };

  if (mode === "hold") {
    return getFn(() => (innerToggler = this._getButtonState()));
  }

  if (mode === "toggle") {
    const fn = getFn(() => innerToggler);

    return () => {
      if ((innerToggler = !innerToggler)) {
        fn();
      }
    };
  }

  throw new Error("Wrong mode");
}

export default handleAction;
