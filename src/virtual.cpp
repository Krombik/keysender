#include <windows.h>
#include "virtual.hpp"
#include <iostream>
#include <algorithm>
#include <iterator>

using namespace std;

void Virtual::keyToogler(UINT key, bool isKeyDown, int delay)
{
    UINT msg;
    UINT lParam = 0 | (key << 16) | (0 << 24) | (0 << 29);
    if (isKeyDown)
    {
        msg = WM_KEYDOWN;
        lParam |= (0 << 30) | (0 << 31);
    }
    else
    {
        msg = WM_KEYUP;
        lParam |= (1 << 30) | (1 << 31);
    }
    PostMessageA(hWnd, msg, key, lParam);
    if (delay > 0)
        Sleep(delay);
}

void Virtual::textPrinter(Napi::Array text, int keyTooglerDelay, int keySenderDelay)
{
    for (size_t i = 0; i < text.Length(); i++)
    {
        SendMessageW(hWnd, WM_CHAR, (WPARAM)Napi::Value(text[i]).ToNumber().Int32Value(), 0);
        if (keyTooglerDelay > 0 && i != text.Length() - 1)
            Sleep(keyTooglerDelay);
    }
}

Napi::FunctionReference Virtual::constructor;

Napi::Object Virtual::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(
        env, "_Virtual", {
                             InstanceMethod("_toogleKey", &Virtual::toogleKey),
                             InstanceMethod("_printText", &Virtual::printText),
                             InstanceMethod("isForeground", &Virtual::isForeground),
                             InstanceMethod("setForeground", &Virtual::setForeground),
                             InstanceMethod("isOpen", &Virtual::isOpen),
                             InstanceAccessor("_workwindow", &Virtual::getWorkwindow, &Virtual::setWorkwindow),
                         });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("_Virtual", func);
    return exports;
}
