#include <windows.h>
#include "virtual.hpp"
#include <iostream>
#include <algorithm>
#include <iterator>

using namespace std;

const map<string, array<UINT, 2>> Virtual::msgs = {
    {"left", {WM_LBUTTONUP, WM_LBUTTONDOWN}},
    {"right", {WM_RBUTTONUP, WM_RBUTTONDOWN}},
    {"wheel", {WM_MBUTTONUP, WM_MBUTTONDOWN}}};
const map<UINT, UINT> Virtual::wParams = {{WM_LBUTTONDOWN, MK_LBUTTON},
                                          {WM_RBUTTONDOWN, MK_RBUTTON},
                                          {WM_MBUTTONDOWN, MK_MBUTTON},
                                          {WM_LBUTTONUP, 0},
                                          {WM_RBUTTONUP, 0},
                                          {WM_MBUTTONUP, 0}};

void Virtual::mbToogler(std::string button, bool isButtonDown)
{
    const LPARAM lParam = MAKELPARAM(lastCoords.x, lastCoords.y);
    const UINT action = msgs.at(button)[(int)isButtonDown];
    // PostMessageA(hWnd, WM_MOUSEMOVE, 1, lParam);
    PostMessageA(hWnd, action, wParams.at(action), lParam);
}

void Virtual::mover(int x, int y, bool isAbsolute)
{
    // PostMessageA(hWnd, WM_MOUSEMOVE, 1, MAKELPARAM(info[2].As<Napi::Number>().Int32Value(), info[3].As<Napi::Number>().Int32Value()));
    PostMessageA(hWnd, WM_MOUSEMOVE, 1, isAbsolute ? MAKELPARAM(x, y) : MAKELPARAM(lastCoords.x + x, lastCoords.y + y));
}

void Virtual::wheelScroller(int x)
{
    SendMessageA(hWnd, WM_MOUSEWHEEL, MAKEWPARAM(x, MK_MBUTTON), MAKELPARAM(lastCoords.x, lastCoords.y));
}

void Virtual::keyToogler(UINT key, bool isKeyDown)
{
    PostMessageA(hWnd, isKeyDown ? WM_KEYDOWN : WM_KEYUP, key, 0 | (key << 16) | (0 << 24) | (0 << 29) | ((UINT)!isKeyDown << 30) | ((UINT)!isKeyDown << 31));
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
                             InstanceMethod("_toogleMb", &Virtual::toogleMb),
                             InstanceMethod("_move", &Virtual::move),
                             InstanceMethod("_scrollWheel", &Virtual::scrollWheel),
                             InstanceMethod("_toogleKey", &Virtual::toogleKey),
                             InstanceMethod("_printChar", &Virtual::printChar),
                             InstanceMethod("isForeground", &Virtual::isForeground),
                             InstanceMethod("setForeground", &Virtual::setForeground),
                             InstanceMethod("isOpen", &Virtual::isOpen),
                             InstanceAccessor("_workwindow", &Virtual::getWorkwindow, &Virtual::setWorkwindow),
                             InstanceAccessor("_lastCoords", &Virtual::getLastCoords, &Virtual::setLastCoords),
                         });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("_Virtual", func);
    return exports;
}
