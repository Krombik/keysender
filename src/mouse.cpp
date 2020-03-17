#include <windows.h>
#include "mouse.hpp"

Napi::Value Mouse::getMousePos(const Napi::CallbackInfo &info)
{
    Napi::Array pos = Napi::Array::New(info.Env());
    POINT coords;
    mousePosGetter(&coords);
    pos[(uint32_t)0] = coords.x;
    pos[1] = coords.y;
    return pos;
}

void Mouse::toogleMb(const Napi::CallbackInfo &info)
{
    if (info.Length() != 2 || !info[0].IsString() || !info[1].IsBoolean())
        Napi::Error::New(info.Env(), "Expected 2 arguments: String, Boolean")
            .ThrowAsJavaScriptException();
    else
    {
        int button = std::distance(buttonsName.begin(), std::find(buttonsName.begin(), buttonsName.end(), std::string(info[0].As<Napi::String>())));
        if (button == (int)buttonsName.size())
            Napi::Error::New(info.Env(), "Wrong button name")
                .ThrowAsJavaScriptException();
        else
            mbToogler(button, info[1].As<Napi::Boolean>());
    }
}

void Mouse::scrollWheel(const Napi::CallbackInfo &info)
{
    if (info.Length() != 1 || !info[0].IsNumber())
        Napi::Error::New(info.Env(), "Expected 1 argument: Number")
            .ThrowAsJavaScriptException();
    else
        wheelScroller(info[0].As<Napi::Number>().Int32Value());
}

void Mouse::move(const Napi::CallbackInfo &info)
{
    if (info.Length() != 3 || !info[0].IsNumber() || !info[1].IsNumber() || !info[2].IsBoolean())
        Napi::Error::New(info.Env(), "Expected 3 arguments: Number, Number, Boolean")
            .ThrowAsJavaScriptException();
    else
    {
        int x = info[0].As<Napi::Number>().Int32Value();
        int y = info[1].As<Napi::Number>().Int32Value();
        bool isAbsolute = info[2].As<Napi::Boolean>();
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
}

void Mouse::setLastCoords(const Napi::CallbackInfo &info, const Napi::Value &value)
{
    if (info[0].IsArray())
    {
        Napi::Array coords(info.Env(), info[0]);
        int x = coords.Get((uint32_t)0).As<Napi::Number>().Int64Value();
        int y = coords.Get(1).As<Napi::Number>().Int64Value();
        if (x >= 0)
            lastCoords.x = x;
        else
            Napi::Error::New(info.Env(), "x should be >= 0")
                .ThrowAsJavaScriptException();
        if (y >= 0)
            lastCoords.y = y;
        else
            Napi::Error::New(info.Env(), "x should be >= 0")
                .ThrowAsJavaScriptException();
    }
    else
        Napi::Error::New(info.Env(), "Expected an Array")
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
    if (info[0].IsBoolean())
        saveMod = info[0].As<Napi::Boolean>();
    else
        Napi::Error::New(info.Env(), "Expected a Boolean")
            .ThrowAsJavaScriptException();
};

Napi::Value Mouse::getSaveMod(const Napi::CallbackInfo &info)
{
    return Napi::Boolean::New(info.Env(), saveMod);
};