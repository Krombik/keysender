#include <windows.h>
#include "hardware.hpp"
#include <iostream>
#include <algorithm>
#include <iterator>

using namespace std;

const UINT Hardware::extendKeys[] = {VK_RCONTROL,
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

const map<string, array<UINT, 2>> Hardware::buttonsDef = {
    {"left", {MOUSEEVENTF_LEFTUP, MOUSEEVENTF_LEFTDOWN}},
    {"right", {MOUSEEVENTF_RIGHTUP, MOUSEEVENTF_RIGHTDOWN}},
    {"wheel", {MOUSEEVENTF_MIDDLEUP, MOUSEEVENTF_MIDDLEDOWN}}};

void Hardware::mousePosGetter(POINT *coords)
{
    GetCursorPos(&*coords);
}

void Hardware::mbToogler(std::string button, bool isButtonDown)
{
    INPUT ip;
    ip.type = INPUT_MOUSE;
    ip.mi.dx = 0;
    ip.mi.dy = 0;
    ip.mi.mouseData = 0;
    ip.mi.dwExtraInfo = 0;
    ip.mi.time = 0;
    ip.mi.dwFlags = buttonsDef.at(button)[(int)isButtonDown];
    SendInput(1, &ip, sizeof(INPUT));
}

void Hardware::mover(int x, int y, bool isAbsolute)
{
    INPUT ip;
    ip.type = INPUT_MOUSE;
    ip.mi.dx = x;
    ip.mi.dy = y;
    ip.mi.mouseData = 0;
    ip.mi.dwExtraInfo = 0;
    ip.mi.time = 0;
    ip.mi.dwFlags = MOUSEEVENTF_MOVE;
    if (isAbsolute)
    {
        ip.mi.dx *= 65536 / GetSystemMetrics(SM_CXSCREEN);
        ip.mi.dy *= 65536 / GetSystemMetrics(SM_CYSCREEN);
        ip.mi.dwFlags |= MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_VIRTUALDESK;
    }
    SendInput(1, &ip, sizeof(INPUT));
}

void Hardware::wheelScroller(int x)
{
    INPUT ip;
    ip.type = INPUT_MOUSE;
    ip.mi.dx = 0;
    ip.mi.dy = 0;
    ip.mi.mouseData = x;
    ip.mi.dwExtraInfo = 0;
    ip.mi.time = 0;
    ip.mi.dwFlags = MOUSEEVENTF_WHEEL;
    SendInput(1, &ip, sizeof(INPUT));
}

void Hardware::keyToogler(UINT key, bool isKeyDown)
{
    INPUT ip;
    DWORD dwFlags = KEYEVENTF_SCANCODE;
    if (!isKeyDown)
        dwFlags |= KEYEVENTF_KEYUP;
    if (find(begin(extendKeys), end(extendKeys), key) != end(extendKeys))
        dwFlags |= KEYEVENTF_EXTENDEDKEY;
    ip.ki.time = 0;
    ip.ki.wVk = 0;
    ip.ki.dwExtraInfo = 0;
    ip.type = INPUT_KEYBOARD;
    ip.ki.dwFlags = dwFlags;
    ip.ki.wScan = MapVirtualKeyA(key, MAPVK_VK_TO_VSC);
    SendInput(1, &ip, sizeof(INPUT));
}

void Hardware::charPrinter(int code)
{
    INPUT ip;
    ip.ki.time = 0;
    ip.ki.wVk = 0;
    ip.ki.dwExtraInfo = 0;
    ip.type = INPUT_KEYBOARD;
    ip.ki.dwFlags = KEYEVENTF_UNICODE;
    ip.ki.wScan = code;
    SendInput(1, &ip, sizeof(INPUT));
    ip.ki.dwFlags |= KEYEVENTF_KEYUP;
    SendInput(1, &ip, sizeof(INPUT));
}

Napi::FunctionReference Hardware::constructor;

Napi::Object Hardware::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(
        env, "_Hardware", {
                              InstanceMethod("_getPos", &Hardware::getMousePos),
                              InstanceMethod("_toogleMb", &Hardware::toogleMb),
                              InstanceMethod("_move", &Hardware::move),
                              InstanceMethod("_scrollWheel", &Hardware::scrollWheel),
                              InstanceMethod("_toogleKey", &Hardware::toogleKey),
                              InstanceMethod("_printChar", &Hardware::printChar),
                              InstanceMethod("isForeground", &Hardware::isForeground),
                              InstanceMethod("setForeground", &Hardware::setForeground),
                              InstanceMethod("isOpen", &Hardware::isOpen),
                              InstanceAccessor("_workwindow", &Hardware::getWorkwindow, &Hardware::setWorkwindow),
                              InstanceAccessor("_lastCoords", &Hardware::getLastCoords, &Hardware::setLastCoords),
                          });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("_Hardware", func);
    return exports;
}
