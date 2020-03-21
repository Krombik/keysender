#include <windows.h>
#include "hotkey.hpp"
// #include "keyboard.hpp"

const std::map<std::string, UINT> keysDef = {
    {"0", 0x30},
    {"1", 0x31},
    {"2", 0x32},
    {"3", 0x33},
    {"4", 0x34},
    {"5", 0x35},
    {"6", 0x36},
    {"7", 0x37},
    {"8", 0x38},
    {"9", 0x39},
    {"a", 0x41},
    {"b", 0x42},
    {"c", 0x43},
    {"d", 0x44},
    {"e", 0x45},
    {"f", 0x46},
    {"g", 0x47},
    {"h", 0x48},
    {"i", 0x49},
    {"j", 0x4A},
    {"k", 0x4B},
    {"l", 0x4C},
    {"m", 0x4D},
    {"n", 0x4E},
    {"o", 0x4F},
    {"p", 0x50},
    {"q", 0x51},
    {"r", 0x52},
    {"s", 0x53},
    {"t", 0x54},
    {"u", 0x55},
    {"v", 0x56},
    {"w", 0x57},
    {"x", 0x58},
    {"y", 0x59},
    {"z", 0x5A},
    {"+", VK_OEM_PLUS},
    {"-", VK_OEM_MINUS},
    {".", VK_OEM_PERIOD},
    {",", VK_OEM_COMMA},
    {"/", VK_OEM_2},
    {"~", VK_OEM_3},
    {"[", VK_OEM_4},
    {"]", VK_OEM_6},
    {"|", VK_OEM_5},
    {"'", VK_OEM_7},
    {"backspace", VK_BACK},
    {"delete", VK_DELETE},
    {"enter", VK_RETURN},
    {"tab", VK_TAB},
    {"escape", VK_ESCAPE},
    {"up", VK_UP},
    {"down", VK_DOWN},
    {"right", VK_RIGHT},
    {"left", VK_LEFT},
    {"home", VK_HOME},
    {"end", VK_END},
    {"pageup", VK_PRIOR},
    {"pagedown", VK_NEXT},
    {"f1", VK_F1},
    {"f2", VK_F2},
    {"f3", VK_F3},
    {"f4", VK_F4},
    {"f5", VK_F5},
    {"f6", VK_F6},
    {"f7", VK_F7},
    {"f8", VK_F8},
    {"f9", VK_F9},
    {"f10", VK_F10},
    {"f11", VK_F11},
    {"f12", VK_F12},
    {"f13", VK_F13},
    {"f14", VK_F14},
    {"f15", VK_F15},
    {"f16", VK_F16},
    {"f17", VK_F17},
    {"f18", VK_F18},
    {"f19", VK_F19},
    {"f20", VK_F20},
    {"f21", VK_F21},
    {"f22", VK_F22},
    {"f23", VK_F23},
    {"f24", VK_F24},
    {"capslock", VK_CAPITAL},
    {"alt", VK_MENU},
    {"ctrl", VK_CONTROL},
    {"shift", VK_SHIFT},
    {"space", VK_SPACE},
    {"printscreen", VK_SNAPSHOT},
    {"insert", VK_INSERT},
    {"numlock", VK_NUMLOCK},
    {"num0", VK_NUMPAD0},
    {"num0", VK_NUMPAD0},
    {"num1", VK_NUMPAD1},
    {"num2", VK_NUMPAD2},
    {"num3", VK_NUMPAD3},
    {"num4", VK_NUMPAD4},
    {"num5", VK_NUMPAD5},
    {"num6", VK_NUMPAD6},
    {"num7", VK_NUMPAD7},
    {"num8", VK_NUMPAD8},
    {"num9", VK_NUMPAD9},
    {"num+", VK_ADD},
    {"num-", VK_SUBTRACT},
    {"num*", VK_MULTIPLY},
    {"num/", VK_DIVIDE},
    {"num.", VK_DECIMAL}};

void Hotkey::messagesGetter(TsfnContext *context)
{
    MSG msg = {0};
    UINT keyCode = keysDef.at(context->key);
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
                Napi::Error::New(info.Env(), "Wrong key combination")
                    .ThrowAsJavaScriptException();
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