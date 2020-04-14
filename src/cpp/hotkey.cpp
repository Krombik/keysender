
#include "hotkey.hpp"
#include "keyboard.hpp"

Napi::Value Hotkey::buttonIsPressed(const Napi::CallbackInfo &info)
{
    return Napi::Boolean::New(info.Env(), GetKeyState(Keyboard::keysDef.at(std::string(info[0].As<Napi::String>()))) < 0);
}

void Hotkey::messagesGetter(TsfnContext *context)
{
    MSG msg = {0};
    const UINT keyCode = context->keyCode;
    RegisterHotKey(NULL, 0, NULL, keyCode);
    auto callback = [](Napi::Env env, Napi::Function jsCallback) {
        jsCallback.Call({});
    };
    int8_t prevState = 5;
    int8_t currState;
    while (context->exist)
    {
        if (PeekMessageA(&msg, NULL, 0, 0, PM_REMOVE) && msg.message == WM_HOTKEY && (currState = GetKeyState(keyCode)) != prevState)
        {
            prevState = currState;
            context->tsfn.BlockingCall(callback);
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
    }
    UnregisterHotKey(NULL, 0);
    context->tsfn.Release();
    delete context;
}

void Hotkey::registerHotkey(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 3 || (!info[0].IsString() && !info[0].IsNumber()) || !info[1].IsString() || !info[2].IsFunction())
    {
        Napi::Error::New(env, "Expected 3 arguments: String || Number, String, Function")
            .ThrowAsJavaScriptException();
        return;
    }
    UINT keyCode;
    if (info[0].IsNumber())
        keyCode = info[0].As<Napi::Number>();
    else
    {
        const std::string keyName = info[0].As<Napi::String>();
        if (Keyboard::keysDef.count(keyName) == 0)
        {
            Napi::Error::New(info.Env(), "Wrong key name")
                .ThrowAsJavaScriptException();
            return;
        }
        keyCode = Keyboard::keysDef.at(keyName);
    }
    hotkeysRef.push_back(new TsfnContext);
    hotkeysRef.back()->keyCode = keyCode;
    hotkeysRef.back()->name = info[1].As<Napi::String>();
    hotkeysRef.back()->tsfn = Napi::ThreadSafeFunction::New(env, info[2].As<Napi::Function>(), "F", 0, 1);
    CreateThread(NULL, NULL, (LPTHREAD_START_ROUTINE)messagesGetter, hotkeysRef.back(), NULL, NULL);
}

void Hotkey::unregisterHotkey(const Napi::CallbackInfo &info)
{
    if (info.Length() != 1 || !info[0].IsString())
    {
        Napi::Error::New(info.Env(), "Expected 1 argument: String")
            .ThrowAsJavaScriptException();
        return;
    }
    const std::string name(info[0].As<Napi::String>());
    for (uint8_t i = 0; i < hotkeysRef.size(); i++)
        if (hotkeysRef[i]->name == name)
        {
            hotkeysRef[i]->exist = false;
            hotkeysRef.erase(hotkeysRef.begin() + i);
            i--;
        }
}

void Hotkey::unregisterAllHotkeys(const Napi::CallbackInfo &info)
{
    for (uint8_t i = 0; i < hotkeysRef.size(); i++)
        hotkeysRef[i]->exist = false;
    hotkeysRef.clear();
}

Napi::Value Hotkey::findHotkeyName(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 1 || (!info[0].IsString() && !info[0].IsNumber()))
    {
        Napi::Error::New(env, "Expected 1 argument: String || Number")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    UINT keyCode;
    if (info[0].IsNumber())
        keyCode = info[0].As<Napi::Number>();
    else
    {
        const std::string keyName = info[0].As<Napi::String>();
        if (Keyboard::keysDef.count(keyName) == 0)
        {
            Napi::Error::New(info.Env(), "Wrong key name")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        keyCode = Keyboard::keysDef.at(keyName);
    }
    for (uint8_t i = 0; i < hotkeysRef.size(); i++)
        if (hotkeysRef[i]->keyCode == keyCode)
            return Napi::String::New(env, hotkeysRef[i]->name);
    return env.Undefined();
}

Napi::FunctionReference Hotkey::constructor;

Napi::Object Hotkey::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(env, "_GlobalHotkey", {
                                                                StaticMethod("_register", &Hotkey::registerHotkey),
                                                                StaticMethod("unregister", &Hotkey::unregisterHotkey),
                                                                StaticMethod("unregisterAll", &Hotkey::unregisterAllHotkeys),
                                                                StaticMethod("findHotkeyName", &Hotkey::findHotkeyName),
                                                                StaticMethod("_buttonIsPressed", &Hotkey::buttonIsPressed),
                                                            });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("_GlobalHotkey", func);
    return exports;
}