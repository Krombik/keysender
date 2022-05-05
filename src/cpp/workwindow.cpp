#include "workwindow.hpp"

#include "helper.hpp"

Napi::Value Workwindow::capture(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  RECT rect = {0, 0, 0, 0};

  int width, height;

  std::string format = "rgba";

  uint8_t threshold = 127;

  if (info[0].IsObject()) {
    Napi::Object part(env, info[0]);
    if ((rect.left = part.Get("x").As<Napi::Number>().Int32Value()) < 0) {
      Napi::Error::New(env, "x should be >= 0")
          .ThrowAsJavaScriptException();

      return env.Undefined();
    }

    if ((rect.top = part.Get("y").As<Napi::Number>().Int32Value()) < 0) {
      Napi::Error::New(env, "y should be >= 0")
          .ThrowAsJavaScriptException();

      return env.Undefined();
    }

    if ((width = part.Get("width").As<Napi::Number>().Int32Value()) <= 0) {
      Napi::Error::New(env, "width should be > 0")
          .ThrowAsJavaScriptException();
      return env.Undefined();
    }

    if ((height = part.Get("height").As<Napi::Number>().Int32Value()) <= 0) {
      Napi::Error::New(env, "height should be > 0")
          .ThrowAsJavaScriptException();
      return env.Undefined();
    }

    if (info[1].IsString()) {
      format = info[1].As<Napi::String>();
    }

    if (info[2].IsNumber()) {
      threshold = info[2].As<Napi::Number>().Int32Value();
    }
  } else {
    if (info[0].IsString()) {
      format = info[0].As<Napi::String>();
    }
    if (info[1].IsNumber()) {
      threshold = info[1].As<Napi::Number>().Int32Value();
    }
    if (hWnd != NULL) {
      GetClientRect(hWnd, &rect);

      width = rect.right - rect.left;

      height = rect.bottom - rect.top;
    } else {
      width = GetSystemMetrics(SM_CXVIRTUALSCREEN);

      height = GetSystemMetrics(SM_CYVIRTUALSCREEN);
    }
  }

  HDC context = GetDC(hWnd);

  MAKEBITMAPINFO bi(height, width);

  uint8_t *pixels;

  HBITMAP section = CreateDIBSection(context, &bi, DIB_RGB_COLORS, (void **)&pixels, 0, 0);

  if (pixels == nullptr) {
    return env.Undefined();
  }

  HDC memDC = CreateCompatibleDC(context);

  DeleteObject(SelectObject(memDC, section));

  BitBlt(memDC, 0, 0, width, height, context, rect.left, rect.top, SRCCOPY);

  DeleteDC(memDC);

  ReleaseDC(hWnd, context);

  Napi::Object img = Napi::Object::New(env);

  size_t size = height * width * 4;

  if (format == "rgba") {
    for (size_t i = 0; i < size; i += 4) {
      std::swap(pixels[i], pixels[i + 2]);

      pixels[i + 3] = 255;
    }
  } else if (format == "grey") {
    size_t j = 0;

    for (size_t i = 0; i < size; i += 4, j++) {
      pixels[j] = pixels[i] * 0.114 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.299;
    }

    memcpy(pixels, pixels, j);

    size = j;
  } else if (format == "monochrome") {
    size_t j = 0;

    for (size_t i = 0; i < size; i += 4, j++) {
      pixels[j] = pixels[i] * 0.114 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.299 < threshold ? 0 : 255;
    }

    memcpy(pixels, pixels, j);

    size = j;
  }

  img["width"] = width;

  img["height"] = height;

  Napi::Buffer<uint8_t> imgData = Napi::Buffer<uint8_t>::New(env, pixels, size);

  imgData.AddFinalizer([](Napi::Env env, HBITMAP section) { DeleteObject(section); },
                       section);

  img["data"] = imgData;

  return img;
}

