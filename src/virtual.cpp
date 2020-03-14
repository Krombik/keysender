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

void Virtual::mousePosGetter(POINT *coords)
{
    GetCursorPos(coords);
    ScreenToClient(hWnd, coords);
}

void Virtual::mbToogler(std::string button, bool isButtonDown)
{
    const UINT action = msgs.at(button)[(int)isButtonDown];
    PostMessageA(hWnd, action, wParams.at(action), MAKELPARAM(lastCoords.x, lastCoords.y));
}

void Virtual::mover(int x, int y, bool isAbsolute)
{
    if (saveMod)
        PostMessageA(hWnd, WM_MOUSEMOVE, 1, MAKELPARAM(lastCoords.x, lastCoords.y));
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
        env, "Virtual", {
                            InstanceMethod("_getPos", &Virtual::getMousePos),
                            InstanceMethod("_toogleMb", &Virtual::toogleMb),
                            InstanceMethod("_move", &Virtual::move),
                            InstanceMethod("_scrollWheel", &Virtual::scrollWheel),
                            InstanceMethod("_toogleKey", &Virtual::toogleKey),
                            InstanceMethod("_printChar", &Virtual::printChar),
                            InstanceMethod("_setForeground", &Virtual::setForeground),
                            InstanceMethod("_isForeground", &Virtual::isForeground),
                            InstanceMethod("_isOpen", &Virtual::isOpen),
                            InstanceMethod("_capture", &Virtual::capture),
                            InstanceAccessor("_workwindow", &Virtual::getWorkwindow, &Virtual::setWorkwindow),
                            InstanceAccessor("_lastCoords", &Virtual::getLastCoords, &Virtual::setLastCoords),
                            InstanceAccessor("_saveMod", &Virtual::getSaveMod, &Virtual::setSaveMod),
                        });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("Virtual", func);
    return exports;
}
