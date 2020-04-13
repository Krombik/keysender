{
    "targets": [
        {
            "target_name": "key_sender",
            "sources": [
                "src/cpp/key_sender.cpp",
                "src/cpp/keyboard.cpp",
                "src/cpp/mouse.cpp",
                "src/cpp/workwindow.cpp",
                "src/cpp/hardware.cpp",
                "src/cpp/virtual.cpp",
                "src/cpp/hotkey.cpp"
            ],
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS'],
        }
    ]
}
