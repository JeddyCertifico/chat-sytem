var express = require("express");
var app = express();

// Set up io
const http = require("http");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 8000;
const url = "https://voting-app-grp-1.onrender.com";

var username = "";
var users = {};

// app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use("/resources", express.static("resources"));
app.use("/views", express.static("views"));

app.get("/", (req, res) => {
  res.render("pages/welcome", { url: url });
});

app.get("/chat", checkUserName, (req, res) => {
  res.render("pages/index", { url: url });
});

app.post("/welcome", (req, res) => {
  username = req.body.name;
  res.redirect("/chat");
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
    socket.broadcast.emit("send-message", msg, socket.id, users[socket.id], () => {
      console.log(`${users[socket.id]} says: ${msg}`);
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("leave", users[socket.id]);
    if (users[socket.id]) console.log(`${users[socket.id]} left the chat`);
    delete users[socket.id];
  });

  socket.broadcast.emit("join", username, () => {
    users[socket.id] = username;
    username = "";
    if (users[socket.id]) console.log(`${users[socket.id]} joined the chat`);
  });
});

server.listen(PORT);
console.log("Server is listening on port 8000");
