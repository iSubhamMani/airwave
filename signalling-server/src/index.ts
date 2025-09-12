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
  });

  socket.on("room:join", async ({ roomId, email }) => {
    const meetingData = await meetingTable.get(roomId);
    if (!meetingData) {
      socket.emit("room:error", { message: "Podcast not found." });
      return;
    }

    const meetingDetails: MeetingDetails = JSON.parse(meetingData);

    if (
      meetingDetails.host === email &&
      meetingDetails.hostSid &&
      meetingDetails.hostSid === socket.id
    ) {
      return;
    }

    if (
      meetingDetails.host === email &&
      meetingDetails.hostSid &&
      meetingDetails.hostSid !== socket.id
    ) {
      meetingDetails.hostSid = socket.id;
      await meetingTable.set(roomId, JSON.stringify(meetingDetails));
      return;
    }

    // reconnect guest
    if (
      meetingDetails.guest &&
      meetingDetails.guest === email &&
      meetingDetails.guestSid?.trim() &&
      meetingDetails.guestSid !== socket.id
    ) {
      meetingDetails.guestSid = socket.id;
      await meetingTable.set(roomId, JSON.stringify(meetingDetails));
      socket.join(roomId);
      socket.emit("user:joined", {
        roomId,
        socketId: meetingDetails.hostSid,
      });
      io.to(meetingDetails.hostSid).emit("guest:joined", {
        socketId: socket.id,
      });
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
    io.to(meetingDetails.hostSid).emit("guest:joined", { socketId: socket.id });
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

  socket.on("end:call", async ({ to, roomId }) => {
    const meetingDetails = await meetingTable.get(roomId);
    if (!meetingDetails) return;

    const details: MeetingDetails = JSON.parse(meetingDetails);
    if (details.hostSid === to) {
      details.guest = "";
      details.guestSid = "";
      await meetingTable.set(roomId, JSON.stringify(details));
      io.to(details.hostSid).emit("peer:disconnected");
    } else {
      // delete
      if (details.guestSid && details.guestSid === to)
        io.to(details.guestSid).emit("call:ended");
      await meetingTable.del(roomId);
    }
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("Nego needed from", socket.id, "to", to);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("Nego done from", socket.id, "to", to);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("disconnect", async () => {
    console.log("Socket disconnected:", socket.id);
    // emit the other user in the room that the user has disconnected
    const rooms = await meetingTable.keys("*");
    for (const roomId of rooms) {
      const meetingData = await meetingTable.get(roomId);
      if (!meetingData) continue;

      const meetingDetails: MeetingDetails = JSON.parse(meetingData);
      let updated = false;
      let peerToNotify = "";
      if (meetingDetails.hostSid === socket.id) {
        if (meetingDetails.guestSid)
          io.to(meetingDetails.guestSid).emit("host:disconnected");
        await meetingTable.set(
          roomId,
          JSON.stringify({ ...meetingDetails, guestSid: "", guest: "" })
        );
        return;
      }
      if (meetingDetails.guestSid === socket.id) {
        meetingDetails.guestSid = "";
        peerToNotify = meetingDetails.hostSid;
        updated = true;
      }
      if (updated && peerToNotify) {
        await meetingTable.set(roomId, JSON.stringify(meetingDetails));
        io.to(peerToNotify).emit("peer:disconnected");
      }
    }
  });
});
