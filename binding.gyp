{
  "targets": [
    {
     "target_name": "key_sender",
      "sources": [ 
        "src/key_sender.cpp",
        "src/keyboard.cpp",
        "src/workwindow.cpp",
        "src/hardware.cpp"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    }
  ]
}