Napi::Value Workwindow::getColor(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() != 2 || !info[0].IsNumber() || !info[1].IsNumber()) {
    Napi::Error::New(env, "Expected 2 arguments: Number, Number")
        .ThrowAsJavaScriptException();

    return env.Undefined();
  }

  int x, y;

  if ((x = info[0].As<Napi::Number>().Int32Value()) <= 0) {
    Napi::Error::New(info.Env(), "x should be > 0")
        .ThrowAsJavaScriptException();

    return env.Undefined();
  }

  if ((y = info[1].As<Napi::Number>().Int32Value()) <= 0) {
    Napi::Error::New(info.Env(), "y should be > 0")
        .ThrowAsJavaScriptException();

    return env.Undefined();
  }

  HDC context = GetDC(hWnd);

  unsigned int color = GetPixel(context, x, y);

  ReleaseDC(hWnd, context);

  return Napi::Number::New(env, color);
}

void Workwindow::kill(const Napi::CallbackInfo &info) {
  DWORD pid;

  GetWindowThreadProcessId(hWnd, &pid);

  HANDLE hThread = OpenProcess(SYNCHRONIZE | PROCESS_TERMINATE, TRUE, pid);

  TerminateProcess(hThread, 0);

  CloseHandle(hThread);
}

void Workwindow::close(const Napi::CallbackInfo &info) {
  SendMessage(hWnd, WM_CLOSE, NULL, NULL);
}

BOOL CALLBACK Workwindow::EnumWindowsProc(HWND hWnd, LPARAM lParam) {
  if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd) || GetWindowTextLengthA(hWnd) == 0) {
    return TRUE;
  }

  Workwindow *self = (Workwindow *)lParam;

  if (!self->className.empty() && Helper::classNameGetter(hWnd).compare(self->className) != 0) {
    return TRUE;
  }
  if (!self->title.empty() && Helper::titleGetter(hWnd).compare(self->title) != 0) {
    return TRUE;
  }

  self->hWnd = hWnd;

  return FALSE;
}

BOOL CALLBACK Workwindow::EnumChildProc(HWND hWnd, LPARAM lParam) {
  if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd)) {
    return TRUE;
  }

  Workwindow *self = (Workwindow *)lParam;

  if (!self->childClassName.empty() && Helper::classNameGetter(hWnd).compare(self->childClassName) != 0) {
    return TRUE;
  }

  if (!self->childTitle.empty() && Helper::titleGetter(hWnd).compare(self->childTitle) != 0) {
    return TRUE;
  }

  self->hWnd = hWnd;

  return FALSE;
}

void Workwindow::setWorkwindow(const Napi::CallbackInfo &info) {
  const size_t argsCount = info.Length();

  if (argsCount > 0) {
    Napi::Env env = info.Env();

    bool isError = false;

    if (argsCount > 1) {
      for (size_t i = 1; i < argsCount; i++) {
        if (isError |= !info[i].IsBuffer() && !info[i].IsNull()) {
          break;
        }
      }
    }

    if (isError || argsCount > 4 || (!info[0].IsBuffer() && !info[0].IsNull() && !info[0].IsNumber() && !info[0].IsUndefined()) || (info[0].IsNull() && info[1].IsNull())) {
      Napi::Error::New(info.Env(), "Expected 0-4 arguments: Buffer || Null || Number, Buffer || Null, Buffer || Null, Buffer || Null")
          .ThrowAsJavaScriptException();

      return;
    }

    if (info[0].IsNumber()) {
      hWnd = (HWND)info[0].As<Napi::Number>().Int64Value();
      if (info[1].IsBuffer()) {
        childClassName = Helper::bufferToWstring(info[1]);
      }

      if (info[2].IsBuffer()) {
        childTitle = Helper::bufferToWstring(info[2]);
      }
    } else {
      if (info[0].IsBuffer()) {
        title = Helper::bufferToWstring(info[0]);
      }

      if (info[1].IsBuffer()) {
        className = Helper::bufferToWstring(info[1]);
      }

      if (info[2].IsBuffer()) {
        childClassName = Helper::bufferToWstring(info[2]);
      }

      if (info[3].IsBuffer()) {
        childTitle = Helper::bufferToWstring(info[3]);
      }
    }
    if (hWnd == NULL) {
      EnumWindows(EnumWindowsProc, (LPARAM)this);
    }

    if (!childClassName.empty() || !childTitle.empty()) {
      EnumChildWindows(hWnd, EnumChildProc, (LPARAM)this);
    }
  }
};

