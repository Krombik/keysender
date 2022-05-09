{
    "targets": [
        {
            "target_name": "key_sender",
            "sources": [
                "src/addon/key_sender.cpp",
                "src/addon/keyboard.cpp",
                "src/addon/mouse.cpp",
                "src/addon/workwindow.cpp",
                "src/addon/hardware.cpp",
                "src/addon/virtual.cpp",
                "src/addon/hotkey.cpp",
                "src/addon/helper.cpp",
                "src/addon/utilities.cpp"
            ],
            'conditions': [
                ['OS=="mac"', {
                    'cflags+': ['-fvisibility=hidden'],
                    'xcode_settings': {
                        'GCC_SYMBOLS_PRIVATE_EXTERN': 'YES',  # -fvisibility=hidden
                    }
                }]
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
