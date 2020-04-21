#include "workwindow.hpp"

std::wstring Workwindow::classNameGetter(HWND hWnd)
{
    std::wstring className;
    className.resize(256);
    GetClassNameW(hWnd, &className[0], className.size());
    className.resize(std::distance(className.begin(), std::search_n(className.begin(), className.end(), 2, 0)));
    className.shrink_to_fit();
    return className;
}

std::wstring Workwindow::titleGetter(HWND hWnd)
{
    std::wstring title;
    title.resize(GetWindowTextLengthA(hWnd) + 1);
    GetWindowTextW(hWnd, &title[0], title.size());
    title.pop_back();
    return title;
}

BOOL CALLBACK EnumAllWindowsProc(HWND hWnd, LPARAM lParam)
{
    if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd) || GetWindowTextLengthA(hWnd) == 0)
        return TRUE;
    (*reinterpret_cast<std::vector<HWND> *>(lParam)).push_back(hWnd);
    return TRUE;
}

BOOL CALLBACK EnumChildrenProc(HWND hWnd, LPARAM lParam)
{
    if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd))
        return TRUE;
    (*reinterpret_cast<std::vector<HWND> *>(lParam)).push_back(hWnd);
    return TRUE;
}

Napi::Object Workwindow::windowGetter(HWND hWnd, Napi::Env env)
{
    Napi::Object window = Napi::Object::New(env);
    window["handle"] = HandleToLong(hWnd);
    window["title"] = Napi::Buffer<wchar_t>::New(env, 0);
    window["className"] = Napi::Buffer<wchar_t>::New(env, 0);
    if (hWnd != NULL)
    {
        uint8_t titleLength = GetWindowTextLengthA(hWnd);
        if (titleLength > 0)
        {
            std::wstring title = titleGetter(hWnd);
            window["title"] = Napi::Buffer<wchar_t>::Copy(env, title.data(), title.size());
        }
        std::wstring className = classNameGetter(hWnd);
        window["className"] = Napi::Buffer<wchar_t>::Copy(env, className.data(), className.size());
    }
    return window;
}

Napi::Value getAllWindows(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    std::vector<HWND> hWnds;
    EnumWindows(EnumAllWindowsProc, reinterpret_cast<LPARAM>(&hWnds));
    Napi::Array windows = Napi::Array::New(env);
    for (const HWND &hWnd : hWnds)
        windows[windows.Length()] = Workwindow::windowGetter(hWnd, env);
    return windows;
}

std::wstring Workwindow::bufferToWstring(Napi::Value buffer)
{
    return std::wstring(buffer.As<Napi::Buffer<wchar_t>>().Data());
}

BOOL CALLBACK EnumWindowsProc(HWND hWnd, LPARAM lParam)
{
    if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd) || GetWindowTextLengthA(hWnd) == 0)
        return TRUE;
    WindowInfo *windowInfo = (WindowInfo *)lParam;
    if (!windowInfo->className.empty() && Workwindow::classNameGetter(hWnd).compare(windowInfo->className) != 0)
        return TRUE;
    if (!windowInfo->title.empty() && Workwindow::titleGetter(hWnd).compare(windowInfo->title) != 0)
        return TRUE;
    windowInfo->hWnd = hWnd;
    return FALSE;
}

