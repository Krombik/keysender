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

void Hardware::keyToogler(UINT key, bool isKeyDown, int delay)
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
    if (delay > 0)
        Sleep(delay);
}

void Hardware::textPrinter(Napi::Array text, int keyTooglerDelay, int keySenderDelay)
{
    for (size_t i = 0; i < text.Length(); i++)
    {
        // SendMessageW(GetForegroundWindow(), WM_CHAR, (WPARAM)text[i], 0);
        INPUT ip;
        ip.ki.time = 0;
        ip.ki.wVk = 0;
        ip.ki.dwExtraInfo = 0;
        ip.type = INPUT_KEYBOARD;
        ip.ki.dwFlags = KEYEVENTF_UNICODE;
        ip.ki.wScan = Napi::Value(text[i]).ToNumber().Int32Value();
        SendInput(1, &ip, sizeof(INPUT));
        if (keyTooglerDelay > 0)
            Sleep(keyTooglerDelay);
        ip.ki.dwFlags |= KEYEVENTF_KEYUP;
        SendInput(1, &ip, sizeof(INPUT));
        if (keySenderDelay > 0)
            Sleep(keySenderDelay);
    }
}

Napi::FunctionReference Hardware::constructor;

Napi::Object Hardware::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env, "Hardware", {
                             InstanceMethod("toogleKey", &Hardware::toogleKey),
                             InstanceMethod("printText", &Hardware::printText),
                             InstanceMethod("isForeground", &Hardware::isForeground),
                             InstanceMethod("setForeground", &Hardware::setForeground),
                             InstanceMethod("isOpen", &Hardware::isOpen),
                             InstanceAccessor("workwindow", &Hardware::getWorkwindow, &Hardware::setWorkwindow),
                         });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("Hardware", func);
    return exports;
}
