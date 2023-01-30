#include "helper.hpp"

std::string Helper::getKeyName(UINT vkCode) {
  for (std::map<std::string, UINT>::const_iterator it = keyboardButtons.begin(); it != keyboardButtons.end(); ++it) {
    if (it->second == vkCode) {
      return it->first;
    }
  }

  return "";
};

std::wstring Helper::bufferToWstring(const Napi::Value &value) {
  Napi::Buffer<wchar_t> buffer = value.As<Napi::Buffer<wchar_t>>();

  std::wstring wstr;

  for (size_t i = 0; i < buffer.ByteLength(); i += 2) {
    wstr.push_back(wchar_t(buffer.Get(i).As<Napi::Number>().Int32Value() | (buffer.Get(i + 1).As<Napi::Number>().Int32Value() << 8)));
  }

  return wstr;
}

void Helper::tsfCallback(Napi::Env env, Napi::Function jsCallback) {
  jsCallback.Call({});
}

BOOL CALLBACK Helper::EnumWindowsProc(HWND hWnd, LPARAM lParam) {
  if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd) || GetWindowTextLengthA(hWnd) == 0) {
    return TRUE;
  }

  WindowInfo *windowInfo = (WindowInfo *)lParam;

  if (!windowInfo->className.empty() && classNameGetter(hWnd).compare(windowInfo->className) != 0) {
    return TRUE;
  }

  if (!windowInfo->title.empty() && titleGetter(hWnd).compare(windowInfo->title) != 0) {
    return TRUE;
  }

  windowInfo->hWnd = hWnd;

  return FALSE;
}

BOOL CALLBACK Helper::EnumAllWindowsProc(HWND hWnd, LPARAM lParam) {
  if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd) || GetWindowTextLengthA(hWnd) == 0) {
    return TRUE;
  }

  (*reinterpret_cast<std::vector<HWND> *>(lParam)).push_back(hWnd);

  return TRUE;
}

BOOL CALLBACK Helper::EnumChildrenProc(HWND hWnd, LPARAM lParam) {
  if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd)) {
    return TRUE;
  }

  (*reinterpret_cast<std::vector<HWND> *>(lParam)).push_back(hWnd);

  return TRUE;
}

std::wstring Helper::classNameGetter(HWND hWnd) {
  std::wstring className;

  className.resize(256);

  GetClassNameW(hWnd, &className[0], className.size());

  className.resize(std::distance(className.begin(), std::search_n(className.begin(), className.end(), 2, 0)));

  className.shrink_to_fit();

  return className;
}

std::wstring Helper::titleGetter(HWND hWnd) {
  std::wstring title;

  title.resize(GetWindowTextLengthA(hWnd) + 1);

  GetWindowTextW(hWnd, &title[0], title.size());

  title.pop_back();

  return title;
}

Napi::Object Helper::windowGetter(const Napi::CallbackInfo &info, HWND hWnd) {
  Napi::Env env = info.Env();

  Napi::Object window = Napi::Object::New(env);

  window["handle"] = HandleToLong(hWnd);
  window["title"] = Napi::Buffer<wchar_t>::New(env, 0);
  window["className"] = Napi::Buffer<wchar_t>::New(env, 0);

  if (hWnd != NULL) {
    uint8_t titleLength = GetWindowTextLengthA(hWnd);

    if (titleLength > 0) {
      std::wstring title = titleGetter(hWnd);

      window["title"] = Napi::Buffer<wchar_t>::Copy(env, title.data(), title.size());
    }

    std::wstring className = classNameGetter(hWnd);

    window["className"] = Napi::Buffer<wchar_t>::Copy(env, className.data(), className.size());
  }

  return window;
}

UINT Helper::getKeyboardKeyCode(const Napi::Value &value) {
  return value.IsString() ? keyboardButtons.at(value.As<Napi::String>()) : value.As<Napi::Number>().Int32Value();
}

const std::map<std::string, std::array<UINT, 2>> Helper::mouseEvents = {
    {"left", {WM_LBUTTONUP, WM_LBUTTONDOWN}},
    {"right", {WM_RBUTTONUP, WM_RBUTTONDOWN}},
    {"middle", {WM_MBUTTONUP, WM_MBUTTONDOWN}},
    {"x1", {WM_XBUTTONUP, WM_XBUTTONDOWN}},
    {"x2", {WM_XBUTTONUP, WM_XBUTTONDOWN}}};

const std::map<std::string, UINT> Helper::mouseButtons = {{"left", VK_LBUTTON}, {"right", VK_RBUTTON}, {"middle", VK_MBUTTON}, {"x1", VK_XBUTTON1}, {"x2", VK_XBUTTON2}};

const std::map<std::string, UINT> Helper::keyboardButtons = {
    {"backspace", VK_BACK},
    {"tab", VK_TAB},
    {"enter", VK_RETURN},
    {"shift", VK_SHIFT},
    {"ctrl", VK_CONTROL},
    {"alt", VK_MENU},
    {"pause", VK_PAUSE},
    {"capsLock", VK_CAPITAL},
    {"escape", VK_ESCAPE},
    {"space", VK_SPACE},
    {"pageUp", VK_PRIOR},
    {"pageDown", VK_NEXT},
    {"end", VK_END},
    {"home", VK_HOME},
    {"left", VK_LEFT},
    {"up", VK_UP},
    {"right", VK_RIGHT},
    {"down", VK_DOWN},
    {"printScreen", VK_SNAPSHOT},
    {"insert", VK_INSERT},
    {"delete", VK_DELETE},
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
    {"j", 0x4a},
    {"k", 0x4b},
    {"l", 0x4c},
    {"m", 0x4d},
    {"n", 0x4e},
    {"o", 0x4f},
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
    {"z", 0x5a},
    {"lWin", VK_LWIN},
    {"rWin", VK_RWIN},
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
    {"num*", VK_MULTIPLY},
    {"num+", VK_ADD},
    {"num,", VK_SEPARATOR},
    {"num-", VK_SUBTRACT},
    {"num.", VK_DECIMAL},
    {"num/", VK_DIVIDE},
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
    {"numLock", VK_NUMLOCK},
    {"scrollLock", VK_SCROLL},
    {"lShift", VK_LSHIFT},
    {"rShift", VK_RSHIFT},
    {"lCtrl", VK_LCONTROL},
    {"rCtrl", VK_RCONTROL},
    {"lAlt", VK_LMENU},
    {"rAlt", VK_RMENU},
    {";", VK_OEM_1},
    {"=", VK_OEM_PLUS},
    {",", VK_OEM_COMMA},
    {"-", VK_OEM_MINUS},
    {".", VK_OEM_PERIOD},
    {"/", VK_OEM_2},
    {"`", VK_OEM_3},
    {"[", VK_OEM_4},
    {"\\", VK_OEM_5},
    {"]", VK_OEM_6},
    {"'", VK_OEM_7}};
