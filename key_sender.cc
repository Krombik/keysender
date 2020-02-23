#include <napi.h>
#include <stdio.h>
#include <iostream>
#include <map>
#include <windows.h>
#include <winuser.h>

using namespace Napi;
using namespace std;

map<string, UINT> keysDef = {
    {"0", 0x30},
    {"1", 0x31},
    {"2", 0x32},
    {"3", 0x33},
    {"4", 0x34},
    {"5", 0x35},
    {"6", 0x36},
    {"7", 0x37},
    {"8", 0x38},
    {"9", 0x39},
    {"a", 0x41},
    {"b", 0x42},
    {"c", 0x43},
    {"d", 0x44},
    {"e", 0x45},
    {"f", 0x46},
    {"g", 0x47},
    {"h", 0x48},
    {"i", 0x49},
    {"j", 0x4A},
    {"k", 0x4B},
    {"l", 0x4C},
    {"m", 0x4D},
    {"n", 0x4E},
    {"o", 0x4F},
    {"p", 0x50},
    {"q", 0x51},
    {"r", 0x52},
    {"s", 0x53},
    {"t", 0x54},
    {"u", 0x55},
    {"v", 0x56},
    {"w", 0x57},
    {"x", 0x58},
    {"y", 0x59},
    {"z", 0x5A},
    {"+", VK_OEM_PLUS},
    {"-", VK_OEM_MINUS},
    {".", VK_OEM_PERIOD},
    {",", VK_OEM_COMMA},
    {"?", VK_OEM_2},
    {"~", VK_OEM_3},
    {"[", VK_OEM_4},
    {"]", VK_OEM_6},
    {"|", VK_OEM_5},
    {"'", VK_OEM_7},
    {"backspace", VK_BACK},
    {"delete", VK_DELETE},
    {"enter", VK_RETURN},
    {"tab", VK_TAB},
    {"escape", VK_ESCAPE},
    {"up", VK_UP},
    {"down", VK_DOWN},
    {"right", VK_RIGHT},
    {"left", VK_LEFT},
    {"home", VK_HOME},
    {"end", VK_END},
    {"pageup", VK_PRIOR},
    {"pagedown", VK_NEXT},
    {"f1", VK_F1},
    {"f2", VK_F2},
    {"f3", VK_F3},
    {"f4", VK_F4},
    {"f5", VK_F5},
    {"f6", VK_F6},
    {"f7", VK_F7},
    {"f8", VK_F8},
    {"f9", VK_F9},
    {"f10", VK_F10},
    {"f11", VK_F11},
    {"f12", VK_F12},
    {"f13", VK_F13},
    {"f14", VK_F14},
    {"f15", VK_F15},
    {"f16", VK_F16},
    {"f17", VK_F17},
    {"f18", VK_F18},
    {"f19", VK_F19},
    {"f20", VK_F20},
    {"f21", VK_F21},
    {"f22", VK_F22},
    {"f23", VK_F23},
    {"f24", VK_F24},
    {"capslock", VK_CAPITAL},
    {"alt", VK_MENU},
    {"control", VK_CONTROL},
    {"shift", VK_SHIFT},
    {"space", VK_SPACE},
    {"printscreen", VK_SNAPSHOT},
    {"insert", VK_INSERT},
    {"numlock", VK_NUMLOCK},
    {"num0", VK_NUMPAD0},
    {"num0", VK_NUMPAD0},
    {"num1", VK_NUMPAD1},
    {"num2", VK_NUMPAD2},
    {"num3", VK_NUMPAD3},
    {"num4", VK_NUMPAD4},
    {"num5", VK_NUMPAD5},
    {"num6", VK_NUMPAD6},
    {"num7", VK_NUMPAD7},
    {"num8", VK_NUMPAD8},
    {"num9", VK_NUMPAD9},
    {"num+", VK_ADD},
    {"num-", VK_SUBTRACT},
    {"num*", VK_MULTIPLY},
    {"num/", VK_DIVIDE},
    {"num.", VK_DECIMAL}};
