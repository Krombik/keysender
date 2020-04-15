
#include "hotkey.hpp"
#include "keyboard.hpp"

std::set<TsfnContext *> Hotkey::hotkeyPointers;

void Hotkey::messagesGetter(TsfnContext *context)
{
    MSG msg = {0};
    const UINT keyCode = context->keyCode;
    if (!hotkeyPointers.empty())
        for (auto it = hotkeyPointers.begin(); it != hotkeyPointers.end(); ++it)
            if ((*it)->keyCode == keyCode && context != (*it))
            {
                (*it)->exist = false;
                hotkeyPointers.erase(it);
                break;
            }
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
    if (context->reassignment)
    {
        context->reassignment = false;
        context->exist = true;
        messagesGetter(context);
    }
    else
    {
        context->tsfn.Release();
        delete context;
    }
}

Hotkey::Hotkey(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Hotkey>(info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 2 || (!info[0].IsString() && !info[0].IsNumber()) || !info[1].IsFunction())
    {
        Napi::Error::New(env, "Expected 2 arguments: String || Number, Function")
            .ThrowAsJavaScriptException();
        return;
    }
    UINT keyCode;
    if (!Keyboard::getKeyCode(info[0], &keyCode))
    {
        Napi::Error::New(info.Env(), "Wrong key name")
            .ThrowAsJavaScriptException();
        return;
    }
    it = hotkeyPointers.insert(hotkeyPointers.end(), new TsfnContext);
    (*it)->keyCode = keyCode;
    (*it)->tsfn = Napi::ThreadSafeFunction::New(env, info[1].As<Napi::Function>(), "F", 0, 1);
    CreateThread(NULL, NULL, (LPTHREAD_START_ROUTINE)messagesGetter, (*it), NULL, NULL);
}

Napi::Value Hotkey::isButtonPressed(const Napi::CallbackInfo &info)
{
    return Napi::Boolean::New(info.Env(), GetKeyState((*it)->keyCode) < 0);
}

void Hotkey::reassignmentHotkey(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 1 || (!info[0].IsString() && !info[0].IsNumber()))
    {
        Napi::Error::New(env, "Expected 1 arguments: String || Number")
            .ThrowAsJavaScriptException();
        return;
    }
    UINT keyCode;
    if (!Keyboard::getKeyCode(info[0], &keyCode))
    {
        Napi::Error::New(info.Env(), "Wrong key name")
            .ThrowAsJavaScriptException();
        return;
    }
    (*it)->reassignment = true;
    (*it)->exist = false;
    (*it)->keyCode = keyCode;
}

void Hotkey::unregisterHotkey(const Napi::CallbackInfo &info)
{
    (*it)->exist = false;
    hotkeyPointers.erase(it);
}

void Hotkey::unregisterAllHotkeys(const Napi::CallbackInfo &info)
{
    std::for_each(hotkeyPointers.begin(), hotkeyPointers.end(),
                  [](TsfnContext *context) {
                      context->exist = false;
                  });
    hotkeyPointers.clear();
}

Napi::FunctionReference Hotkey::constructor;

Napi::Object Hotkey::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(env, "_GlobalHotkey", {
                                                                InstanceMethod("unregister", &Hotkey::unregisterHotkey),
                                                                InstanceMethod("reassignment", &Hotkey::reassignmentHotkey),
                                                                StaticMethod("unregisterAll", &Hotkey::unregisterAllHotkeys),
                                                                InstanceMethod("_isButtonPressed", &Hotkey::isButtonPressed),
                                                            });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("_GlobalHotkey", func);
    return exports;
}