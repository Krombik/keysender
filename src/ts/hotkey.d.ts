import { KeyboardRegularButtonType, HotkeyOptions } from "./types";

export declare class GlobalHotkey<Props = unknown, State = unknown> {
  /** Registers hotkey, if some hotkey already registered for this {options.key}, {unregister} previous hotkey and registers new hotkey.
   * @param options.key - hotkey.
   * @param options.mode - if "once" - {options.action} will call one time for each {options.key} press,
   * if "hold" - {options.action} will repeat every {options.delay} milliseconds while {options.key} is pressed or {options.action} returns true,
   * if "toggle" - {options.action} starts repeat repeat every {options.delay} milliseconds after {options.key} first time pressed and stops after {options.key} second time pressed or {options.action} returns false,
   * if not provided defaults to "once".
   * @param options.isEnabled - function to check if hotkey is need to be executing.
   * @param options.action - function to be call after hotkey was pressed.
   * @param options.finalizerCallback - if {options.mode} is "hold" or "toggle" - function to be call after hotkey work is end.
   * @param options.delay - if {options.mode} is "hold" or "toggle" - sets delay between {options.action} calls,
   * if not provided defaults to 0.
   * @param options.getProps - function for updating the {options.action} argument (see example below), executed once before starting {options.action}.
   * @param options.updateState - state update function for {options.getProps}, use this for some uncontrollable things like window resizing
   * @param options.initialProps - props for first {options.getProps} call
   * @param options.initialState - state for first {options.getProps} and {options.updateState} call
   *
   * @example
   * const obj = new Hardware(null, "Notepad");
   * new GlobalHotkey({
   *   key: "num+",
   *   isEnabled() {
   *     return obj.workwindow.isOpen(); //check if window open, if it closed - stopping here.
   *   },
   *   getProps(state, prevState, prevProps) {
   *     if (   // check is something changing after previous hotkey pressing or is it first call
   *       !prevProps ||
   *       state.height !== prevState.height ||
   *       state.width !== prevState.width
   *     )
   *       return [state.width / 2, state.height / 2];
   *     return prevProps;
   *   },
   *   updateState(state) {
   *     const { height, width } = obj.workwindow.getView();
   *     return { height, width };
   *   },
   *   async action(props) {
   *     await obj.mouse.moveToAsync(...props);
   *     await obj.mouse.clickAsync();
   *   },
   * });
   */
  constructor(options: HotkeyOptions<Props, State>);
  /** if {options.mode} is "hold" - state of {options.key} (true if {options.key} is pressed, false if it isn't),
   *  if {options.mode} is "toggle" - state of toggler */
  readonly hotkeyState: boolean;
  /** Note: available only if {options.getProps} exist */
  setState: {
    (newState: State): void;
    (setStateFunc: (prevState: State) => State): void;
  };
  /** Note: available only if {options.getProps} exist */
  getState(): State;
  /** Reassigns hotkey to {newKey}, if some hotkey already registered for {newKey}, {unregister} previous hotkey and registers new hotkey */
  reassignment(newKey: KeyboardRegularButtonType | number): void;
  /** Unregister hotkey, hotkey can be reassignment by {reassignment} method. */
  unregister(): void;
  /** Unregister all hotkeys, hotkeys can be reassignment by {reassignment} method. */
  static unregisterAll(): void;
  /** Delete hotkey. */
  delete(): void;
  /** Delete all hotkeys. */
  static deleteAll(): void;
}
