import { Redis } from "ioredis";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const io = new Server(8000, {
  cors: { origin: "*" },
});

const meetingTable = new Redis(process.env.REDIS_URL!);

interface MeetingDetails {
  host: string;
  guest?: string;
  hostSid: string;
  guestSid?: string;
}

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("room:create", async ({ email }) => {
    const roomId = Math.random().toString(36).substring(2, 8);

    const meetingDetails: MeetingDetails = {
      host: email,
      hostSid: socket.id,
    };

    await meetingTable.set(roomId, JSON.stringify(meetingDetails));
    socket.join(roomId);
    socket.emit("room:created", { roomId });
    console.log(`Room created: ${roomId} by ${email}`);
  });

  socket.on("room:join", async ({ roomId, email }) => {
    const meetingData = await meetingTable.get(roomId);
    if (!meetingData) {
      socket.emit("room:error", { message: "Podcast not found." });
      return;
    }

    const meetingDetails: MeetingDetails = JSON.parse(meetingData);

    if (meetingDetails.guest) {
      socket.emit("room:error", { message: "Room is full" });
      return;
    }
    if (meetingDetails.host === email) {
      return;
    }

    meetingDetails.guest = email;
    meetingDetails.guestSid = socket.id;

    await meetingTable.set(roomId, JSON.stringify(meetingDetails));
    socket.join(roomId);
    socket.emit("user:joined", {
      roomId,
      socketId: meetingDetails.hostSid,
    });
    socket
      .to(meetingDetails.hostSid)
      .emit("guest:joined", { socketId: socket.id });
    console.log(`User ${email} joined room: ${roomId}`);
  });

  socket.on("user:call", ({ to, offer }) => {
    console.log(`User ${socket.id} is calling ${to}`);
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    console.log(`User ${socket.id} is sending ans ${to}`);
    io.to(to).emit("call:accepted", { host: to, from: socket.id, ans });
  });

  socket.on("request:stream", ({ to }) => {
    console.log(`User ${socket.id} is requesting ${to} to send stream`);
    io.to(to).emit("send:stream", { from: socket.id });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("Nego needed from", socket.id, "to", to);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("Nego done from", socket.id, "to", to);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});
