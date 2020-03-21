#include <windows.h>
#include "hotkey.hpp"
#include "keyboard.hpp"

void Hotkey::messagesGetter(TsfnContext *context)
{
    MSG msg = {0};
    UINT keyCode = Keyboard::keysDef.at(context->key);
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
    hotkeysRef.push_back(new TsfnContext);
    std::string name(info[0].As<Napi::String>());
    std::stringstream stream(name);
    std::string segment;
    std::vector<std::string> seglist;
    while (std::getline(stream, segment, '&'))
        seglist.push_back(segment);
    if (seglist.size() > 1)
        for (uint8_t i = 0; i < seglist.size() - 1; i++)
            if (flags.count(seglist[i]) == 1)
                hotkeysRef.back()->keyFlags |= flags.at(seglist[i]);
            else
            {
                Napi::Error::New(env, "Wrong key combination")
                    .ThrowAsJavaScriptException();
                return;
            }
    if (Keyboard::keysDef.count(seglist.back()) == 0 || flags.count(seglist.back()) != 0)
    {
        Napi::Error::New(env, "Wrong key")
            .ThrowAsJavaScriptException();
        return;
    }
    if (info[2].IsBoolean() && bool(info[2].As<Napi::Boolean>()))
    {
        hotkeysRef.back()->isHoldEnable = true;
        if (info[3].IsNumber())
            hotkeysRef.back()->delay = info[3].As<Napi::Number>().Int32Value();
    }
    hotkeysRef.back()->name = name;
    hotkeysRef.back()->key = seglist.back();
    hotkeysRef.back()->tsfn = Napi::ThreadSafeFunction::New(env, info[1].As<Napi::Function>(), "TSFN", 0, 1);
    hotkeysRef.back()->thread = CreateThread(NULL, NULL, (LPTHREAD_START_ROUTINE)messagesGetter, hotkeysRef.back(), NULL, NULL);
}

void Hotkey::unregisterHotkey(const Napi::CallbackInfo &info)
{
    std::string key(info[0].As<Napi::String>());
    for (uint8_t i = 0; i < hotkeysRef.size(); i++)
        if (hotkeysRef[i]->name == key)
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

Napi::FunctionReference Hotkey::constructor;

Napi::Object Hotkey::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(env, "GlobalHotkey", {
                                                               StaticMethod("register", &Hotkey::registerHotkey),
                                                               StaticMethod("unregister", &Hotkey::unregisterHotkey),
                                                               StaticMethod("unregisterAll", &Hotkey::unregisterAllHotkeys),
                                                           });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("GlobalHotkey", func);
    return exports;
}