declare type keyboardRegularButton = "backspace" | "tab" | "enter" | "pause" | "capslock" | "escape" | "space" | "pageup" | "pagedown" | "end" | "home" | "left" | "up" | "right" | "down" | "prntscrn" | "insert" | "delete" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" | "num0" | "num0" | "num1" | "num2" | "num3" | "num4" | "num5" | "num6" | "num7" | "num8" | "num9" | "num*" | "num+" | "num," | "num-" | "num." | "num/" | "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8" | "f9" | "f10" | "f11" | "f12" | "f13" | "f14" | "f15" | "f16" | "f17" | "f18" | "f19" | "f20" | "f21" | "f22" | "f23" | "f24" | "numlock" | "scrolllock" | ";" | "+" | "," | "-" | "." | "?" | "~" | "[" | "|" | "]" | "'";
declare type keyboardSpecButton = "alt" | "ctrl" | "shift" | "lshift" | "rshift" | "lctrl" | "rctrl" | "lalt" | "ralt" | "lwin" | "rwin";
declare type keyboardButton = keyboardRegularButton | keyboardSpecButton;
declare type mouseButton = "left" | "right" | "middle";
declare type keyboardEvent = "beforePrintText" | "beforeToggleKey" | "beforeSendKey" | "beforeSendKeys" | "afterPrintText" | "afterToggleKey" | "afterSendKey" | "afterSendKeys";
declare type mouseEvent = "beforeToggle" | "beforeClick" | "beforeMoveTo" | "beforeMoveCurveTo" | "beforeMove" | "beforeScrollWheel" | "afterToggle" | "afterClick" | "afterMoveTo" | "afterMoveCurveTo" | "afterMove" | "afterScrollWheel";
declare type hexString = string;
declare type decimalNumber = number;
declare type uint8 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 | 121 | 122 | 123 | 124 | 125 | 126 | 127 | 128 | 129 | 130 | 131 | 132 | 133 | 134 | 135 | 136 | 137 | 138 | 139 | 140 | 141 | 142 | 143 | 144 | 145 | 146 | 147 | 148 | 149 | 150 | 151 | 152 | 153 | 154 | 155 | 156 | 157 | 158 | 159 | 160 | 161 | 162 | 163 | 164 | 165 | 166 | 167 | 168 | 169 | 170 | 171 | 172 | 173 | 174 | 175 | 176 | 177 | 178 | 179 | 180 | 181 | 182 | 183 | 184 | 185 | 186 | 187 | 188 | 189 | 190 | 191 | 192 | 193 | 194 | 195 | 196 | 197 | 198 | 199 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 210 | 211 | 212 | 213 | 214 | 215 | 216 | 217 | 218 | 219 | 220 | 221 | 222 | 223 | 224 | 225 | 226 | 227 | 228 | 229 | 230 | 231 | 232 | 233 | 234 | 235 | 236 | 237 | 238 | 239 | 240 | 241 | 242 | 243 | 244 | 245 | 246 | 247 | 248 | 249 | 250 | 251 | 252 | 253 | 254 | 255;
declare type red = uint8;
declare type green = uint8;
declare type blue = uint8;
declare interface img {
    data: Buffer;
    height: number;
    width: number;
}
declare interface windowData {
    handle: number;
    className: string;
    title: string;
}
declare type from = number;
declare type to = number;
declare type randomFromRange = [from, to];
declare interface size {
    width: number;
    height: number;
}
declare interface pos {
    x: number;
    y: number;
}
declare interface posAndSize extends pos, size { }
declare interface EventEmitter<event> {
    addListener(event: event | string, listener: (...args: any[]) => void): this;
    on(event: event | string, listener: (...args: any[]) => void): this;
    once(event: event | string, listener: (...args: any[]) => void): this;
    removeListener(event: event | string, listener: (...args: any[]) => void): this;
    off(event: event | string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: event | string): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(event: event | string): Function[];
    rawListeners(event: event | string): Function[];
    emit(event: event | string, ...args: any[]): boolean;
    listenerCount(type: event | string): number;
    prependListener(event: event | string, listener: (...args: any[]) => void): this;
    prependOnceListener(event: event | string, listener: (...args: any[]) => void): this;
    eventNames(): Array<event | string>;
}
declare interface keyboard extends EventEmitter<keyboardEvent> {
    keyTogglerDelay: number | randomFromRange;
    keySenderDelay: number | randomFromRange;
    /** Prints text.
     * @param text - string to print.
     * @param afterTypeDelay - milliseconds to sleep after each char typed excluding last,
     * if not provided defaults to 0.
     */
    printText(text: string, afterTypeDelay?: number | randomFromRange): void;
    /** Prints text async.
     * @param text - string to print.
     * @param afterTypeDelay - milliseconds to await after each char typed excluding last,
     * if not provided defaults to 0.
     */
    printTextAsync(text: string, afterTypeDelay?: number | randomFromRange): Promise<void>;
    /**
     * Toggles key or combination of keys to provided state.
     * @param key - key or array with combination of keys.
     * @param state - key state selection: true for press, false for release,
     * if not provided defaults to true.
     * @param delay - milliseconds to sleep after key toggled,
     * if not provided defaults to keyboard.keyTogglerDelay.
     */
    toggleKey(key: keyboardButton | keyboardButton[], state?: boolean, delay?: number | randomFromRange): void;
    /**
     * Toggles key or combination of keys to provided state async.
     * @param key - key or array with combination of keys.
     * @param state - key state selection: true for press, false for release,
     * if not provided defaults to true.
     * @param delay -milliseconds to await after key toggled,
     * if not provided defaults to keyboard.keyTogglerDelay.
     */
    toggleKeyAsync(key: keyboardButton | keyboardButton[], state?: boolean, delay?: number | randomFromRange): Promise<void>;
    /**
     * Press and release key or combination of keys.
     * @param key - key or array with combination of keys.
     * @param afterPressDelay - milliseconds to sleep after key pressed,
     * if not provided defaults to keyboard.keyTogglerDelay.
     * @param afterReleaseDelay - milliseconds to sleep after key released,
     * if not provided defaults to 0.
     */
    sendKey(key: keyboardButton | keyboardButton[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): void;
    /**
     * Press and release key or combination of keys async.
     * @param key - key or array with combination of keys.
     * @param afterPressDelay - milliseconds to await after key pressed,
     * if not provided defaults to keyboard.keyTogglerDelay.
     * @param afterReleaseDelay - milliseconds to await after key released,
     * if not provided defaults to 0.
     */
    sendKeyAsync(key: keyboardButton | keyboardButton[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): Promise<void>;
    /**
     * Press and release array of keys.
     * @param keys - array with keys.
     * @param afterPressDelay - milliseconds to sleep after each key pressed,
     * if not provided defaults to keyboard.keyTogglerDelay.
     * @param afterReleaseDelay - delay in milliseconds to sleep after each key released excluding last,
     * if not provided defaults to {afterPressDelay}, if {afterPressDelay} not provided defaults to keyboard.keySenderDelay.
     */
    sendKeys(keys: keyboardButton[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): void;
    /**
     * Press and release array of keys async.
     * @param keys - array with keys.
     * @param afterPressDelay - milliseconds to await after each key pressed,
     * if not provided defaults to keyboard.keyTogglerDelay.
     * @param afterReleaseDelay - delay in milliseconds to await after each key released excluding last,
     * if not provided defaults to {afterPressDelay}, if {afterPressDelay} not provided defaults to keyboard.keySenderDelay.
     */
    sendKeysAsync(keys: keyboardButton[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): Promise<void>;
}
declare interface mouse extends EventEmitter<mouseEvent> {
    buttonTogglerDelay: number | randomFromRange;
    /** If saveMod is enable every mouse move method first back to last known coordinates ([0, 0] on first move), by default - disable. */
    enableSaveMod(bool: boolean): void;
    /** @returns current cursor position at screen for Hardware class or position at current workwindow for Virtual class. */
    getPos(): pos;
    /**
     * Switch mouse button state.
     * @param state - key state selection: true for press, false for release.
     * @param button - name of mouse button.
     * @param delay - milliseconds to sleep after switching mouse button state,
     * if not provided defaults to mouse.buttonTogglerDelay.
     */
    toggle(state: boolean, button?: mouseButton, delay?: number | randomFromRange): void;
    /**
     * Switch mouse button state async.
     * @param state - key state selection: true for press, false for release.
     * @param button - name of mouse button.
     * @param delay - milliseconds to await after switching mouse button state,
     * if not provided defaults to mouse.buttonTogglerDelay.
     */
    toggleAsync(state: boolean, button?: mouseButton, delay?: number | randomFromRange): Promise<void>;
    /**
     * Click mouse button.
     * @param button - name of mouse button,
     * if not provided defaults to "left".
     * @param afterPressDelay - milliseconds to sleep after mouse button pressed,
     * if not provided defaults to mouse.buttonTogglerDelay.
     * @param afterReleaseDelay - milliseconds to sleep after mouse button released,
     * if not provided defaults to 0.
     */
    click(button?: mouseButton, afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): void;
    /**
     * Click mouse button async.
     * @param button - name of mouse button,
     * if not provided defaults to "left".
     * @param afterPressDelay - milliseconds to await after mouse button pressed,
     * if not provided defaults to mouse.buttonTogglerDelay.
     * @param afterReleaseDelay - milliseconds to await after mouse button released,
     * if not provided defaults to 0.
     */
    clickAsync(button?: mouseButton, afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): Promise<void>;
    /**
     * Move mouse to [x, y].
     * @param delay - milliseconds to sleep after mouse movement,
     * if not provided defaults to 0.
     */
    moveTo(x: number, y: number, delay?: number | randomFromRange): void;
    /**
     * Move mouse to [x, y] async.
     * @param delay - milliseconds to await after mouse movement,
     * if not provided defaults to 0.
     */
    moveToAsync(x: number, y: number, delay?: number | randomFromRange): Promise<void>;
    /**
     * Simulate human similar mouse movement from {lastCoords} to [x, y].
     * @param speed - move speed, if not provided defaults to 5,
     * if speed equals to "max" - immediate movement.
     * @param deviation - movement curvature, if not provided defaults to 30.
     */
    moveCurveTo(x: number, y: number, speed?: number | "max", deviation?: number): void;
    /**
     * Simulate human similar mouse movement from {lastCoords} to [x, y] async.
     * @param speed - move speed, if not provided defaults to 5,
     * if speed equals to "max" - immediate movement.
     * @param deviation - movement curvature, if not provided defaults to 30.
     */
    moveCurveToAsync(x: number, y: number, speed?: number | "max", deviation?: number): Promise<void>;
    /**
     * Move mouse from current position by [x, y] relatively.
     * @param delay - milliseconds to sleep after mouse movement,
     * if not provided defaults to 0.
     */
    move(x: number, y: number, delay?: number | randomFromRange): void;
    /**
     * Move mouse from current position by [x, y] relatively async.
     * @param delay - milliseconds to await after mouse movement,
     * if not provided defaults to 0.
     */
    moveAsync(x: number, y: number, delay?: number | randomFromRange): Promise<void>;
    /**
     * Scroll mouse wheel.
     * @param amount - the amount of wheel movement. A positive value indicates that the wheel was rotated forward, away from the user,
     * a negative value indicates that the wheel was rotated backward, toward the user.
     * @param delay - milliseconds to sleep after wheel scroll,
     * if not provided defaults to 0.
     */
    scrollWheel(amount: number, delay?: number | randomFromRange): void;
    /**
     * Scroll mouse wheel async.
     * @param amount - the amount of wheel movement. A positive value indicates that the wheel was rotated forward, away from the user,
     * a negative value indicates that the wheel was rotated backward, toward the user.
     * @param delay - milliseconds to await after wheel scroll,
     * if not provided defaults to 0.
     */
    scrollWheelAsync(count: number, delay?: number | randomFromRange): Promise<void>;
}
declare interface workwindow extends EventEmitter<"capture"> {
    /** Set current workwindow by {handle}. */
    set(handle: number): void;
    /** @returns object with {handle}, {title} and {className} of current workwindow. */
    get(): windowData;
    /** Set workwindow position and(or) size.
     * @param info - object {x, y, width, height}
     */
    setInfo(info: Partial<posAndSize>): void;
    /** @returns object {x, y, width, height} */
    getInfo(): posAndSize;
    /** Set current workwindow foreground. */
    setForeground(): void;
    isForeground(): boolean;
    isOpen(): boolean;
    /**
     * Capture part of current workwindow (or screen if {handle} is 0).
     * @param part - position of top left corner and size to be capture
     * @param format - color format of return data, could be "rgba", "bgra", "grey", "monochrome"
     * if not provided defaults to "rgba".
     * @param threshold - color limit for "monochrome" format, if the pixel value is smaller than the threshold, it is set to 0, otherwise it is set to 255
     * if not provided defaults to 127.
     * @returns object {data, width, height}.
     */
    capture(part: posAndSize, format?: "rgba" | "bgra" | "grey"): img;
    capture(part: posAndSize, format: "monochrome", threshold?: uint8): img;
    capture(format?: "rgba" | "bgra" | "grey"): img;
    capture(format: "monochrome", threshold?: uint8): img;
    /** @param returnType - type of return value, "string" for hexadecimal color representation "rrggbb", "array" for array representation of color [r,g,b], "number" for color representation in decimal
     * if not provided defaults to "string".
     * @returns pixel color in [x, y] from current workwindow (or screen if {handle} is 0). */
    colorAt(x: number, y: number, returnType?: "string"): hexString;
    colorAt(x: number, y: number, returnType: "array"): [red, green, blue];
    colorAt(x: number, y: number, returnType: "number"): number;
    /** Terminate current workwindow by killing it's thread.*/
    kill(): void;
    /** Close current workwindow by sending close message. */
    close(): void;
}

declare class Worker {
    /** @param handle - handle of workwindow. */
    constructor(handle: number);
    /** Provides methods to synthesize keystrokes. */
    declare keyboard: keyboard;
    /** Provides methods to synthesize mouse motions, and button clicks. */
    declare mouse: mouse;
    /** Provides methods to work with workwindow. */
    declare workwindow: workwindow;
}

/** Provides methods implementations on hardware level. */
export declare class Hardware extends Worker { }

/** Provides methods implementations on virtual level. */
export declare class Virtual extends Worker { }

export declare class GlobalHotkey {
    /**
     * Register hotkey.
     * @param func - function to be calling in new thread after hotkey was pressed.
     * @param mode - if "once" - {func} will repeat one time for each {hotkey} press, if "hold" - {func} will repeat while {hotkey} is pressed, if "toggle" - {func} starts repeat after {hotkey} first time pressed and end repeat after {hotkey} second time pressed,
     * if not provided defaults to "once".
     * @param delay - if {mode} is "hold" or "toggle" - sets delay between {func} calls,
     * if not provided defaults to 0.
     */
    static register(hotkey: keyboardRegularButton, hotkeyName: string, func: () => boolean | Promise<boolean>, mode: "hold" | "toggle", delay?: number): void;
    static register(hotkey: keyboardRegularButton, hotkeyName: string, func: () => void | Promise<void>, mode: "once"): void;
    static register(hotkey: keyboardRegularButton, hotkeyName: string, func: () => void | Promise<void>): void;
    /** Unregister hotkeys by name. */
    static unregister(hotkeyName: string): void;
    /** Unregister all hotkeys. */
    static unregisterAll(): void;
    /** @returns name of {hotkey} or undefined if {hotkey} is not registered. */
    static findHotkeyName(hotkey: keyboardRegularButton): string | undefined;
}

/** @returns object {width, height} with screen size. */
export declare function getScreenSize(): size;

/** Get array with objects {handle, title, className} of all open windows. */
export declare function getWindow(): windowData[];
/** Get window {handle} by {title} and(or) {className}. */
export declare function getWindow(title: string | null, className?: string | null): number;

/** Get array with objects {handle, title, className} of all {parentHandle} children. */
export declare function getWindowChild(parentHandle: number): windowData[];
/** Get {handle} of {parentHandle} child by {className} and(or) {title}. */
export declare function getWindowChild(parentHandle: number, className: string | null, title?: string | null): number;

/** Pause current thread for {ms} milliseconds. */
export declare function sleep(ms: number | randomFromRange): void;