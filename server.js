const express = require("express");
const app = express();

app.use(express.static("updates"));

app.listen(3000, () => {
  console.log("OTA server running on http://localhost:3000");
});
