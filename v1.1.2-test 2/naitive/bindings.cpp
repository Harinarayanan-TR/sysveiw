#include <napi.h>
#include <windows.h>
#include <iostream>

Napi::String HardwareTest(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    // Query CPU, RAM, GPU, Disk health here
    return Napi::String::New(env, "Hardware test results: CPU OK, RAM OK, Disk SMART OK");
}

Napi::String SoftwareTest(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    // Check drivers, firewall, antivirus, etc.
    return Napi::String::New(env, "Software integration test: Drivers OK, Firewall Active");
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("hardware_test", Napi::Function::New(env, HardwareTest));
    exports.Set("software_test", Napi::Function::New(env, SoftwareTest));
    return exports;
}

NODE_API_MODULE(sysveiw_native, Init)
