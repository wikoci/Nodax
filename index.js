const express = require("express");
const port = 6000;
const app = express();

const Say = require("say").Say;

const say = new Say("darwin" || "win32" || "linux");

// Use default system voice and speed
say.speak("Comment allez vous les");

app.listen(port, () => {});
