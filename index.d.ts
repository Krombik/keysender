declare type keyboardRegularButton = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" | "+" | "-" | "." | "," | "?" | "~" | "[" | "]" | "|" | "'" | "backspace" | "delete" | "enter" | "tab" | "escape" | "up" | "down" | "right" | "left" | "home" | "end" | "pageup" | "pagedown" | "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8" | "f9" | "f10" | "f11" | "f12" | "f13" | "f14" | "f15" | "f16" | "f17" | "f18" | "f19" | "f20" | "f21" | "f22" | "f23" | "f24" | "capslock" | "space" | "prntscrn" | "insert" | "numlock" | "num0" | "num0" | "num1" | "num2" | "num3" | "num4" | "num5" | "num6" | "num7" | "num8" | "num9" | "num+" | "num-" | "num*" | "num/" | "num.";
declare type keyboardSpecButton = "alt" | "ctrl" | "shift";
declare type keyboardSpecSideButton = "lshift" | "rshift" | "lctrl" | "rctrl" | "lalt" | "ralt";
declare type keyboardButton = keyboardRegularButton | keyboardSpecButton | keyboardRegularButton;
declare type mouseButton = "left" | "right" | "middle";
declare type keyboardEvent = "printText" | "toggleKey" | "sendKey" | "sendKeys";
declare type mouseEvent = "toggle" | "click" | "moveTo" | "moveCurveTo" | "move" | "scrollWheel";
declare type windowInfo = { x?: number, y?: number, width?: number, height?: number };
declare type img = { data: Buffer, height: number, width: number, colorAt(x: number, y: number): string };
declare type windowData = { handle: number, className: string, title: string };
declare type hotkeyMode = "once" | "hold" | "toggle";
declare interface keyboard {
    keyTogglerDelay: number | [number, number];
    keySenderDelay: number | [number, number];
    /** Adds the {listener} before event {eventName}. */
    before(eventName: keyboardEvent, listener: (...args: any[]) => void): void;
    /** Adds the {listener} after event {eventName}. */
    after(eventName: keyboardEvent, listener: (...args: any[]) => void): void;
    /** Print text.
     * @param text - string to print.
     * @param keySenderDelay - delay in milliseconds to sleep after sending key,
     * if not provided defaults to 0.
     */
    printText(text: string, keySenderDelay?: [number, number] | number): void;
    /** Print text async.
     * @param text - string to print.
     * @param keySenderDelay - delay in milliseconds to await after sending key,
     * if not provided defaults to 0.
     */
    async printTextAsync(text: string, keySenderDelay?: [number, number] | number): Promise<void>;
    /**
     * Switch key state.
     * @param key - name of key.
     * @param isKeyDown - key state selection: true for press, false for release.
     * @param delay - delay in milliseconds to sleep after switching key state,
     * if not provided defaults to this.keyTogglerDelay.
     */
    toggleKey(key: keyboardButton, isKeyDown?: boolean, delay?: [number, number] | number): void;
    /**
     * Switch key state async.
     * @param key - name of key.
     * @param isKeyDown - key state selection: true for press, false for release.
     * @param delay - delay in milliseconds to await after switching key state,
     * if not provided defaults to this.keyTogglerDelay.
     */
    async toggleKeyAsync(key: keyboardButton, isKeyDown?: boolean, delay?: [number, number] | number): Promise<void>,
    /**
     * Press and release key.
     * @param key - name of key.
     * @param keyTogglerDelay - delay in milliseconds to sleep after press key,
     * if not provided defaults to this.keyTogglerDelay.
     * @param keySenderDelay - delay in milliseconds to sleep after release key,
     * if not provided defaults to 0.
     */
    sendKey(keys: keyboardButton | keyboardButton[], keyTogglerDelay?: [number, number] | number, keySenderDelay?: [number, number] | number): void;
    /**
     * Press and release key async.
     * @param key - name of key.
     * @param keyTogglerDelay - delay in milliseconds to await after press key,
     * if not provided defaults to this.keyTogglerDelay.
     * @param keySenderDelay - delay in milliseconds to await after release key,
     * if not provided defaults to 0.
     */
    async sendKeyAsync(keys: keyboardButton | keyboardButton[], keyTogglerDelay?: [number, number] | number, keySenderDelay?: [number, number] | number): Promise<void>,
    /**
     * Press and release array of keys.
     * @param keys - array with keys.
     * @param keyTogglerDelay - delay in milliseconds to sleep after press key,
     * if not provided defaults to this.keyTogglerDelay.
     * @param keySenderDelay - delay in milliseconds to sleep after release key,
     * if not provided defaults to {keyTogglerDelay}, if {keyTogglerDelay} not provided defaults to this.keySenderDelay.
     */
    sendKeys(keys: keyboardButton[], keyTogglerDelay?: [number, number] | number, keySenderDelay?: [number, number] | number): void,
    /**
     * Press and release array of keys async.
     * @param keys - array with keys.
     * @param keyTogglerDelay - delay in milliseconds to await after press key,
     * if not provided defaults to this.keyTogglerDelay.
     * @param keySenderDelay - delay in milliseconds to await after release key,
     * if not provided defaults to {keyTogglerDelay}, if {keyTogglerDelay} not provided defaults to this.keySenderDelay.
     */
    async sendKeysAsync(keys: keyboardButton[], keyTogglerDelay?: [number, number] | number, keySenderDelay?: [number, number] | number): Promise<void>
}
declare interface mouse {
    buttonTogglerDelay: number | [number, number];
    /** If saveMod is true every mouse method first back to {lastCoords}, by default: false. */
    saveMod: boolean;
    /** Last coordinates of mouse, change after every mouseMove method, by default: [0,0]. */
    lastCoords: [number, number];
    /** Adds the {listener} before event {eventName}. */
    before(eventName: mouseEvent, listener: (...args: any[]) => void): void;
    /** Adds the {listener} after event {eventName}. */
    after(eventName: mouseEvent, listener: (...args: any[]) => void): void;
    /** Get current cursor position at screen for Hardware class or position at current workwindow. */
    getPos(): [number, number];
    /**
     * Switch mouse button state.
     * @param isButtonDown - key state selection: true for press, false for release.
     * @param button - name of mouse button.
     * @param buttonTogglerDelay - delay in milliseconds to sleep after switching mouse button state,
     * if not provided defaults to this.buttonTogglerDelay.
     */
    toggle(isButtonDown: boolean, button?: mouseButton, buttonTogglerDelay?: [number, number] | number): void;
    /**
     * Switch mouse button state async.
     * @param isButtonDown - key state selection: true for press, false for release.
     * @param button - name of mouse button.
     * @param buttonTogglerDelay - delay in milliseconds to await after switching mouse button state,
     * if not provided defaults to this.buttonTogglerDelay.
     */
    async toggleAsync(isButtonDown: boolean, button?: mouseButton, buttonTogglerDelay?: [number, number] | number): Promise<void>;
    /**
     * Click mouse button
     * @param button - name of mouse button.
     * @param buttonTogglerDelay - delay in milliseconds to sleep after press mouse button,
     * if not provided defaults to this.buttonTogglerDelay.
     * @param buttonSenderDelay - delay in milliseconds to sleep after release mouse button,
     * if not provided defaults to 0.
     */
    click(button?: mouseButton, buttonTogglerDelay?: [number, number] | number, buttonSenderDelay?: [number, number] | number): void;
    /**
     * Click mouse button async
     * @param button - name of mouse button.
     * @param buttonTogglerDelay - delay in milliseconds to await after press mouse button,
     * if not provided defaults to this.buttonTogglerDelay.
     * @param buttonSenderDelay - delay in milliseconds to await after release mouse button,
     * if not provided defaults to 0.
     */
    async clickAsync(button?: mouseButton, buttonTogglerDelay?: [number, number] | number, buttonSenderDelay?: [number, number] | number): Promise<void>;
    /**
     * Move mouse to [x, y].
     * @param delay - delay in milliseconds to sleep after move mouse,
     * if not provided defaults to 0.
     */
    moveTo(x: number, y: number, delay?: [number, number] | number): void;
    /**
     * Move mouse to [x, y] async.
     * @param delay - delay in milliseconds to await after move mouse,
     * if not provided defaults to 0.
     */
    async moveToAsync(x: number, y: number, delay?: [number, number] | number): Promise<void>;
    /**
     * Imitate human like mouse move from {lastCoords} to [x, y].
     * @param speed - move speed, if not provided defaults to 5.
     * @param deviation - movement curvature, if not provided defaults to 30.
     */
    moveCurveTo(x: number, y: number, speed?: number, deviation?: number): void;
    /**
     * Imitate human like mouse move from {lastCoords} to [x, y] async.
     * @param speed - move speed, if not provided defaults to 5.
     * @param deviation - movement curvature, if not provided defaults to 30.
     */
    async moveCurveToAsync(x: number, y: number, speed?: number, deviation?: number): Promise<void>;
    /**
     * Move mouse relative to the current position by [x, y].
     * @param delay - delay in milliseconds to sleep after move mouse,
     * if not provided defaults to 0.
     */
    move(x: number, y: number, delay?: [number, number] | number): void;
    /**
     * Move mouse relative to the current position by [x, y] async.
     * @param delay - delay in milliseconds to await after move mouse,
     * if not provided defaults to 0.
     */
    async moveAsync(x: number, y: number, delay?: [number, number] | number): Promise<void>;
    /**
     * Scroll mouse wheel for {count} times.
     * @param wheelTogglerDelay - delay in milliseconds to sleep after wheel scroll,
     * if not provided defaults to 0.
     */
    scrollWheel(count: number, wheelTogglerDelay?: [number, number] | number): void;
    /**
     * Scroll mouse wheel for {count} times async.
     * @param wheelTogglerDelay - delay in milliseconds to await after wheel scroll,
     * if not provided defaults to 0.
     */
    async scrollWheelAsync(count: number, wheelTogglerDelay?: [number, number] | number): Promise<void>
}
declare interface workwindow {
    /** Set current workwindow by {handle}. */
    set(handle: number): void;
    /** @returns object with {handle}, {title} and {className} of workwindow. */
    get(): windowData;
    /** Get or set workwindow position and size. */
    info: windowInfo;
    /** Adds the {listener} after event {eventName}. */
    on(eventName: "capture", listener: (...args: any[]) => void): void;
    /** Set current workwindow foreground. */
    setForeground(): void;
    isForeground(): boolean;
    isOpen(): boolean;
    /** capture part of current workwindow from [x, y] to [x+width,y+height]. */
    capture(x: number, y: number, width: number, height: number): img;
    /** capture current workwindow. */
    capture(): img;
    /** Terminate current workwindow. */
    kill(): void;
    /** Close current workwindow by sending close message. */
    close(): void
};

