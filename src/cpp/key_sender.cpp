
#include "hardware.hpp"
#include "virtual.hpp"
#include "hotkey.hpp"
#include "utilities.hpp"

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    Hardware::Init(env, exports);
    Virtual::Init(env, exports);
    Hotkey::Init(env, exports);
    exports["_sleep"] = Napi::Function::New(env, sleep);
    exports["_textToImg"] = Napi::Function::New(env, textToImg);
    exports["_getAllWindows"] = Napi::Function::New(env, getAllWindows);
    exports["_getWindowChildren"] = Napi::Function::New(env, getWindowChildren);
    exports["vkToString"] = Napi::Function::New(env, vkToString);
    exports["getScreenSize"] = Napi::Function::New(env, getScreenSize);
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)