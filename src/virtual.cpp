#include <windows.h>
#include "virtual.hpp"
#include <iostream>
#include <algorithm>
#include <iterator>

using namespace std;

void Virtual::keyToogler(UINT key, bool isKeyDown)
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
}

void Virtual::charPrinter(int code)
{
    SendMessageW(hWnd, WM_CHAR, (WPARAM)code, 0);
}

Napi::FunctionReference Virtual::constructor;

Napi::Object Virtual::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(
        env, "_Virtual", {
                             InstanceMethod("_sleep", &Virtual::sleep),
                             InstanceMethod("_toogleKey", &Virtual::toogleKey),
                             InstanceMethod("_printChar", &Virtual::printChar),
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
