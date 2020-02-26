#include <windows.h>
#include "hardware.hpp"
#include <iostream>
#include <algorithm>
#include <iterator>

using namespace std;

Hardware::Hardware(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Hardware>(info)
{
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    string w = info[0].As<Napi::String>();
    this->workwindow = FindWindowW(NULL, LPCWSTR(wstring(w.begin(), w.end()).c_str()));
}

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

void Hardware::textPrinter(std::string text)
{
    for (short int i = 0; i < text.length(); i++)
        SendMessageW(GetForegroundWindow(), WM_CHAR, (WPARAM)text[i], 0);
}

Napi::Value Hardware::isWorkwindowActive(const Napi::CallbackInfo &info)
{
    return Napi::Boolean::New(info.Env(), workwindow == GetForegroundWindow());
}

Napi::FunctionReference Hardware::constructor;

Napi::Object Hardware::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env, "Hardware", {InstanceMethod("toogleKey", &Hardware::toogleKey), InstanceMethod("isWorkwindowActive", &Hardware::isWorkwindowActive), InstanceMethod("printText", &Hardware::printText), InstanceAccessor("keyTooglerDelay", &Hardware::getKeyTooglerDelay, &Hardware::setKeyTooglerDelay), InstanceAccessor("keySenderDelay", &Hardware::getKeySenderDelay, &Hardware::setKeySenderDelay)});

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("Hardware", func);
    return exports;
}
