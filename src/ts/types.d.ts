declare type from = number;
declare type to = number;
export declare type randomFromRange = [from, to];
export declare type keyboardRegularButton = "backspace" | "tab" | "enter" | "pause" | "capslock" | "escape" | "space" | "pageup" | "pagedown" | "end" | "home" | "left" | "up" | "right" | "down" | "prntscrn" | "insert" | "delete" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" | "num0" | "num0" | "num1" | "num2" | "num3" | "num4" | "num5" | "num6" | "num7" | "num8" | "num9" | "num*" | "num+" | "num," | "num-" | "num." | "num/" | "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8" | "f9" | "f10" | "f11" | "f12" | "f13" | "f14" | "f15" | "f16" | "f17" | "f18" | "f19" | "f20" | "f21" | "f22" | "f23" | "f24" | "numlock" | "scrolllock" | ";" | "+" | "," | "-" | "." | "/" | "~" | "[" | "|" | "]" | "'";
export declare type keyboardSpecButton = "alt" | "ctrl" | "shift" | "lshift" | "rshift" | "lctrl" | "rctrl" | "lalt" | "ralt" | "lwin" | "rwin";
export declare type keyboardButton = keyboardRegularButton | keyboardSpecButton;
export declare type mouseButton = "left" | "right" | "middle";
export declare type keyboardEvent = "beforePrintText" | "beforeToggleKey" | "beforeSendKey" | "beforeSendKeys" | "afterPrintText" | "afterToggleKey" | "afterSendKey" | "afterSendKeys";
export declare type mouseEvent = "beforeToggle" | "beforeClick" | "beforeMoveTo" | "beforeMoveCurveTo" | "beforeMove" | "beforeScrollWheel" | "afterToggle" | "afterClick" | "afterMoveTo" | "afterMoveCurveTo" | "afterMove" | "afterScrollWheel";
export declare type workwindowEvent = "capture";
export declare type uint8 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 | 121 | 122 | 123 | 124 | 125 | 126 | 127 | 128 | 129 | 130 | 131 | 132 | 133 | 134 | 135 | 136 | 137 | 138 | 139 | 140 | 141 | 142 | 143 | 144 | 145 | 146 | 147 | 148 | 149 | 150 | 151 | 152 | 153 | 154 | 155 | 156 | 157 | 158 | 159 | 160 | 161 | 162 | 163 | 164 | 165 | 166 | 167 | 168 | 169 | 170 | 171 | 172 | 173 | 174 | 175 | 176 | 177 | 178 | 179 | 180 | 181 | 182 | 183 | 184 | 185 | 186 | 187 | 188 | 189 | 190 | 191 | 192 | 193 | 194 | 195 | 196 | 197 | 198 | 199 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 210 | 211 | 212 | 213 | 214 | 215 | 216 | 217 | 218 | 219 | 220 | 221 | 222 | 223 | 224 | 225 | 226 | 227 | 228 | 229 | 230 | 231 | 232 | 233 | 234 | 235 | 236 | 237 | 238 | 239 | 240 | 241 | 242 | 243 | 244 | 245 | 246 | 247 | 248 | 249 | 250 | 251 | 252 | 253 | 254 | 255;
export declare type img = {
    data: Buffer;
    height: number;
    width: number;
}
export declare type windowInfo = {
    handle: number;
    className: string;
    title: string;
}
export declare type size = {
    width: number;
    height: number;
}
export declare type pos = {
    x: number;
    y: number;
}
type actionArgs<S extends any[], A extends any[]> = {
    [i in keyof S]: { stateGetter(): S[i], argSetter(item: S[i]): A[i extends keyof A ? i : never] }
}
export declare type hotkeyOptions<S extends any[], A extends any[]> = {
    key: keyboardRegularButton | number;
    isEnabled?(): boolean | Promise<boolean>;
    actionArgs?: actionArgs<S, A>;
} & ({
    mode?: "once";
    action(...args: A): void | Promise<void>;
} | {
    mode: "toggle" | "hold";
    action(...args: A): boolean | Promise<boolean>;
    finalizerCallback?(...args: A): void | Promise<void>;
    delay?: number;
})
export declare interface EventEmitter<event> {
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