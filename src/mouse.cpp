#include <windows.h>
#include "mouse.hpp"

using namespace Napi;
using namespace std;

Value Mouse::getMousePos(const CallbackInfo &info)
{
    Env env = info.Env();
    if (info.Length() != 0)
        Error::New(env, "Expected exactly 0 arguments")
            .ThrowAsJavaScriptException();
    Array pos = Array::New(env);
    POINT coords;
    mousePosGetter(&coords);
    pos[(uint32_t)0] = coords.x;
    pos[1] = coords.y;
    return pos;
}

void Mouse::toogleMb(const CallbackInfo &info)
{
    Env env = info.Env();
    if (info.Length() != 2)
        Error::New(env, "Expected exactly 2 arguments")
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
    int x = info[0].As<Number>().Int32Value();
    int y = info[1].As<Number>().Int32Value();
    bool isAbsolute = info[2].As<Boolean>();
    mover(x, y, isAbsolute);
    if (isAbsolute)
    {
        lastCoords.x = x;
        lastCoords.y = y;
    }
    else
    {
        lastCoords.x += x;
        lastCoords.y += y;
    }
}

void Mouse::setLastCoords(const Napi::CallbackInfo &info, const Napi::Value &value)
{
    if (!info[0].IsArray())
        Napi::Error::New(info.Env(), "Expected an Array")
            .ThrowAsJavaScriptException();
    Napi::Array coords = info[0].As<Napi::Array>();
    lastCoords.x = coords.Get((uint32_t)0).As<Number>().Int64Value();
    lastCoords.y = coords.Get((uint32_t)1).As<Number>().Int64Value();
};

Napi::Value Mouse::getLastCoords(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    Napi::Array coords = Napi::Array::New(env);
    coords[(uint32_t)0] = lastCoords.x;
    coords[1] = lastCoords.y;
    return coords;
};

void Mouse::setSaveMod(const Napi::CallbackInfo &info, const Napi::Value &value)
{
    if (!info[0].IsBoolean())
        Napi::Error::New(info.Env(), "Expected an Boolean")
            .ThrowAsJavaScriptException();
    saveMod = info[0].As<Boolean>();
};

Napi::Value Mouse::getSaveMod(const Napi::CallbackInfo &info)
{
    return Napi::Boolean::New(info.Env(), saveMod);
};