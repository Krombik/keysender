#include "virtual.hpp"

const std::map<uint8_t, std::array<UINT, 2>> Virtual::msgs = {
    {0, {WM_LBUTTONUP, WM_LBUTTONDOWN}},
    {1, {WM_RBUTTONUP, WM_RBUTTONDOWN}},
    {2, {WM_MBUTTONUP, WM_MBUTTONDOWN}}};
const std::map<UINT, UINT> Virtual::wParams = {{WM_LBUTTONDOWN, MK_LBUTTON},
                                               {WM_RBUTTONDOWN, MK_RBUTTON},
                                               {WM_MBUTTONDOWN, MK_MBUTTON},
                                               {WM_LBUTTONUP, 0},
                                               {WM_RBUTTONUP, 0},
                                               {WM_MBUTTONUP, 0}};

void Virtual::mousePosGetter(POINT *coords)
{
    GetCursorPos(coords);
    ScreenToClient(hWnd, coords);
}

Napi::Value Virtual::getLastCoords(const Napi::CallbackInfo &info)
{
    Napi::Object coords = Napi::Object::New(info.Env());
    coords["x"] = lastCoords.x;
    coords["y"] = lastCoords.y;
    return coords;
};

void Virtual::mbToggler(uint8_t button, bool isButtonDown)
{
    const UINT action = msgs.at(button)[(int)isButtonDown];
    PostMessageA(hWnd, action, wParams.at(action), MAKELPARAM(lastCoords.x, lastCoords.y));
}

void Virtual::mover(POINT coords, bool isAbsolute)
{
    if (saveMod)
        PostMessageA(hWnd, WM_MOUSEMOVE, 1, MAKELPARAM(lastCoords.x, lastCoords.y));
    PostMessageA(hWnd, WM_MOUSEMOVE, 1, isAbsolute ? MAKELPARAM(coords.x, coords.y) : MAKELPARAM(lastCoords.x + coords.x, lastCoords.y + coords.y));
    if (isAbsolute)
    {
        lastCoords.x = coords.x;
        lastCoords.y = coords.y;
    }
    else
    {
        lastCoords.x += coords.x;
        lastCoords.y += coords.y;
    }
}

void Virtual::wheelScroller(int x)
{
    SendMessageA(hWnd, WM_MOUSEWHEEL, MAKEWPARAM(x, MK_MBUTTON), MAKELPARAM(lastCoords.x, lastCoords.y));
}

void Virtual::keyToggler(UINT key, bool isKeyDown)
{
    PostMessageA(hWnd, isKeyDown ? WM_KEYDOWN : WM_KEYUP, key, 0 | (key << 16) | (0 << 24) | (0 << 29) | ((UINT)!isKeyDown << 30) | ((UINT)!isKeyDown << 31));
}

void Virtual::charPrinter(int code)
{
    SendMessageW(hWnd, WM_CHAR, (WPARAM)code, 0);
}

Napi::FunctionReference Virtual::constructor;

Napi::Object Virtual::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(
        env, "Virtual", {
                            InstanceMethod("_getPos", &Virtual::getMousePos),
                            InstanceMethod("_toggleMb", &Virtual::toggleMb),
                            InstanceMethod("_move", &Virtual::move),
                            InstanceMethod("_scrollWheel", &Virtual::scrollWheel),
                            InstanceMethod("_toggleKey", &Virtual::toggleKey),
                            InstanceMethod("_printChar", &Virtual::printChar),
                            InstanceMethod("_setForeground", &Virtual::setForeground),
                            InstanceMethod("_isForeground", &Virtual::isForeground),
                            InstanceMethod("_isOpen", &Virtual::isOpen),
                            InstanceMethod("_capture", &Virtual::capture),
                            InstanceMethod("_getColor", &Virtual::getColor),
                            InstanceMethod("_kill", &Virtual::kill),
                            InstanceMethod("_close", &Virtual::close),
                            InstanceAccessor("_workwindow", &Virtual::getWorkwindow, &Virtual::setWorkwindow),
                            InstanceAccessor("_lastCoords", &Virtual::getLastCoords, NULL),
                            InstanceAccessor("_saveMod", &Virtual::getSaveMod, &Virtual::setSaveMod),
                            InstanceAccessor("_windowInfo", &Virtual::getWindowInfo, &Virtual::setWindowInfo),
                        });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("Virtual", func);
    return exports;
}
