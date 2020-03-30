#include <windows.h>
#include "virtual.hpp"
#include <iostream>
#include <algorithm>
#include <iterator>

using namespace std;

const map<int8_t, array<UINT, 2>> Virtual::msgs = {
    {0, {WM_LBUTTONUP, WM_LBUTTONDOWN}},
    {1, {WM_RBUTTONUP, WM_RBUTTONDOWN}},
    {2, {WM_MBUTTONUP, WM_MBUTTONDOWN}}};
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

void Virtual::mbToggler(int8_t button, bool isButtonDown)
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

void Virtual::keyToggler(UINT key, bool isKeyDown)
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
                            InstanceMethod("_toggleMb", &Virtual::toggleMb),
                            InstanceMethod("_move", &Virtual::move),
                            InstanceMethod("_scrollWheel", &Virtual::scrollWheel),
                            InstanceMethod("_toggleKey", &Virtual::toggleKey),
                            InstanceMethod("_printChar", &Virtual::printChar),
                            InstanceMethod("_setForeground", &Virtual::setForeground),
                            InstanceMethod("_isForeground", &Virtual::isForeground),
                            InstanceMethod("_isOpen", &Virtual::isOpen),
                            InstanceMethod("_capture", &Virtual::capture),
                            InstanceMethod("_getColor", &Virtual::getColor),
                            InstanceMethod("_kill", &Virtual::kill),
                            InstanceMethod("_close", &Virtual::close),
                            InstanceAccessor("_workwindow", &Virtual::getWorkwindow, &Virtual::setWorkwindow),
                            InstanceAccessor("_lastCoords", &Virtual::getLastCoords, &Virtual::setLastCoords),
                            InstanceAccessor("_saveMod", &Virtual::getSaveMod, &Virtual::setSaveMod),
                            InstanceAccessor("_windowInfo", &Virtual::getWindowInfo, &Virtual::setWindowInfo),
                        });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("Virtual", func);
    return exports;
}