UINT extendKeys[] = {
    VK_RCONTROL,
    VK_SNAPSHOT,
    VK_RMENU,
    VK_PAUSE,
    VK_HOME,
    VK_UP,
    VK_PRIOR,
    VK_LEFT,
    VK_RIGHT,
    VK_END,
    VK_DOWN,
    VK_NEXT,
    VK_INSERT,
    VK_DELETE,
    VK_LWIN,
    VK_RWIN,
    VK_APPS,
    VK_VOLUME_MUTE,
    VK_VOLUME_DOWN,
    VK_VOLUME_UP,
    VK_MEDIA_NEXT_TRACK,
    VK_MEDIA_PREV_TRACK,
    VK_MEDIA_STOP,
    VK_MEDIA_PLAY_PAUSE,
    VK_BROWSER_BACK,
    VK_BROWSER_FORWARD,
    VK_BROWSER_REFRESH,
    VK_BROWSER_STOP,
    VK_BROWSER_SEARCH,
    VK_BROWSER_FAVORITES,
    VK_BROWSER_HOME,
    VK_LAUNCH_MAIL,
    VK_RCONTROL,
    VK_SNAPSHOT,
    VK_RMENU,
    VK_PAUSE,
    VK_HOME,
    VK_UP,
    VK_PRIOR,
    VK_LEFT,
    VK_RIGHT,
    VK_END,
    VK_DOWN,
    VK_NEXT,
    VK_INSERT,
    VK_DELETE,
    VK_LWIN,
    VK_RWIN,
    VK_APPS,
    VK_VOLUME_MUTE,
    VK_VOLUME_DOWN,
    VK_VOLUME_UP,
    VK_MEDIA_NEXT_TRACK,
    VK_MEDIA_PREV_TRACK,
    VK_MEDIA_STOP,
    VK_MEDIA_PLAY_PAUSE,
    VK_BROWSER_BACK,
    VK_BROWSER_FORWARD,
    VK_BROWSER_REFRESH,
    VK_BROWSER_STOP,
    VK_BROWSER_SEARCH,
    VK_BROWSER_FAVORITES,
    VK_BROWSER_HOME,
    VK_LAUNCH_MAIL};

HWND workwindow = HWND_BROADCAST;
int keyboardDelay = 30;