/** Hardware class provide methods to synthesize hardware keystrokes, mouse motions, button clicks, make screenshot of workwindow and other manipulations. */
export declare class Hardware {
    /** @param handle - handle of workwindow. */
    declare constructor(handle: number);
    /** Module with methods to synthesize keystrokes */
    declare keyboard: keyboard;
    /** Module with methods to synthesize mouse motions, and button clicks */
    declare mouse: mouse;
    /** Module with methods to work with workwindow */
    declare workwindow: workwindow;
};

/** Virtual class provide methods to synthesize virtual keystrokes, mouse motions, button clicks to workwindow, make screenshot of workwindow and other manipulations. */
export declare class Virtual extends Hardware { };

export declare class GlobalHotkey {
    /**
     * Register hotkey.
     * @param func - function that calls after hotkey pressed.
     * @param mode - if "once" - {func} will repeat one time for each {hotkey} press, if "hold" - {func} will repeat while {hotkey} is pressed, if "toggle" - {func} start repeat after {hotkey} first time pressing and end repeat after {hotkey} second time pressing, by default = "once".
     * @param delay - if {mode} is "hold" or "toggle" - set delay between {func} calls, by default = 0.
     */
    static register(hotkey: keyboardRegularButton | (keyboardSpecButton | keyboardRegularButton)[] | [keyboardRegularButton], hotkeyName: string, func: () => void, mode?: hotkeyMode, delay?: number): void;
    /** Unregister hotkey by name. */
    static unregister(hotkeyName: string): void;
    /** Unregister all hotkeys. */
    static unregisterAll(): void;
    /** @returns name of {hotkey} or null if {hotkey} is not registered. */
    static findHotkeyName(hotkey: keyboardRegularButton | (keyboardSpecButton | keyboardRegularButton)[] | [keyboardRegularButton]): string | null
};

/** @returns screen size [width, height] */
export declare function getScreenSize(): [number, number];

/** Get array with {handle, title, className} of all open windows. */
export declare function getWindow(): windowData[];
/** Get window {handle} by {title} and(or) {className}. */
export declare function getWindow(title: string | null, className?: string | null): number;

/** Get array with {handle, title, className} of all children. */
export declare function getWindowChild(parentHandle: number): windowData[];
/** Get {handle} of {parentHandle} child by {className} and(or) {title}. */
export declare function getWindowChild(parentHandle: number, className: string | null, title?: string | null): number;

/** Pause current thread for {ms} milliseconds. */
export declare function sleep(ms: number | [number, number]): void;