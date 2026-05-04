const native = require('../native/bindings'); // C++ addon

module.exports = {
  hardware: async () => {
    console.log("Running full hardware diagnostic...");
    console.log(native.hardware_test());
  },
  software: async () => {
    console.log("Running software integration & security test...");
    console.log(native.software_test());
  }
};
