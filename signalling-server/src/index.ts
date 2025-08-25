import bodyParser from "body-parser";
import { Server } from "socket.io";

const io = new Server(8000, {
  cors: { origin: "*" },
});

const emailToSocketMap = new Map();
const socketToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("room:join", (data) => {
    const { roomCode, email } = data;
    console.log(`User with email ${email} joined room ${roomCode}`);

    emailToSocketMap.set(email, socket.id);
    socketToEmailMap.set(socket.id, email);

    io.to(roomCode).emit("user:joined", { email, id: socket.id });
    socket.join(roomCode);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});
