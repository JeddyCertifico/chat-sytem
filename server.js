var express = require("express");
var app = express();

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Expires", "0");
  res.setHeader("Pragma", "no-cache");
  next();
});

// Set up io
const http = require("http");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 8000;
const url = "https://chat-app-9ke7.onrender.com";

// var username = "";
const usernames = {};
var username = "";
const rooms = { Main: { users: {} } };

// app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use("/resources", express.static("resources"));
app.use("/views", express.static("views"));

app.get("/", (req, res) => {
  res.render("pages/welcome", { url: url });
});

app.get("/room", checkUserName, (req, res) => {
  res.render("pages/room", { rooms: rooms, name: username });
});

app.post("/welcome", (req, res) => {
  username = req.body.name;
  res.redirect("/room");
});

app.post("/room", (req, res) => {
  if (!req.body.room || rooms[req.body.room] != null) {
    return res.redirect("room");
  }
  rooms[req.body.room] = { users: {} };
  res.redirect(req.body.room);
  // Send message that new room was created
  io.emit("room-created", req.body.room);
});

app.get("/:room", checkUserName, (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect("room");
  }
  res.render("pages/chat", { roomName: req.params.room, url: url });
});

function checkUserName(req, res, next) {
  if (username) {
    next();
  } else {
    res.redirect("/");
  }
}

// io connection
io.on("connection", (socket) => {
  // enter room page
  socket.on("enter-room", (name) => {
    usernames[socket.id] = name;
    console.log(`${name} entered the room in ${socket.id}`);
  });

  // joining
  socket.on("join", (room) => {
    socket.join(room);
    rooms[room].users[socket.id] = username;
    console.log(`${username} joined the chat in ${room} with id ${socket.id}`);
    socket.broadcast.to(room).emit("join", username, () => {
      username = "";
      if (rooms[room].users[socket.id]) console.log(`${rooms[room].users[socket.id]} joined the chat in ${room}`);
    });
  });

  // sending message
  socket.on("send-message", (room, msg) => {
    socket.broadcast.to(room).emit("send-message", msg, socket.id, rooms[room].users[socket.id], () => {
      console.log(`${rooms[room].users[socket.id]} says: ${msg}`);
    });
  });

  // disconnecting
  socket.on("disconnect", () => {
    getUserRooms(socket).forEach((room) => {
      socket.broadcast.to(room).emit("leave", rooms[room].users[socket.id]);
      if (rooms[room].users[socket.id]) console.log(`${rooms[room].users[socket.id]} left the chat in ${room}}`);
      delete rooms[room].users[socket.id];
    });
  });
});

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name);
    return names;
  }, []);
}

server.listen(PORT);
console.log("Server is listening on port 8000");
