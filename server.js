var express = require("express");
var app = express();

// Set up io
const http = require("http");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 8000;
const url = "https://voting-app-grp-1.onrender.com";

var username = "";

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use("/resources", express.static("resources"));
app.use("/views", express.static("views"));

app.get("/", (req, res) => {
  res.render("pages/index", { username: username, url: url });
});

app.get("/chat", checkUserName, (req, res) => {
  res.render("pages/index", { username: username, url: url });
});

app.post("/chat", (req, res) => {
  if (req.body.submit) {
    username = req.body.name;
    res.redirect("/chat");
  }
});

function checkUserName(req, res, next) {
  if (username) {
    next();
  } else {
    res.redirect("/");
  }
}

// io
io.on("connection", (socket) => {
  socket.on("send-message", (msg) => {
    socket.broadcast.emit("send-message", msg, socket.id);
    // console.log(`Socket ${socket.id} says: ${msg}`);
  });

  socket.on("disconnect", () => {
    // console.log(`Socket ${socket.id} disconnected.`);
  });

  socket.broadcast.emit("join", socket.id, () => {
    console.log(`${socket.id} joined the chat`);
  });
});

server.listen(PORT);
console.log("Server is listening on port 8000");
