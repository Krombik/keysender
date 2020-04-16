
#include "hardware.hpp"
#include "virtual.hpp"
#include "hotkey.hpp"

void sleep(const Napi::CallbackInfo &info)
{
    if (info.Length() != 1 || !info[0].IsNumber())
        Napi::Error::New(info.Env(), "Expected 1 argument: Number")
            .ThrowAsJavaScriptException();
    else
        std::this_thread::sleep_for(std::chrono::milliseconds(info[0].As<Napi::Number>().Int32Value()));
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    Hardware::Init(env, exports);
    Virtual::Init(env, exports);
    Hotkey::Init(env, exports);
    exports["_sleep"] = Napi::Function::New(env, sleep);
    exports["_getWindow"] = Napi::Function::New(env, getWindow);
    exports["_getWindowChild"] = Napi::Function::New(env, getWindowChild);
    exports["vkToString"] = Napi::Function::New(env, vkToString);
    exports["getScreenSize"] = Napi::Function::New(env, getScreenSize);
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)