Napi::Value getWindowChildren(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    std::wstring title, className;
    HWND hWnd = NULL;
    if (info.Length() < 1 || info.Length() > 2 || (!info[0].IsBuffer() && !info[0].IsNull() && !info[0].IsNumber()) || (!info[1].IsBuffer() && !info[1].IsNull() && !info[1].IsUndefined()) || (info[0].IsNull() && info[1].IsNull()))
    {
        Napi::Error::New(info.Env(), "Expected 1-2 arguments: Buffer || Null || Number, Buffer || Null")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    if (info[0].IsNumber())
        hWnd = (HWND)info[0].As<Napi::Number>().Int64Value();
    else
    {
        WindowInfo *windowInfo = new WindowInfo;
        if (info[0].IsBuffer())
            windowInfo->title = Workwindow::bufferToWstring(info[0]);
        if (info[1].IsBuffer())
            windowInfo->className = Workwindow::bufferToWstring(info[1]);
        EnumWindows(EnumWindowsProc, (LPARAM)windowInfo);
        hWnd = windowInfo->hWnd;
        delete windowInfo;
    }
    Napi::Array children = Napi::Array::New(env);
    if (hWnd != NULL)
    {
        std::vector<HWND> hWnds;
        EnumChildWindows(hWnd, EnumChildrenProc, reinterpret_cast<LPARAM>(&hWnds));
        if (!hWnds.empty())
            for (const HWND &hWnd : hWnds)
                children[children.Length()] = Workwindow::windowGetter(hWnd, env);
    }
    return children;
}

Napi::Value getScreenSize(const Napi::CallbackInfo &info)
{
    Napi::Object screenSize = Napi::Object::New(info.Env());
    screenSize["width"] = GetSystemMetrics(SM_CXVIRTUALSCREEN);
    screenSize["height"] = GetSystemMetrics(SM_CYVIRTUALSCREEN);
    return screenSize;
}

Napi::Value Workwindow::capture(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    RECT rect;
    int16_t width, height;
    std::string format = "rgba";
    uint8_t threshold = 127;
    if (info[0].IsObject())
    {
        Napi::Object part(env, info[0]);
        if ((rect.left = part.Get("x").As<Napi::Number>().Int32Value()) < 0)
        {
            Napi::Error::New(env, "x should be >= 0")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        if ((rect.top = part.Get("y").As<Napi::Number>().Int32Value()) < 0)
        {
            Napi::Error::New(env, "y should be >= 0")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        if ((width = part.Get("width").As<Napi::Number>().Int32Value()) <= 0)
        {
            Napi::Error::New(env, "width should be > 0")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        if ((height = part.Get("height").As<Napi::Number>().Int32Value()) <= 0)
        {
            Napi::Error::New(env, "height should be > 0")
                .ThrowAsJavaScriptException();
            return env.Undefined();
        }
        if (info[1].IsString())
            format = info[1].As<Napi::String>();
        if (info[2].IsNumber())
            threshold = info[2].As<Napi::Number>().Int32Value();
    }
    else
    {
        if (info[0].IsString())
            format = info[0].As<Napi::String>();
        if (info[1].IsNumber())
            threshold = info[1].As<Napi::Number>().Int32Value();
        if (hWnd != NULL)
        {
            GetClientRect(hWnd, &rect);
            width = rect.right - rect.left;
            height = rect.bottom - rect.top;
        }
        else
        {
            rect.left = 0;
            rect.top = 0;
            width = GetSystemMetrics(SM_CXVIRTUALSCREEN);
            height = GetSystemMetrics(SM_CYVIRTUALSCREEN);
        }
    }
    const uint32_t size = width * height * 4;
    HDC context = GetDC(hWnd);
    BITMAPINFO bi;
    bi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
    bi.bmiHeader.biWidth = width;
    bi.bmiHeader.biHeight = -height;
    bi.bmiHeader.biPlanes = 1;
    bi.bmiHeader.biBitCount = 32;
    bi.bmiHeader.biCompression = BI_RGB;
    bi.bmiHeader.biSizeImage = 0;
    bi.bmiHeader.biXPelsPerMeter = 0;
    bi.bmiHeader.biYPelsPerMeter = 0;
    bi.bmiHeader.biClrUsed = 0;
    bi.bmiHeader.biClrImportant = 0;
    uint8_t *pixels;
    HDC memDC = CreateCompatibleDC(context);
    HBITMAP section = CreateDIBSection(context, &bi, DIB_RGB_COLORS, (void **)&pixels, 0, 0);
    DeleteObject(SelectObject(memDC, section));
    BitBlt(memDC, 0, 0, width, height, context, rect.left, rect.top, SRCCOPY);
    DeleteDC(memDC);
    Napi::Value data;
    if (format == "grey")
    {
        std::vector<uint8_t> greyscale;
        for (size_t i = 0; i < size; i += 4)
            greyscale.push_back(pixels[i] * 0.114 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.299);
        data = Napi::Buffer<uint8_t>::Copy(env, greyscale.data(), greyscale.size());
    }
    else if (format == "rgba")
    {
        for (size_t i = 0; i < size; i += 4)
        {
            std::swap(pixels[i], pixels[i + 2]);
            if (pixels[i + 3] != 255)
                pixels[i + 3] = 255;
        }
        data = Napi::Buffer<uint8_t>::Copy(env, pixels, size);
    }
    else if (format == "bgra")
    {
        for (size_t i = 0; i < size; i += 4)
            if (pixels[i + 3] != 255)
                pixels[i + 3] = 255;
        data = Napi::Buffer<uint8_t>::Copy(env, pixels, size);
    }
    else if (format == "monochrome")
    {
        std::vector<uint8_t> monochrome;
        for (size_t i = 0; i < size; i += 4)
            monochrome.push_back(pixels[i] * 0.114 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.299 < threshold ? 0 : 255);
        data = Napi::Buffer<uint8_t>::Copy(env, monochrome.data(), monochrome.size());
    }
    else
    {
        Napi::Error::New(env, "Wrong color format")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    Napi::Object returnValue = Napi::Object::New(env);
    returnValue["data"] = data;
    returnValue["width"] = width;
    returnValue["height"] = height;
    DeleteObject(section);
    return returnValue;
}

Napi::Value Workwindow::getColor(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 2 || !info[0].IsNumber() || !info[1].IsNumber())
    {
        Napi::Error::New(env, "Expected 2 arguments: Number, Number")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    int x, y;
    if ((x = info[0].As<Napi::Number>().Int32Value()) <= 0)
    {
        Napi::Error::New(info.Env(), "x should be > 0")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    if ((y = info[1].As<Napi::Number>().Int32Value()) <= 0)
    {
        Napi::Error::New(info.Env(), "y should be > 0")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    return Napi::Number::New(env, GetPixel(GetDC(hWnd), x, y));
}

void Workwindow::kill(const Napi::CallbackInfo &info)
{
    DWORD pid;
    GetWindowThreadProcessId(hWnd, &pid);
    HANDLE hThread = OpenProcess(SYNCHRONIZE | PROCESS_TERMINATE, TRUE, pid);
    TerminateProcess(hThread, 0);
    CloseHandle(hThread);
}

void Workwindow::close(const Napi::CallbackInfo &info)
{
    SendMessage(hWnd, WM_CLOSE, NULL, NULL);
}

BOOL CALLBACK Workwindow::EnumWindowsProc(HWND hWnd, LPARAM lParam)
{
    if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd) || GetWindowTextLengthA(hWnd) == 0)
        return TRUE;
    Workwindow *self = (Workwindow *)lParam;
    if (!self->className.empty() && classNameGetter(hWnd).compare(self->className) != 0)
        return TRUE;
    if (!self->title.empty() && titleGetter(hWnd).compare(self->title) != 0)
        return TRUE;
    self->hWnd = hWnd;
    return FALSE;
}

BOOL CALLBACK Workwindow::EnumChildProc(HWND hWnd, LPARAM lParam)
{
    if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd))
        return TRUE;
    Workwindow *self = (Workwindow *)lParam;
    if (!self->childClassName.empty() && classNameGetter(hWnd).compare(self->childClassName) != 0)
        return TRUE;
    if (!self->childTitle.empty() && titleGetter(hWnd).compare(self->childTitle) != 0)
        return TRUE;
    self->hWnd = hWnd;
    return FALSE;
}

void Workwindow::setWorkwindow(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    bool isError = false;
    const size_t argsCount = info.Length();
    if (argsCount > 1)
        for (size_t i = 1; i < argsCount; i++)
            if (isError |= !info[i].IsBuffer() && !info[i].IsNull())
                break;
    if (isError || argsCount > 4 || (!info[0].IsBuffer() && !info[0].IsNull() && !info[0].IsNumber() && !info[0].IsUndefined()) || (info[0].IsNull() && info[1].IsNull()))
    {
        Napi::Error::New(info.Env(), "Expected 0-4 arguments: Buffer || Null || Number, Buffer || Null, Buffer || Null, Buffer || Null")
            .ThrowAsJavaScriptException();
        return;
    }
    if (info[0].IsNumber())
    {
        hWnd = (HWND)info[0].As<Napi::Number>().Int64Value();
        if (info[1].IsBuffer())
            childClassName = bufferToWstring(info[1]);
        if (info[2].IsBuffer())
            childTitle = bufferToWstring(info[2]);
    }
    else
    {
        if (info[0].IsBuffer())
            title = bufferToWstring(info[0]);
        if (info[1].IsBuffer())
            className = bufferToWstring(info[1]);
        if (info[2].IsBuffer())
            childClassName = bufferToWstring(info[2]);
        if (info[3].IsBuffer())
            childTitle = bufferToWstring(info[3]);
    }
    if (hWnd == NULL)
        EnumWindows(EnumWindowsProc, (LPARAM)this);
    if (!childClassName.empty() || !childTitle.empty())
        EnumChildWindows(hWnd, EnumChildProc, (LPARAM)this);
};

Napi::Value Workwindow::refresh(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (className.empty() && title.empty())
    {
        Napi::Error::New(env, "Refresh available only if title and/or className exist")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    hWnd = NULL;
    EnumWindows(EnumWindowsProc, (LPARAM)this);
    if (!childClassName.empty() || !childTitle.empty())
        EnumChildWindows(hWnd, EnumChildProc, (LPARAM)this);
    return Napi::Boolean::New(env, hWnd != NULL);
}

Napi::Value Workwindow::getWorkwindow(const Napi::CallbackInfo &info)
{
    return windowGetter(hWnd, info.Env());
}

void Workwindow::setWindowView(const Napi::CallbackInfo &info, const Napi::Value &value)
{
    Napi::Env env = info.Env();
    if (hWnd == NULL)
    {
        Napi::Error::New(env, "handle = 0")
            .ThrowAsJavaScriptException();
        return;
    }
    uint16_t x, y, width, height;
    RECT rect;
    GetWindowRect(hWnd, &rect);
    Napi::Object windowInfo(env, info[0]);
    if (!windowInfo.Get("width").IsNumber())
        width = rect.right - rect.left;
    else if ((width = windowInfo.Get("width").As<Napi::Number>().Int32Value()) < 0)
    {
        Napi::Error::New(env, "width should be > 0")
            .ThrowAsJavaScriptException();
        return;
    }
    if (!windowInfo.Get("height").IsNumber())
        height = rect.bottom - rect.top;
    else if ((height = windowInfo.Get("height").As<Napi::Number>().Int32Value()) < 0)
    {
        Napi::Error::New(env, "height should be > 0")
            .ThrowAsJavaScriptException();
        return;
    }
    if (windowInfo.Get("x").IsNumber())
        if ((x = windowInfo.Get("x").As<Napi::Number>().Int32Value()) >= 0)
            rect.left = x;
        else
        {
            Napi::Error::New(env, "x should be >= 0")
                .ThrowAsJavaScriptException();
            return;
        }
    if (windowInfo.Get("y").IsNumber())
        if ((y = windowInfo.Get("y").As<Napi::Number>().Int32Value()) >= 0)
            rect.top = y;
        else
        {
            Napi::Error::New(env, "y should be >= 0")
                .ThrowAsJavaScriptException();
            return;
        }
    SetWindowPos(hWnd, NULL, rect.left, rect.top, width, height, NULL);
}

Napi::Value Workwindow::getWindowView(const Napi::CallbackInfo &info)
{
    Napi::Object windowInfo = Napi::Object::New(info.Env());
    if (hWnd != NULL)
    {
        RECT rect;
        GetClientRect(hWnd, &rect);
        windowInfo["x"] = rect.left;
        windowInfo["y"] = rect.top;
        windowInfo["width"] = rect.right - rect.left;
        windowInfo["height"] = rect.bottom - rect.top;
    }
    return windowInfo;
}

Napi::Value Workwindow::isForeground(const Napi::CallbackInfo &info)
{
    return Napi::Boolean::New(info.Env(), hWnd == GetForegroundWindow());
}

Napi::Value Workwindow::isOpen(const Napi::CallbackInfo &info)
{
    return Napi::Boolean::New(info.Env(), IsWindow(hWnd));
}

void Workwindow::setForeground(const Napi::CallbackInfo &info)
{
    SetForegroundWindow(hWnd);
}