const express = require("express");
const app = express();
const http = require("http"); // <-- Added 'const'
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello world");
});

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});
