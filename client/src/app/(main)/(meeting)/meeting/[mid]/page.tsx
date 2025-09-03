"use client";

import { useSocket } from "@/providers/Socket";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import PeerService from "@/services/peer";
import Meeting from "@/components/Meeting";

const MeetingLayout = () => {
  const { mid } = useParams();
  const socket = useSocket();
  const { data: session } = useSession();
  const [peerService, setPeerService] = useState<PeerService | null>(null);

  useEffect(() => {
    const peerSvc = new PeerService();
    setPeerService(peerSvc);
  }, []);

  useEffect(() => {
    if (!mid || !session?.user) return;
    socket.emit("room:join", { roomId: mid, email: session.user.email! });
  }, [mid, session, socket]);

  if (!mid) {
    return <div>Invalid Meeting ID</div>;
  }

  return (
    peerService && (
      <div className="min-h-screen flex w-full bg-gradient-to-br to-black/90 from-[#101210] text-white">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        <Meeting peerService={peerService} />
      </div>
    )
  );
};

export default MeetingLayout;
