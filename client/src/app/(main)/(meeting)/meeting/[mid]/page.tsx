"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "sonner";
import { useSocket } from "@/providers/Socket";
import peerService from "@/services/peer";

const Meeting: React.FC = () => {
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const socket = useSocket();

  const sendStream = useCallback(() => {
    if (myStream && peerService.peer) {
      // Remove any existing tracks to avoid duplicates
      const senders = peerService.peer.getSenders();
      senders.forEach((sender) => {
        if (sender.track) {
          peerService.peer!.removeTrack(sender);
        }
      });

      // Add all tracks from the stream
      for (const track of myStream.getTracks()) {
        peerService.peer!.addTrack(track, myStream);
      }
      console.log("Stream sent");
    }
  }, [myStream]);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMyStream(stream);

        // If we already have a remote connection, send stream immediately
        if (remoteSocketId && !peerService.hasVideoTrack()) {
          setTimeout(() => sendStream(), 500);
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };
    init();
  }, []);

  const handleCall = useCallback(
    async (remoteSid: string) => {
      if (!remoteSid) return;

      const offer = await peerService.getOffer();
      socket.emit("user:call", { to: remoteSid, offer });
    },
    [socket]
  );

  const handleUserJoined = useCallback(({ socketId }: { socketId: string }) => {
    setRemoteSocketId(socketId);
  }, []);

  const handleGuestJoined = useCallback(
    ({ socketId }: { socketId: string }) => {
      setRemoteSocketId(socketId);
      handleCall(socketId);

      // Host sends their stream to the guest
      if (myStream && !peerService.hasVideoTrack()) {
        setTimeout(() => sendStream(), 1000); // Small delay for connection setup
      }
    },
    [handleCall, myStream, sendStream]
  );

  const handleIncomingCall = useCallback(
    async ({
      from,
      offer,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      const ans = await peerService.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });

      // Guest sends their stream back to host after answering
      if (myStream && !peerService.hasVideoTrack()) {
        setTimeout(() => sendStream(), 500);
      }
    },
    [socket, myStream, sendStream]
  );

  const handleCallAccepted = useCallback(
    async ({ ans }: { ans: RTCSessionDescriptionInit }) => {
      await peerService.setAnswer(ans);
    },
    []
  );

  const handleRemoteStream = useCallback((e: RTCTrackEvent) => {
    setRemoteStream(e.streams[0]);
  }, []);

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peerService.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const handlePeerNegotiationFinal = useCallback(
    async ({ ans }: { ans: RTCSessionDescriptionInit }) => {
      await peerService.setAnswer(ans);
    },
    []
  );

  const handlePeerNegotiation = useCallback(
    async ({
      from,
      offer,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      const ans = await peerService.getAnswer(offer);
      socket.emit("peer:nego:done", { ans, to: from });
    },
    [socket]
  );

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("guest:joined", handleGuestJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handlePeerNegotiation);
    socket.on("peer:nego:final", handlePeerNegotiationFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handlePeerNegotiation);
      socket.off("peer:nego:final", handlePeerNegotiationFinal);
      socket.off("guest:joined", handleGuestJoined);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handlePeerNegotiation,
    handlePeerNegotiationFinal,
    handleGuestJoined,
  ]);

  useEffect(() => {
    peerService.peer!.addEventListener(
      "negotiationneeded",
      handleNegotiationNeeded
    );

    return () => {
      peerService.peer!.removeEventListener(
        "negotiationneeded",
        handleNegotiationNeeded
      );
    };
  });

  useEffect(() => {
    peerService.peer!.addEventListener("track", handleRemoteStream);

    return () => {
      peerService.peer!.removeEventListener("track", handleRemoteStream);
    };
  });

  return (
    <main className="z-50 relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
      {/* Background ambience */}

      <h1 className="sr-only">Live Podcast Meeting</h1>

      {/* Video grid */}
      <section className="relative z-10 w-full max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local stream */}
          {myStream && (
            <article className="relative bg-glass-bg border border-glass-border rounded-2xl overflow-hidden shadow-glass animate-fade-in">
              <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-md bg-glass-bg border border-glass-border text-xs text-muted-foreground">
                You
              </div>
              <AspectRatio ratio={16 / 9}>
                <video
                  style={{ transform: "scaleX(-1)" }}
                  playsInline
                  muted
                  autoPlay
                  ref={(video) => {
                    if (video) {
                      video.srcObject = myStream;
                    }
                  }}
                  className="h-full w-full object-cover"
                />
              </AspectRatio>
            </article>
          )}

          {/* Remote placeholder */}
          {remoteStream && (
            <article className="relative bg-glass-bg border border-glass-border rounded-2xl overflow-hidden shadow-glass animate-fade-in">
              <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-md bg-glass-bg border border-glass-border text-xs text-muted-foreground">
                Guest
              </div>
              <AspectRatio ratio={16 / 9}>
                <video
                  style={{ transform: "scaleX(-1)" }}
                  playsInline
                  autoPlay
                  ref={(video) => {
                    if (video) {
                      video.srcObject = remoteStream;
                    }
                  }}
                  className="h-full w-full object-cover"
                />
              </AspectRatio>
            </article>
          )}
        </div>
      </section>
    </main>
  );
};

export default Meeting;
