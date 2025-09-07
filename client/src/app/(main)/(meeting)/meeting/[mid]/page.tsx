"use client";

import { useSignallingSocket } from "@/providers/SignallingSocket";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import PeerService from "@/services/peer";
import Meeting from "@/components/Meeting";
import axios from "axios";

const MeetingPage = () => {
  const { mid } = useParams();
  const socket = useSignallingSocket();
  const { data: session } = useSession();
  const [peerService, setPeerService] = useState<PeerService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const peerSvc = new PeerService();
    setPeerService(peerSvc);
  }, []);

  useEffect(() => {
    if (!mid || !session?.user) return;
    // join room only if the room exists
    async function checkRoomExists() {
      try {
        const res = await axios.get("/api/podcastDetails?meetId=" + mid);
        if (res.data.success) {
          socket.emit("room:join", {
            roomId: mid,
            email: session!.user.email!,
          });
        }
      } catch {
        setError("Failed to join the podcast.");
      } finally {
        setLoading(false);
      }
    }
    checkRoomExists();
  }, [mid, session, socket]);

  if (!mid) {
    return <div>Invalid Meeting ID</div>;
  }

  if (loading && !error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-white font-medium">
        Loading...
      </div>
    );
  }

  if (!loading && error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-red-500 font-medium">
        {error}
      </div>
    );
  }

  return (
    peerService &&
    !error &&
    !loading &&
    mid && <Meeting meetId={mid as string} peerService={peerService} />
  );
};

export default MeetingPage;
