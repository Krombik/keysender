#include <windows.h>
#include "mouse.hpp"
#include <locale>
#include <codecvt>

using namespace Napi;
using namespace std;

void Mouse::toogleMb(const CallbackInfo &info)
{
    Env env = info.Env();
    if (info.Length() != 3)
        Error::New(env, "Expected exactly 3 arguments")
            .ThrowAsJavaScriptException();
    if (!info[0].IsString())
        Error::New(env, "arg1 - Expected an String")
            .ThrowAsJavaScriptException();
    if (!info[1].IsBoolean())
        Error::New(env, "arg2 - Expected an Boolean")
            .ThrowAsJavaScriptException();
    mbToogler(info[0].As<String>(), info[1].As<Boolean>());
}

void Mouse::scrollWheel(const CallbackInfo &info)
{
    Env env = info.Env();
    if (info.Length() != 1)
        Error::New(env, "Expected exactly 1 arguments")
            .ThrowAsJavaScriptException();
    if (!info[0].IsNumber())
        Error::New(env, "Expected an Number")
            .ThrowAsJavaScriptException();
    wheelScroller(info[0].As<Number>().Int32Value());
}

void Mouse::move(const CallbackInfo &info)
{
    Env env = info.Env();
    if (info.Length() != 3)
        Error::New(env, "Expected exactly 3 arguments")
            .ThrowAsJavaScriptException();
    if (!info[0].IsNumber())
        Error::New(env, "arg1 - Expected an Number")
            .ThrowAsJavaScriptException();
    if (!info[1].IsNumber())
        Error::New(env, "arg2 - Expected an Number")
            .ThrowAsJavaScriptException();
    if (!info[2].IsBoolean())
        Error::New(env, "arg3 - Expected an Boolean")
            .ThrowAsJavaScriptException();
    mover(info[0].As<Number>().Int32Value(), info[1].As<Number>().Int32Value(), info[2].As<Boolean>());
}