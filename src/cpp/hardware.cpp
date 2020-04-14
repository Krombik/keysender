#include "hardware.hpp"

const UINT Hardware::extendKeys[] = {
    VK_RCONTROL,
    VK_SNAPSHOT,
    VK_RMENU,
    VK_PAUSE,
    VK_HOME,
    VK_UP,
    VK_PRIOR,
    VK_LEFT,
    VK_RIGHT,
    VK_END,
    VK_DOWN,
    VK_NEXT,
    VK_INSERT,
    VK_DELETE,
    VK_LWIN,
    VK_RWIN,
    VK_APPS,
    VK_VOLUME_MUTE,
    VK_VOLUME_DOWN,
    VK_VOLUME_UP,
    VK_MEDIA_NEXT_TRACK,
    VK_MEDIA_PREV_TRACK,
    VK_MEDIA_STOP,
    VK_MEDIA_PLAY_PAUSE,
    VK_BROWSER_BACK,
    VK_BROWSER_FORWARD,
    VK_BROWSER_REFRESH,
    VK_BROWSER_STOP,
    VK_BROWSER_SEARCH,
    VK_BROWSER_FAVORITES,
    VK_BROWSER_HOME,
    VK_LAUNCH_MAIL,
};

const std::map<uint8_t, std::array<UINT, 2>> Hardware::buttonsDef = {
    {0, {MOUSEEVENTF_LEFTUP, MOUSEEVENTF_LEFTDOWN}},
    {1, {MOUSEEVENTF_RIGHTUP, MOUSEEVENTF_RIGHTDOWN}},
    {2, {MOUSEEVENTF_MIDDLEUP, MOUSEEVENTF_MIDDLEDOWN}}};

void Hardware::mousePosGetter(POINT *coords)
{
    GetCursorPos(coords);
    ScreenToClient(hWnd, coords);
}

Napi::Value Hardware::getLastCoords(const Napi::CallbackInfo &info)
{
    Napi::Object coords = Napi::Object::New(info.Env());
    if (saveMod)
    {
        coords["x"] = lastCoords.x;
        coords["y"] = lastCoords.y;
    }
    else
    {
        POINT curr;
        GetCursorPos(&curr);
        ScreenToClient(hWnd, &curr);
        coords["x"] = curr.x;
        coords["y"] = curr.y;
    }
    return coords;
};

void Hardware::mbToggler(uint8_t button, bool isButtonDown)
{
    INPUT ip;
    ip.type = INPUT_MOUSE;
    ip.mi.dx = 0;
    ip.mi.dy = 0;
    ip.mi.mouseData = 0;
    ip.mi.dwExtraInfo = 0;
    ip.mi.time = 0;
    ip.mi.dwFlags = buttonsDef.at(button)[(int)isButtonDown];
    SendInput(1, &ip, sizeof(INPUT));
}

void Hardware::mover(POINT coords, bool isAbsolute)
{
    INPUT ip;
    if (isAbsolute)
        ClientToScreen(hWnd, &coords);
    ip.type = INPUT_MOUSE;
    ip.mi.mouseData = 0;
    ip.mi.dwExtraInfo = 0;
    ip.mi.time = 0;
    ip.mi.dwFlags = MOUSEEVENTF_MOVE;
    if (saveMod)
    {
        POINT currCoords;
        GetCursorPos(&currCoords);
        ScreenToClient(hWnd, &currCoords);
        if (currCoords.x != lastCoords.x && currCoords.y != lastCoords.y)
        {
            ip.mi.dx = lastCoords.x - currCoords.x;
            ip.mi.dy = lastCoords.y - currCoords.y;
            SendInput(1, &ip, sizeof(INPUT));
        }
        if (isAbsolute)
        {
            lastCoords.x = coords.x;
            lastCoords.y = coords.y;
        }
        else
        {
            lastCoords.x = ip.mi.dx + coords.x;
            lastCoords.y = ip.mi.dy + coords.y;
        }
    }
    if (isAbsolute)
    {
        ip.mi.dx = ((coords.x + 1) << 16) / GetSystemMetrics(SM_CXSCREEN);
        ip.mi.dy = ((coords.y + 1) << 16) / GetSystemMetrics(SM_CYSCREEN);
        ip.mi.dwFlags |= MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_VIRTUALDESK;
    }
    else
    {
        ip.mi.dx = coords.x;
        ip.mi.dy = coords.y;
    }
    SendInput(1, &ip, sizeof(INPUT));
}