Napi::Value Workwindow::refresh(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (className.empty() && title.empty()) {
    Napi::Error::New(env, "Refresh available only if title and/or className exist")
        .ThrowAsJavaScriptException();

    return env.Undefined();
  }

  hWnd = NULL;

  EnumWindows(EnumWindowsProc, (LPARAM)this);

  if (!childClassName.empty() || !childTitle.empty()) {
    EnumChildWindows(hWnd, EnumChildProc, (LPARAM)this);
  }

  return Napi::Boolean::New(env, hWnd != NULL);
}

Napi::Value Workwindow::getWorkwindow(const Napi::CallbackInfo &info) {
  return Helper::windowGetter(hWnd, info.Env());
}

void Workwindow::setWindowView(const Napi::CallbackInfo &info, const Napi::Value &value) {
  Napi::Env env = info.Env();

  if (hWnd == NULL) {
    Napi::Error::New(env, "handle = 0")
        .ThrowAsJavaScriptException();

    return;
  }

  uint16_t x, y, width, height;

  RECT rect;

  GetWindowRect(hWnd, &rect);

  Napi::Object windowView(env, info[0]);

  if (!windowView.Get("width").IsNumber()) {
    width = rect.right - rect.left;
  } else if ((width = windowView.Get("width").As<Napi::Number>().Int32Value()) < 0) {
    Napi::Error::New(env, "width should be > 0")
        .ThrowAsJavaScriptException();
    return;
  }

  if (!windowView.Get("height").IsNumber()) {
    height = rect.bottom - rect.top;
  } else if ((height = windowView.Get("height").As<Napi::Number>().Int32Value()) < 0) {
    Napi::Error::New(env, "height should be > 0")
        .ThrowAsJavaScriptException();
    return;
  }

  if (windowView.Get("x").IsNumber()) {
    if ((x = windowView.Get("x").As<Napi::Number>().Int32Value()) >= 0)
      rect.left = x;
    else {
      Napi::Error::New(env, "x should be >= 0")
          .ThrowAsJavaScriptException();
      return;
    }
  }

  if (windowView.Get("y").IsNumber()) {
    if ((y = windowView.Get("y").As<Napi::Number>().Int32Value()) >= 0)
      rect.top = y;
    else {
      Napi::Error::New(env, "y should be >= 0")
          .ThrowAsJavaScriptException();
      return;
    }
  }

  SetWindowPos(hWnd, NULL, rect.left, rect.top, width, height, NULL);
}

Napi::Value Workwindow::getWindowView(const Napi::CallbackInfo &info) {
  Napi::Object windowInfo = Napi::Object::New(info.Env());

  if (hWnd != NULL) {
    RECT rect;

    POINT point = {0, 0};

    GetClientRect(hWnd, &rect);

    ClientToScreen(hWnd, &point);

    windowInfo["x"] = point.x;
    windowInfo["y"] = point.y;
    windowInfo["width"] = rect.right;
    windowInfo["height"] = rect.bottom;
  }

  return windowInfo;
}

Napi::Value Workwindow::isForeground(const Napi::CallbackInfo &info) {
  return Napi::Boolean::New(info.Env(), hWnd == GetForegroundWindow());
}

Napi::Value Workwindow::isOpen(const Napi::CallbackInfo &info) {
  return Napi::Boolean::New(info.Env(), IsWindow(hWnd));
}

void Workwindow::setForeground(const Napi::CallbackInfo &info) {
  SetForegroundWindow(hWnd);
}