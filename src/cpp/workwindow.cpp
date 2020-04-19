#include "workwindow.hpp"

BOOL CALLBACK EnumWindowsProc(HWND hWnd, LPARAM lParam)
{
    if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd) || GetWindowTextLengthA(hWnd) == 0)
        return TRUE;
    std::vector<HWND> &hWnds =
        *reinterpret_cast<std::vector<HWND> *>(lParam);
    hWnds.push_back(hWnd);
    return TRUE;
}

BOOL CALLBACK EnumChildProc(HWND hWnd, LPARAM lParam)
{
    if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd))
        return TRUE;
    std::vector<HWND> &chWnds =
        *reinterpret_cast<std::vector<HWND> *>(lParam);
    chWnds.push_back(hWnd);
    return TRUE;
}

Window Workwindow::windowGetter(HWND hWnd)
{
    Window window;
    window.handle = HandleToLong(hWnd);
    if (hWnd != NULL)
    {
        uint8_t titleLength = GetWindowTextLengthA(hWnd);
        if (titleLength > 0)
        {
            std::vector<wchar_t> title(titleLength + 1);
            GetWindowTextW(hWnd, &title[0], title.size());
            title.pop_back();
            window.title = title;
        }
        std::vector<wchar_t> className(256);
        GetClassNameW(hWnd, &className[0], className.size());
        className.resize(std::distance(className.begin(), std::search_n(className.begin(), className.end(), 2, 0)));
        className.shrink_to_fit();
        window.className = className;
    }
    return window;
}

Napi::Value getWindow(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() == 0)
    {
        std::vector<HWND> hWnds;
        EnumWindows(EnumWindowsProc, reinterpret_cast<LPARAM>(&hWnds));
        Napi::Array windows = Napi::Array::New(env);
        for (const HWND &hWnd : hWnds)
        {
            Window window = Workwindow::windowGetter(hWnd);
            Napi::Object windowObj = Napi::Object::New(env);
            windowObj["handle"] = window.handle;
            windowObj["title"] = Napi::Buffer<wchar_t>::Copy(env, window.title.data(), window.title.size());
            windowObj["className"] = Napi::Buffer<wchar_t>::Copy(env, window.className.data(), window.className.size());
            windows[windows.Length()] = windowObj;
        }
        return windows;
    }
    if (info.Length() != 2 || (!info[0].IsBuffer() && !info[0].IsNull()) || (!info[1].IsBuffer() && !info[1].IsNull()))
    {
        Napi::Error::New(env, "Expected 0 or 2 arguments: Buffer||NULL, Buffer||NULL")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    return Napi::Number::New(env, HandleToLong(FindWindowW(
                                      info[1].IsNull() ? NULL : LPCWSTR(std::u16string(Napi::Buffer<char16_t>(env, info[1]).Data()).data()),
                                      info[0].IsNull() ? NULL : LPCWSTR(std::u16string(Napi::Buffer<char16_t>(env, info[0]).Data()).data()))));
}

Napi::Value getWindowChild(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() == 1 && info[0].IsNumber())
    {
        std::vector<HWND> chWnds;
        EnumChildWindows((HWND)info[0].As<Napi::Number>().Int64Value(), EnumChildProc, reinterpret_cast<LPARAM>(&chWnds));
        Napi::Array children = Napi::Array::New(env);
        if (!chWnds.empty())
            for (const HWND &hWnd : chWnds)
            {
                Window window = Workwindow::windowGetter(hWnd);
                Napi::Object child = Napi::Object::New(env);
                child["handle"] = window.handle;
                child["title"] = Napi::Buffer<wchar_t>::Copy(env, window.title.data(), window.title.size());
                child["className"] = Napi::Buffer<wchar_t>::Copy(env, window.className.data(), window.className.size());
                children[children.Length()] = child;
            }
        return children;
    }
    if (info.Length() != 3 || !info[0].IsNumber() || (!info[1].IsBuffer() && !info[1].IsNull()) || (!info[2].IsBuffer() && !info[2].IsNull()))
    {
        Napi::Error::New(env, "Expected 1 or 3 arguments: Number, Buffer||NULL, Buffer||NULL")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }
    return Napi::Number::New(env, HandleToLong(FindWindowExW((HWND)info[0].As<Napi::Number>().Int64Value(), NULL,
                                                             info[1].IsNull() ? NULL : LPCWSTR(std::u16string(Napi::Buffer<char16_t>(env, info[1]).Data()).data()),
                                                             info[2].IsNull() ? NULL : LPCWSTR(std::u16string(Napi::Buffer<char16_t>(env, info[2]).Data()).data()))));
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
    TerminateProcess(OpenProcess(SYNCHRONIZE | PROCESS_TERMINATE, TRUE, pid), 0);
}

void Workwindow::close(const Napi::CallbackInfo &info)
{
    SendMessage(hWnd, WM_CLOSE, NULL, NULL);
}

void Workwindow::setWorkwindow(const Napi::CallbackInfo &info, const Napi::Value &value)
{
    if (!info[0].IsNumber())
    {
        Napi::Error::New(info.Env(), "Expected a Number")
            .ThrowAsJavaScriptException();
        return;
    }
    hWnd = (HWND)info[0].As<Napi::Number>().Int64Value();
};

Napi::Value Workwindow::getWorkwindow(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    Window window = windowGetter(hWnd);
    Napi::Object windowObj = Napi::Object::New(env);
    windowObj["handle"] = window.handle;
    windowObj["title"] = Napi::Buffer<wchar_t>::Copy(env, window.title.data(), window.title.size());
    windowObj["className"] = Napi::Buffer<wchar_t>::Copy(env, window.className.data(), window.className.size());
    return windowObj;
}

void Workwindow::setWindowInfo(const Napi::CallbackInfo &info, const Napi::Value &value)
{
    Napi::Env env = info.Env();
    if (hWnd != NULL)
    {
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
    else
        Napi::Error::New(env, "handle = 0")
            .ThrowAsJavaScriptException();
}

Napi::Value Workwindow::getWindowInfo(const Napi::CallbackInfo &info)
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