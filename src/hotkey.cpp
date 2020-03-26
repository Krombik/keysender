#include <windows.h>
#include "hotkey.hpp"
#include "keyboard.hpp"

void Hotkey::messagesGetter(TsfnContext *context)
{
    MSG msg = {0};
    UINT keyCode = context->keyCode;
    RegisterHotKey(NULL, 0, context->keyFlags, keyCode);
    auto callback = [](Napi::Env env, Napi::Function jsCallback) {
        jsCallback.Call({});
    };
    int8_t prevKeyStatus = 0;
    int8_t currKeyStatus;
    bool isHoldEnable = context->isHoldEnable;
    int32_t delay = context->delay;
    while (GetMessageA(&msg, NULL, 0, 0) != 0)
        if (msg.message == WM_HOTKEY && (currKeyStatus = GetKeyState(keyCode)) < 0 && (isHoldEnable || currKeyStatus != prevKeyStatus))
        {
            prevKeyStatus = currKeyStatus;
            context->tsfn.BlockingCall(callback);
            if (delay > 0)
                std::this_thread::sleep_for(std::chrono::milliseconds(delay));
        }
}

void Hotkey::registerHotkey(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() < 3 || info.Length() > 5 || (!info[0].IsString() && !info[0].IsArray()) || !info[1].IsString() || !info[2].IsFunction() || (info.Length() > 3 && !info[3].IsBoolean()) || (info.Length() > 4 && !info[4].IsNumber()))
    {
        Napi::Error::New(env, "Expected 3-5 arguments: String || Array, String, Function, Boolean, Number")
            .ThrowAsJavaScriptException();
        return;
    }
    hotkeysRef.push_back(new TsfnContext);
    if (info[0].IsString())
        hotkeysRef.back()->keyCode = Keyboard::keysDef.at(info[0].As<Napi::String>());
    else
    {
        Napi::Array keys(env, info[0]);
        std::string lastKey(keys.Get(keys.Length() - 1).As<Napi::String>());
        if (keys.Length() > 1)
            for (uint8_t i = 0; i < keys.Length() - 1; i++)
            {
                std::string keyName(keys.Get(i).As<Napi::String>());
                if (flags.count(keyName) == 0)
                {
                    Napi::Error::New(env, "Wrong key modificators")
                        .ThrowAsJavaScriptException();
                    return;
                }
                hotkeysRef.back()->keyFlags |= flags.at(keyName);
            }
        if (flags.count(lastKey) != 0 || Keyboard::keysDef.count(lastKey) == 0)
        {
            Napi::Error::New(env, "Wrong key")
                .ThrowAsJavaScriptException();
            return;
        }
        hotkeysRef.back()->keyCode = Keyboard::keysDef.at(lastKey);
    }
    hotkeysRef.back()->name = info[1].As<Napi::String>();
    hotkeysRef.back()->tsfn = Napi::ThreadSafeFunction::New(env, info[2].As<Napi::Function>(), "F", 0, 1);
    if (info.Length() > 3 && bool(info[3].As<Napi::Boolean>()))
    {
        hotkeysRef.back()->isHoldEnable = true;
        if (info.Length() > 4)
            hotkeysRef.back()->delay = info[4].As<Napi::Number>().Int32Value();
    }
    hotkeysRef.back()->thread = CreateThread(NULL, NULL, (LPTHREAD_START_ROUTINE)messagesGetter, hotkeysRef.back(), NULL, NULL);
}

void Hotkey::unregisterHotkey(const Napi::CallbackInfo &info)
{
    if (info.Length() != 1 || !info[0].IsString())
    {
        Napi::Error::New(info.Env(), "Expected 1 argument: String")
            .ThrowAsJavaScriptException();
        return;
    }
    std::string name(info[0].As<Napi::String>());
    for (uint8_t i = 0; i < hotkeysRef.size(); i++)
        if (hotkeysRef[i]->name == name)
        {
            TerminateThread(hotkeysRef[i]->thread, NULL);
            delete hotkeysRef[i];
            hotkeysRef.erase(hotkeysRef.begin() + i);
            break;
        }
    hotkeysRef.shrink_to_fit();
}

void Hotkey::unregisterAllHotkeys(const Napi::CallbackInfo &info)
{
    for (uint8_t i = 0; i < hotkeysRef.size(); i++)
    {
        TerminateThread(hotkeysRef[i]->thread, NULL);
        delete hotkeysRef[i];
    }
    hotkeysRef.clear();
    hotkeysRef.shrink_to_fit();
}

Napi::Value Hotkey::findHotkeyName(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 1 || (!info[0].IsString() && !info[0].IsArray()))
    {
        Napi::Error::New(env, "Expected 1 argument: String || Array")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    UINT keyCode;
    UINT keyFlags = NULL;
    if (info[0].IsString())
        keyCode = Keyboard::keysDef.at(info[0].As<Napi::String>());
    else
    {
        Napi::Array keys(env, info[0]);
        std::string lastKey(keys.Get(keys.Length() - 1).As<Napi::String>());
        if (keys.Length() > 1)
            for (uint8_t i = 0; i < keys.Length() - 1; i++)
            {
                std::string keyName(keys.Get(i).As<Napi::String>());
                if (flags.count(keyName) == 0)
                {
                    Napi::Error::New(env, "Wrong key modificators")
                        .ThrowAsJavaScriptException();
                    return env.Undefined();
                }
                keyFlags |= flags.at(keyName);
            }
        if (flags.count(lastKey) != 0 || Keyboard::keysDef.count(lastKey) == 0)
        {
            Napi::Error::New(env, "Wrong key")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        keyCode = Keyboard::keysDef.at(lastKey);
    }
    for (uint8_t i = 0; i < hotkeysRef.size(); i++)
        if (hotkeysRef[i]->keyCode == keyCode && hotkeysRef[i]->keyFlags == keyFlags)
            return Napi::String::New(env, hotkeysRef[i]->name);
    return env.Null();
}

Napi::FunctionReference Hotkey::constructor;

Napi::Object Hotkey::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(env, "GlobalHotkey", {
                                                               StaticMethod("register", &Hotkey::registerHotkey),
                                                               StaticMethod("unregister", &Hotkey::unregisterHotkey),
                                                               StaticMethod("unregisterAll", &Hotkey::unregisterAllHotkeys),
                                                               StaticMethod("findHotkeyName", &Hotkey::findHotkeyName),
                                                           });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("GlobalHotkey", func);
    return exports;
}