
#include "hotkey.hpp"
#include "helper.hpp"

std::set<TsfnContext *> Hotkey::hotkeyPointers;

void Hotkey::unregisterDuplicate(UINT keyCode)
{
    for (auto it = hotkeyPointers.begin(); it != hotkeyPointers.end(); ++it)
        if ((*it)->keyCode == keyCode)
        {
            (*it)->keyCode = NONEXISTENT_VIRTUAL_KEY;
            (*it)->state = HOTKEY_UNREGISTERED;
            break;
        }
}

void Hotkey::messagesGetter(TsfnContext *context)
{
    MSG msg = {0};
    const UINT keyCode = context->keyCode;
    RegisterHotKey(NULL, 0, NULL, keyCode);
    auto callback = [](Napi::Env env, Napi::Function jsCallback) {
        jsCallback.Call({});
    };
    int8_t prevState = SOME_NUMBER;
    int8_t currState;
    while (context->state == HOTKEY_REGISTERED)
    {
        if (PeekMessageA(&msg, NULL, 0, 0, PM_REMOVE) && msg.message == WM_HOTKEY && (currState = GetKeyState(keyCode)) != prevState)
        {
            prevState = currState;
            context->tsfn.BlockingCall(callback);
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
    }
    UnregisterHotKey(NULL, 0);
    if (context->state == HOTKEY_REASSIGNMENT)
    {
        context->state = HOTKEY_REGISTERED;
        messagesGetter(context);
    }
    else if (context->state == HOTKEY_DELETED)
    {
        context->tsfn.Release();
        delete context;
    }
}

Hotkey::Hotkey(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Hotkey>(info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 3 || (!info[0].IsString() && !info[0].IsNumber()) || !info[1].IsString() || !info[2].IsFunction())
    {
        Napi::Error::New(env, "Expected 3 arguments: String || Number, String, Function")
            .ThrowAsJavaScriptException();
        return;
    }
    UINT keyCode;
    if (!Helper::getKeyCode(info[0], &keyCode))
    {
        Napi::Error::New(info.Env(), "Wrong key name")
            .ThrowAsJavaScriptException();
        return;
    }
    std::string mode = info[1].As<Napi::String>();
    if (mode == "toggle")
        hotkeyState = [&]() -> bool {
            return togglerState;
        };
    else if (mode == "hold")
        hotkeyState = [&]() -> bool {
            return GetKeyState((*it)->keyCode) < 0;
        };
    else if (mode == "once")
        hotkeyState = [&]() -> bool {
            return true;
        };
    else
    {
        Napi::Error::New(env, "Wrong mode")
            .ThrowAsJavaScriptException();
        return;
    }
    if (!hotkeyPointers.empty())
        unregisterDuplicate(keyCode);
    it = hotkeyPointers.insert(hotkeyPointers.end(), new TsfnContext);
    (*it)->keyCode = keyCode;
    (*it)->tsfn = Napi::ThreadSafeFunction::New(env, info[2].As<Napi::Function>(), "F", 0, 1);
    CreateThread(NULL, NULL, (LPTHREAD_START_ROUTINE)messagesGetter, (*it), NULL, NULL);
}

Napi::Value Hotkey::getHotkeyState(const Napi::CallbackInfo &info)
{
    return Napi::Boolean::New(info.Env(), hotkeyState());
}

void Hotkey::setHotkeyState(const Napi::CallbackInfo &info, const Napi::Value &value)
{
    togglerState = bool(info[0].As<Napi::Boolean>());
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
    if (!Helper::getKeyCode(info[0], &keyCode))
    {
        Napi::Error::New(info.Env(), "Wrong key name")
            .ThrowAsJavaScriptException();
        return;
    }
    if (hotkeyPointers.size() > 1)
        unregisterDuplicate(keyCode);
    (*it)->keyCode = keyCode;
    if ((*it)->state == HOTKEY_REGISTERED)
        (*it)->state = HOTKEY_REASSIGNMENT;
    else if ((*it)->state == HOTKEY_UNREGISTERED)
    {
        (*it)->state = HOTKEY_REGISTERED;
        CreateThread(NULL, NULL, (LPTHREAD_START_ROUTINE)messagesGetter, (*it), NULL, NULL);
    }
}

void Hotkey::unregisterHotkey(const Napi::CallbackInfo &info)
{
    (*it)->keyCode = NONEXISTENT_VIRTUAL_KEY;
    (*it)->state = HOTKEY_UNREGISTERED;
}

void Hotkey::unregisterAllHotkeys(const Napi::CallbackInfo &info)
{
    std::for_each(hotkeyPointers.begin(), hotkeyPointers.end(),
                  [](TsfnContext *context) {
                      context->state = HOTKEY_UNREGISTERED;
                      context->keyCode = NONEXISTENT_VIRTUAL_KEY;
                  });
}

void Hotkey::deleteHotkey(const Napi::CallbackInfo &info)
{
    (*it)->state = HOTKEY_DELETED;
    hotkeyPointers.erase(it);
}

void Hotkey::deleteAllHotkeys(const Napi::CallbackInfo &info)
{
    std::for_each(hotkeyPointers.begin(), hotkeyPointers.end(),
                  [](TsfnContext *context) {
                      context->state = HOTKEY_DELETED;
                  });
    hotkeyPointers.clear();
}

Napi::FunctionReference Hotkey::constructor;

Napi::Object Hotkey::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(env, "_GlobalHotkey", {
                                                                InstanceMethod("unregister", &Hotkey::unregisterHotkey),
                                                                InstanceMethod("delete", &Hotkey::deleteHotkey),
                                                                InstanceMethod("reassignment", &Hotkey::reassignmentHotkey),
                                                                InstanceAccessor("hotkeyState", &Hotkey::getHotkeyState, &Hotkey::setHotkeyState),
                                                                StaticMethod("unregisterAll", &Hotkey::unregisterAllHotkeys),
                                                                StaticMethod("deleteAll", &Hotkey::deleteAllHotkeys),
                                                            });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("_GlobalHotkey", func);
    return exports;
}