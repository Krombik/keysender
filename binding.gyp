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
                "src/addon/disableInput.cpp",
                "src/addon/hook.cpp",
                "src/addon/helper.cpp",
                "src/addon/utilities.cpp"
            ],
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS'],
            'cflags!': ['-fno-exceptions'],
            'cflags_cc!': ['-fno-exceptions'],
            'conditions': [
                ["OS=='win'", {
                    "defines": [
                        "_HAS_EXCEPTIONS=1"
                    ],
                    "msvs_settings": {
                        "VCCLCompilerTool": {
                            "ExceptionHandling": 1
                        },
                    },
                }],
                ["OS=='mac'", {
                    'xcode_settings': {
                        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
                        'CLANG_CXX_LIBRARY': 'libc++',
                        'MACOSX_DEPLOYMENT_TARGET': '10.7',
                    },
                }],
            ],
        }
    ]
}