void Hardware::wheelScroller(int x)
{
    INPUT ip;
    ip.type = INPUT_MOUSE;
    ip.mi.dx = 0;
    ip.mi.dy = 0;
    ip.mi.mouseData = x;
    ip.mi.dwExtraInfo = 0;
    ip.mi.time = 0;
    ip.mi.dwFlags = MOUSEEVENTF_WHEEL;
    SendInput(1, &ip, sizeof(INPUT));
}

void Hardware::keyToggler(UINT key, bool isKeyDown)
{
    INPUT ip;
    DWORD dwFlags = KEYEVENTF_SCANCODE;
    if (!isKeyDown)
        dwFlags |= KEYEVENTF_KEYUP;
    if (std::find(std::begin(extendKeys), std::end(extendKeys), key) != std::end(extendKeys))
        dwFlags |= KEYEVENTF_EXTENDEDKEY;
    ip.ki.time = 0;
    ip.ki.wVk = 0;
    ip.ki.dwExtraInfo = 0;
    ip.type = INPUT_KEYBOARD;
    ip.ki.dwFlags = dwFlags;
    ip.ki.wScan = MapVirtualKeyA(key, MAPVK_VK_TO_VSC);
    SendInput(1, &ip, sizeof(INPUT));
}

void Hardware::charPrinter(int code)
{
    INPUT ip;
    ip.ki.time = 0;
    ip.ki.wVk = 0;
    ip.ki.dwExtraInfo = 0;
    ip.type = INPUT_KEYBOARD;
    ip.ki.dwFlags = KEYEVENTF_UNICODE;
    ip.ki.wScan = code;
    SendInput(1, &ip, sizeof(INPUT));
    ip.ki.dwFlags |= KEYEVENTF_KEYUP;
    SendInput(1, &ip, sizeof(INPUT));
}

Napi::FunctionReference Hardware::constructor;

Napi::Object Hardware::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);
    Napi::Function func = DefineClass(
        env, "Hardware", {
                             InstanceMethod("_getPos", &Hardware::getMousePos),
                             InstanceMethod("_toggleMb", &Hardware::toggleMb),
                             InstanceMethod("_move", &Hardware::move),
                             InstanceMethod("_scrollWheel", &Hardware::scrollWheel),
                             InstanceMethod("_toggleKey", &Hardware::toggleKey),
                             InstanceMethod("_printChar", &Hardware::printChar),
                             InstanceMethod("_isOpen", &Hardware::isOpen),
                             InstanceMethod("_isForeground", &Hardware::isForeground),
                             InstanceMethod("_setForeground", &Hardware::setForeground),
                             InstanceMethod("_capture", &Hardware::capture),
                             InstanceMethod("_getColor", &Hardware::getColor),
                             InstanceMethod("_kill", &Hardware::kill),
                             InstanceMethod("_close", &Hardware::close),
                             InstanceAccessor("_workwindow", &Hardware::getWorkwindow, &Hardware::setWorkwindow),
                             InstanceAccessor("_lastCoords", &Hardware::getLastCoords, NULL),
                             InstanceAccessor("_saveMod", &Hardware::getSaveMod, &Hardware::setSaveMod),
                             InstanceAccessor("_windowInfo", &Hardware::getWindowInfo, &Hardware::setWindowInfo),
                         });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("Hardware", func);
    return exports;
}
