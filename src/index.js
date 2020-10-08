const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  getUser,
  deleteUser,
  addUser,
  getUsersInRoom,
  removeUser,
} = require("./utils/user");

const port = process.env.PORT;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }
    io.to("300").emit("message", generateMessage(message));
    callback("Delivered!");
  });

  socket.on("sendLocation", (msg, callback) => {
    socket.broadcast.emit("locationMessage", generateLocationMessage(msg));
    callback();
  });

  socket.on("join", ({ username, room }, callback) => {
    const {error, user} = addUser({id: socket.id, username, room })

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Welcome!"));
    socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} has joined!`));
    callback()
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", generateMessage(`${user.username} has left!`));
    }

  });
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
