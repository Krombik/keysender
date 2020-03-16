#include <windows.h>
#include "mouse.hpp"

using namespace Napi;
using namespace std;

Value Mouse::getMousePos(const CallbackInfo &info)
{
    Array pos = Array::New(info.Env());
    POINT coords;
    mousePosGetter(&coords);
    pos[(uint32_t)0] = coords.x;
    pos[1] = coords.y;
    return pos;
}

void Mouse::toogleMb(const CallbackInfo &info)
{
    if (info.Length() != 2 || !info[0].IsString() || !info[1].IsBoolean())
        Error::New(info.Env(), "Expected 2 arguments: String, Boolean")
            .ThrowAsJavaScriptException();
    mbToogler(info[0].As<String>(), info[1].As<Boolean>());
}

void Mouse::scrollWheel(const CallbackInfo &info)
{
    if (info.Length() != 1 || !info[0].IsNumber())
        Error::New(info.Env(), "Expected 1 argument: Number")
            .ThrowAsJavaScriptException();
    wheelScroller(info[0].As<Number>().Int32Value());
}

void Mouse::move(const CallbackInfo &info)
{
    if (info.Length() != 3 || !info[0].IsNumber() || !info[1].IsNumber() || !info[2].IsBoolean())
        Error::New(info.Env(), "Expected 3 arguments: Number, Number, Boolean")
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
    Napi::Array coords(info.Env(), info[0]);
    if ((lastCoords.x = coords.Get((uint32_t)0).As<Number>().Int64Value()) < 0)
        Napi::Error::New(info.Env(), "x should be >= 0")
            .ThrowAsJavaScriptException();
    if ((lastCoords.y = coords.Get(1).As<Number>().Int64Value()) < 0)
        Napi::Error::New(info.Env(), "x should be >= 0")
            .ThrowAsJavaScriptException();
};

Napi::Value Mouse::getLastCoords(const Napi::CallbackInfo &info)
{
    Napi::Array coords = Napi::Array::New(info.Env());
    coords[(uint32_t)0] = lastCoords.x;
    coords[1] = lastCoords.y;
    return coords;
};

void Mouse::setSaveMod(const Napi::CallbackInfo &info, const Napi::Value &value)
{
    if (!info[0].IsBoolean())
        Napi::Error::New(info.Env(), "Expected a Boolean")
            .ThrowAsJavaScriptException();
    saveMod = info[0].As<Boolean>();
};

Napi::Value Mouse::getSaveMod(const Napi::CallbackInfo &info)
{
    return Napi::Boolean::New(info.Env(), saveMod);
};