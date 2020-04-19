import { keyboardRegularButton, hotkeyOptions } from './types.d'
export declare class GlobalHotkey<stateTypes, argsTypes> {
    /** Registers hotkey, if hotkey already registered, {unregister} previous hotkey and registers new hotkey.
     * @param options.key - hotkey.
     * @param options.mode - if "once" - {options.action} will call one time for each {options.key} press,
     * if "hold" - {options.action} will repeat every {options.delay} milliseconds while {options.key} is pressed or {options.action} returns true,
     * if "toggle" - {options.action} starts repeat repeat every {options.delay} milliseconds after {options.key} first time pressed and stops after {options.key} second time pressed or {options.action} returns false,
     * if not provided defaults to "once".
     * @param options.isEnabled - function to check if hotkey is need to be executing.
     * @param options.actionArgs - something like watcher for arguments of {options.action} and {options.finalizerCallback}, i.e. array with objects { stateGetter: () => stateType, argSetter: (item: stateType) => argType },
     * where stateGetter is function for gets current state, argSetter - function to change arg value if state getting by stateGetter is different from the previous state, see an example for a better understanding.
     * @param options.action - function to be call after hotkey was pressed.
     * @param options.finalizerCallback - if {options.mode} is "hold" or "toggle" - function to be call after hotkey work is end.
     * @param options.delay - if {options.mode} is "hold" or "toggle" - sets delay between {options.action} calls,
     * if not provided defaults to 0.
     * 
     * Code described below registers hotkey "num+", takes first {stateValue} of "Notepad" {height, width} and returns [width / 2, height / 2] as argument for {action}.
     * When "num +" will be pressed {isEnabled} will check is "Notepad" open,
     * if it's not open, it try to find it again,
     * if it still isn't open hotkey do nothing do nothing,
     * if it's open {stateGetter} gets {height, width} of "Notepad" and compares it with previous {stateValue},
     * if they are not equal sets new value [width / 2, height / 2] for argument of {action}, based on current {stateValue},
     * if they are equal, argument of {action} is not change,
     * after this it do {action} - moves mouse cursor to middle of "Notepad" window and makes left mouse click.
     * @example
     * const obj = new Hardware(getWindow(null, "Notepad"));
     * type stateType = {
     *     height: number,
     *     width: number
     * }
     * type argType = [number, number];
     * new GlobalHotkey<[stateType], [argType]>({
     *     key: "num+",
     *     isEnabled() {
     *         if (obj.workwindow.isOpen())
     *             obj.workwindow.set(getWindow(null, "Notepad"));
     *         return obj.workwindow.isOpen();
     *     },
     *     actionArgs: [
     *         {
     *             stateGetter() {
     *                 const { height, width } = obj.workwindow.getInfo();
     *                 return ({ height, width });
     *             },
     *             argSetter: size => ([size.width / 2, size.height / 2])
     *         }
     *     ],
     *     async action(size) {
     *         await obj.mouse.moveToAsync(...size);
     *         await obj.mouse.clickAsync();
     *     },
     * });
     */
    constructor(options: hotkeyOptions<stateTypes extends any[] ? stateTypes : [stateTypes], argsTypes extends any[] ? argsTypes : [argsTypes]>);
    /** Reassigns {hotkey} to {newHotkey}, if {newHotkey} already registered, re-registers it */
    reassignment(newHotkey: keyboardRegularButton | number): void;
    /** Unregister hotkey, hotkey can be re-register by {reassignment} method. */
    unregister(): void;
    /** Unregister all hotkeys, hotkeys can be re-register by {reassignment} method. */
    static unregisterAll(): void;
    /** Delete hotkey. */
    delete(): void;
    /** Delete all hotkeys. */
    static deleteAll(): void;
}