class Keyboard
{
public:
    Value setKeyboardDelay(const CallbackInfo &info)
    {
        Napi::Env env = info.Env();
        if (info.Length() != 1)
        {
            Error::New(env, "Expected exactly one argument")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        if (!info[0].IsNumber())
        {
            Error::New(env, "Expected an Number")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        keyboardDelay = info[0].As<Number>();
        return env.Undefined();
    };
    Value printText(const CallbackInfo &info)
    {
        Napi::Env env = info.Env();
        if (info.Length() != 1)
        {
            Error::New(env, "Expected exactly one argument")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        if (!info[0].IsString())
        {
            Error::New(env, "Expected an String")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        string text = info[0].As<String>();
        for (short int i = 0; i < text.length(); i++)
        {
            SendMessageW(GetForegroundWindow(), WM_CHAR, (WPARAM)text[i], 0);
        }
        return Boolean::New(env, false);
    };
    Value sendKeyCombo(const CallbackInfo &info)
    {
        Napi::Env env = info.Env();
        if (info.Length() != 1)
        {
            Error::New(env, "Expected exactly one argument")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        if (!info[0].IsArray())
        {
            Error::New(env, "Expected an Array")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        INPUT ip;
        ip.type = INPUT_KEYBOARD;
        ip.ki.time = 0;
        ip.ki.wVk = 0;
        ip.ki.dwExtraInfo = 0;
        Array keys = info[0].As<Array>();
        for (size_t i = 0; i < keys.Length(); i++)
        {
            Value vKey = keys[i];
            if (vKey.IsString())
            {
                UINT key = keysDef[vKey.As<String>()];
                UINT wScan = MapVirtualKeyA(key, MAPVK_VK_TO_VSC);
                UINT dwFlags = flags(key);
                keyToogler(ip, wScan, dwFlags, true);
            }
        }
        for (short int i = keys.Length() - 1; i >= 0; i--)
        {
            Value vKey = keys[i];
            if (vKey.IsString())
            {
                UINT key = keysDef[vKey.As<String>()];
                UINT wScan = MapVirtualKeyA(key, MAPVK_VK_TO_VSC);
                UINT dwFlags = flags(key);
                keyToogler(ip, wScan, dwFlags, false);
            }
        }
        return Boolean::New(env, false);
    };
    Value sendKeys(const CallbackInfo &info)
    {
        Napi::Env env = info.Env();
        if (info.Length() != 1)
        {
            Error::New(env, "Expected exactly one argument")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        if (!info[0].IsArray())
        {
            Error::New(env, "Expected an Array")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        INPUT ip;
        ip.type = INPUT_KEYBOARD;
        ip.ki.time = 0;
        ip.ki.wVk = 0;
        ip.ki.dwExtraInfo = 0;
        Array keys = info[0].As<Array>();
        for (size_t i = 0; i < keys.Length(); i++)
        {
            keySender(ip, keys[i]);
        }
        return Boolean::New(env, false);
    }

    Value sendKey(const CallbackInfo &info)
    {
        Napi::Env env = info.Env();
        if (info.Length() != 1)
        {
            Error::New(env, "Expected exactly one argument")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        INPUT ip;
        ip.type = INPUT_KEYBOARD;
        ip.ki.time = 0;
        ip.ki.wVk = 0;
        ip.ki.dwExtraInfo = 0;
        keySender(ip, info[0]);
        return Boolean::New(env, false);
    }

private:
    virtual void keySender(INPUT &ip, Value vKey) = 0;
    virtual UINT flags(UINT key) = 0;
    virtual void keyToogler(INPUT ip, UINT wScan, UINT dwFlags, bool isKeyDown) = 0;
};

class CurrentWindow : public Napi::ObjectWrap<CurrentWindow>, public Keyboard
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    CurrentWindow(const Napi::CallbackInfo &info);

private:
    UINT flags(UINT key)
    {
        UINT flags = KEYEVENTF_SCANCODE;
        if (find(begin(extendKeys), end(extendKeys), key) != end(extendKeys))
            flags |= KEYEVENTF_EXTENDEDKEY;
        return flags;
    };
    void keyToogler(INPUT ip, UINT wScan, UINT dwFlags, bool isKeyDown)
    {
        ip.ki.dwFlags = isKeyDown ? dwFlags : dwFlags | KEYEVENTF_KEYUP;
        ip.ki.wScan = wScan;
        SendInput(1, &ip, sizeof(INPUT));
        Sleep(keyboardDelay);
    };
    void keySender(INPUT &ip, Napi::Value vKey)
    {
        if (vKey.IsString())
        {
            UINT key = keysDef[vKey.As<String>()];
            UINT wScan = MapVirtualKeyA(key, MAPVK_VK_TO_VSC);
            UINT dwFlags = flags(key);
            keyToogler(ip, wScan, dwFlags, true);
            keyToogler(ip, wScan, dwFlags, false);
        }
    };
    static Napi::FunctionReference constructor;
};

// static Value setWorkWindow(const CallbackInfo &info)
// {
//     Env env = info.Env();
//     if (info.Length() != 1)
//     {
//         Error::New(env, "Expected exactly one argument")
//             .ThrowAsJavaScriptException();
//         return env.Undefined();
//     }
//     if (!info[0].IsString())
//     {
//         Error::New(env, "Expected an String")
//             .ThrowAsJavaScriptException();
//         return env.Undefined();
//     }
//     string w = info[0].As<String>();
//     workwindow = FindWindowW(NULL, LPCWSTR(wstring(w.begin(), w.end()).c_str()));
//     return env.Undefined();
// }

// static Value isWorkwindowActive(const CallbackInfo &info)
// {
//     return Boolean::New(info.Env(), workwindow == GetForegroundWindow());
// }

// static Value sendKeyToWorkwindow(const CallbackInfo &info)
// {
//     Napi::Env env = info.Env();
//     if (info.Length() != 1)
//     {
//         Error::New(env, "Expected exactly one argument")
//             .ThrowAsJavaScriptException();
//         return env.Undefined();
//     }
//     UINT key = keysDef[info[0].As<String>()];
//     UINT lParam = 0 | (key << 16) | (0 << 24) | (0 << 29);
//     PostMessageA(workwindow, WM_KEYDOWN, key, lParam | (0 << keyboardDelay) | (0 << 31));
//     Sleep(keyboardDelay);
//     PostMessageA(workwindow, WM_KEYUP, key, lParam | (1 << keyboardDelay) | (1 << 31));
//     return Boolean::New(env, false);
// }

Napi::FunctionReference CurrentWindow::constructor;

Napi::Object CurrentWindow::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env, "CurrentWindow", {
                                  InstanceMethod("setKeyboardDelay", &CurrentWindow::setKeyboardDelay),
                                  InstanceMethod("sendKeys", &CurrentWindow::sendKeys),
                                  InstanceMethod("sendKey", &CurrentWindow::sendKey),
                                  InstanceMethod("sendKeyCombo", &CurrentWindow::sendKeyCombo),
                                  InstanceMethod("printText", &CurrentWindow::printText),
                              });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("CurrentWindow", func);
    return exports;
}
CurrentWindow::CurrentWindow(const Napi::CallbackInfo &info) : Napi::ObjectWrap<CurrentWindow>(info)
{
    Napi::Env env = info.Env();
}
Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    CurrentWindow::Init(env, exports);
    return exports;
}

// static Object Init(Env env, Object exports)
// {
//     Function func = DefineClass(
//         env, "CurrentWindow", {
//                                   InstanceMethod("setKeyboardDelay", &CurrentWindow::setKeyboardDelay),
//                                   InstanceMethod("sendKeys", &CurrentWindow::sendKeys),
//                                   InstanceMethod("sendKey", &CurrentWindow::sendKey),
//                                   InstanceMethod("sendKeyCombo", &CurrentWindow::sendKeyCombo),
//                                   InstanceMethod("printText", &CurrentWindow::printText),
//                               });
//     exports.Set("CurrentWindow", func);
//     // exports["setKeyboardDelay"] = Function::New(env, &CurrentWindow::setKeyboardDelay);
//     // exports["isWorkwindowActive"] = Function::New(env, isWorkwindowActive);
//     // exports["setWorkWindow"] = Function::New(env, setWorkWindow);
//     // exports["sendKeys"] = Function::New(env, &CurrentWindow::sendKeys);
//     // exports["sendKey"] = Function::New(env, &CurrentWindow::sendKey);
//     // exports["sendKeyCombo"] = Function::New(env, &CurrentWindow::sendKeyCombo);
//     // exports["printText"] = Function::New(env, &CurrentWindow::printText);
//     return exports;
// }

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)