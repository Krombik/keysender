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

void Virtual::toogleMbAt(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 4)
        Napi::Error::New(env, "Expected exactly 4 arguments")
            .ThrowAsJavaScriptException();
    if (!info[0].IsString())
        Napi::Error::New(env, "arg1 - Expected an String")
            .ThrowAsJavaScriptException();
    if (!info[1].IsBoolean())
        Napi::Error::New(env, "arg2 - Expected an Boolean")
            .ThrowAsJavaScriptException();
    if (!info[2].IsNumber())
        Napi::Error::New(env, "arg3 - Expected an Number")
            .ThrowAsJavaScriptException();
    if (!info[3].IsNumber())
        Napi::Error::New(env, "arg4 - Expected an Number")
            .ThrowAsJavaScriptException();
    const LPARAM lParam = MAKELPARAM(info[2].As<Napi::Number>().Int32Value(), info[3].As<Napi::Number>().Int32Value());
    const UINT action = msgs.at(info[0].As<Napi::String>())[(int)info[1].As<Napi::Boolean>()];
    PostMessageA(hWnd, WM_MOUSEMOVE, 1, lParam);
    PostMessageA(hWnd, action, wParams.at(action), lParam);
}

void Virtual::moveTo(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 4)
        Napi::Error::New(env, "Expected exactly 4 arguments")
            .ThrowAsJavaScriptException();
    if (!info[0].IsNumber())
        Napi::Error::New(env, "arg1 - Expected an Number")
            .ThrowAsJavaScriptException();
    if (!info[1].IsNumber())
        Napi::Error::New(env, "arg2 - Expected an Number")
            .ThrowAsJavaScriptException();
    if (!info[2].IsNumber())
        Napi::Error::New(env, "arg3 - Expected an Number")
            .ThrowAsJavaScriptException();
    if (!info[3].IsNumber())
        Napi::Error::New(env, "arg4 - Expected an Number")
            .ThrowAsJavaScriptException();
    PostMessageA(hWnd, WM_MOUSEMOVE, 1, MAKELPARAM(info[2].As<Napi::Number>().Int32Value(), info[3].As<Napi::Number>().Int32Value()));
    PostMessageA(hWnd, WM_MOUSEMOVE, 1, MAKELPARAM(info[0].As<Napi::Number>().Int32Value(), info[1].As<Napi::Number>().Int32Value()));
}

void Virtual::scrollWheelAt(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 3)
        Napi::Error::New(env, "Expected exactly 1 arguments")
            .ThrowAsJavaScriptException();
    if (!info[0].IsNumber())
        Napi::Error::New(env, "Expected an Number")
            .ThrowAsJavaScriptException();
    if (!info[1].IsNumber())
        Napi::Error::New(env, "arg3 - Expected an Number")
            .ThrowAsJavaScriptException();
    if (!info[2].IsNumber())
        Napi::Error::New(env, "arg4 - Expected an Number")
            .ThrowAsJavaScriptException();
    SendMessageA(hWnd, WM_MOUSEWHEEL, MAKEWPARAM(info[0].As<Napi::Number>().Int32Value(), MK_MBUTTON), MAKELPARAM(info[1].As<Napi::Number>().Int32Value(), info[2].As<Napi::Number>().Int32Value()));
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
                             InstanceMethod("_sleep", &Virtual::sleep),
                             InstanceMethod("_toogleMbAt", &Virtual::toogleMbAt),
                             InstanceMethod("_moveTo", &Virtual::moveTo),
                             InstanceMethod("_scrollWheelAt", &Virtual::scrollWheelAt),
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
