"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "sonner";
import { useSocket } from "@/providers/Socket";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from "lucide-react";
import PeerService from "@/services/peer";
import { useRouter } from "next/navigation";

const Meeting = ({ peerService }: { peerService: PeerService }) => {
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [meetingId, setMeetingId] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();

  const socket = useSocket();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Set video sources when streams change
  useEffect(() => {
    if (localVideoRef.current && myStream) {
      localVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

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
    }
  }, [myStream, peerService]);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMyStream(stream);
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
    [peerService, socket]
  );

  const handleUserJoined = useCallback(({ socketId }: { socketId: string }) => {
    setRemoteSocketId(socketId);
  }, []);

  const handleGuestJoined = useCallback(
    ({ socketId }: { socketId: string }) => {
      setRemoteSocketId(socketId);
      handleCall(socketId);
    },
    [handleCall]
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
    },
    [socket, peerService]
  );

  const handleCallAccepted = useCallback(
    async ({ ans }: { ans: RTCSessionDescriptionInit }) => {
      await peerService.setAnswer(ans);
      sendStream();
      const pc = peerService.peer;
      if (pc) {
        const onStable = () => {
          if (pc.signalingState === "stable") {
            socket.emit("request:stream", { to: remoteSocketId });

            // cleanup after firing once
            pc.removeEventListener("signalingstatechange", onStable);
          }
        };

        pc.addEventListener("signalingstatechange", onStable);
      }
    },
    [peerService, sendStream, socket, remoteSocketId]
  );

  const handleSendStream = useCallback(() => {
    if (myStream) sendStream();
  }, [myStream, sendStream]);

  const handleRemoteStream = useCallback((e: RTCTrackEvent) => {
    setRemoteStream(e.streams[0]);
  }, []);

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peerService.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket, peerService]);

  const handlePeerNegotiationFinal = useCallback(
    async ({ ans }: { ans: RTCSessionDescriptionInit }) => {
      await peerService.setAnswer(ans);
    },
    [peerService]
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
    [socket, peerService]
  );

  // Toggle microphone
  const toggleMic = () => {
    if (!myStream || !peerService.peer) return;

    const audioTrack = myStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);

      // Find the sender for this audio track and replace it
      const sender = peerService.peer
        .getSenders()
        .find((s) => s.track?.kind === "audio");
      if (sender) {
        sender.replaceTrack(audioTrack);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (!myStream || !peerService.peer) return;

    const videoTrack = myStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);

      // Find the sender for this video track and replace it
      const sender = peerService.peer
        .getSenders()
        .find((s) => s.track?.kind === "video");
      if (sender) {
        sender.replaceTrack(videoTrack);
      }
    }
  };

  // Share meeting ID
  const shareMeeting = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Join my podcast",
          text: "Join my live podcast session",
          url: window.location.href,
        })
        .catch((err) => {
          console.log("Error sharing:", err);
        });
    } else {
      copyToClipboard();
    }
  };

  // Copy meeting ID to clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(meetingId || window.location.href)
      .then(() => {
        setIsCopied(true);
        toast.success("Meeting link copied to clipboard");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy meeting link");
      });
  };

  // End the call
  const endCall = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    if (peerService.peer) {
      peerService.cleanPeer();
    }
    socket.emit("call:ended", { to: remoteSocketId });
    setRemoteStream(null);
    setRemoteSocketId(null);
    toast.info("Call ended");
    router.push("/dashboard");
  };

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("guest:joined", handleGuestJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("send:stream", handleSendStream);
    socket.on("peer:nego:needed", handlePeerNegotiation);
    socket.on("peer:nego:final", handlePeerNegotiationFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("send:stream", handleSendStream);
      socket.off("peer:nego:needed", handlePeerNegotiation);
      socket.off("peer:nego:final", handlePeerNegotiationFinal);
      socket.off("guest:joined", handleGuestJoined);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleSendStream,
    handlePeerNegotiation,
    handlePeerNegotiationFinal,
    handleGuestJoined,
  ]);

  useEffect(() => {
    if (peerService.peer) {
      peerService.peer.addEventListener(
        "negotiationneeded",
        handleNegotiationNeeded
      );
      peerService.peer.addEventListener("track", handleRemoteStream);
    }
    return () => {
      if (peerService.peer) {
        peerService.peer.removeEventListener(
          "negotiationneeded",
          handleNegotiationNeeded
        );
        peerService.peer.removeEventListener("track", handleRemoteStream);
      }
    };
  }, [handleNegotiationNeeded, handleRemoteStream, peerService]);

  return (
    <main className="w-full z-50 relative min-h-screen flex flex-col">
      {/* Video grid */}
      <section className="flex-1 p-4 md:p-6">
        <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-2 sm:gap-4 md:gap-6 max-w-7xl mx-auto h-full">
          {/* Local stream */}
          <article className="h-max relative bg-neutral-950 rounded-xl overflow-hidden shadow-lg group">
            <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-md bg-green-200 text-green-900 text-sm">
              You
            </div>

            <AspectRatio ratio={16 / 9}>
              {/* Always render the video element, just control visibility */}
              <video
                ref={localVideoRef}
                style={{
                  transform: "scaleX(-1)",
                  display: isVideoOn ? "block" : "none", // Control visibility with CSS
                }}
                playsInline
                muted
                autoPlay
                className="h-full w-full object-cover"
              />
              {/* Show placeholder when video is off */}
              {!isVideoOn && (
                <div className="h-full w-full bg-neutral-950 flex items-center justify-center absolute inset-0">
                  <div className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-green-700">
                      {socket?.id?.substring(0, 1).toUpperCase() || "Y"}
                    </span>
                  </div>
                </div>
              )}
            </AspectRatio>

            {/* Audio status indicator */}
            {!isMicOn && (
              <div className="absolute top-3 right-3 z-10 p-2 rounded-full bg-red-200">
                <MicOff className="h-4 w-4 text-red-700" />
              </div>
            )}
          </article>

          {/* Remote stream */}
          {remoteSocketId ? (
            <article className="relative h-max bg-neutral-950 rounded-xl overflow-hidden shadow-lg group">
              <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-md bg-green-200 text-green-900 text-sm">
                Guest
              </div>

              {remoteStream ? (
                <AspectRatio ratio={16 / 9}>
                  <video
                    ref={remoteVideoRef}
                    style={{ transform: "scaleX(-1)" }}
                    playsInline
                    autoPlay
                    className="h-full w-full object-cover"
                  />
                </AspectRatio>
              ) : (
                <AspectRatio ratio={16 / 9}>
                  <div className="h-full bg-neutral-950 w-full flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center mb-3">
                        <span className="text-2xl font-semibold text-green-700">
                          G
                        </span>
                      </div>
                      <p className="text-white">Connecting...</p>
                    </div>
                  </div>
                </AspectRatio>
              )}
            </article>
          ) : (
            <article className="relative bg-neutral-950 rounded-xl overflow-hidden shadow-lg">
              <AspectRatio ratio={16 / 9}>
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center p-6">
                    <Users className="h-12 w-12 text-white mx-auto mb-4" />
                    <h3 className="text-green-200 font-medium mb-2">
                      Waiting for guest to join
                    </h3>
                    <p className="text-white text-sm">
                      Share the meeting link to invite someone
                    </p>
                  </div>
                </div>
              </AspectRatio>
            </article>
          )}
        </div>
      </section>

      {/* Controls footer */}
      <footer className="p-4">
        <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto">
          <Button
            onClick={toggleMic}
            size="lg"
            className={`cursor-pointer rounded-full h-12 w-12 p-0 ${isMicOn ? "bg-white hover:bg-green-100" : "bg-red-500 hover:bg-red-600"}`}
          >
            {isMicOn ? (
              <Mic className="size-5 text-green-700" />
            ) : (
              <MicOff className="size-5" />
            )}
          </Button>

          <Button
            onClick={toggleVideo}
            size="lg"
            className={`cursor-pointer rounded-full h-12 w-12 p-0 ${isVideoOn ? "bg-white hover:bg-green-100" : "bg-red-500 hover:bg-red-600"}`}
          >
            {isVideoOn ? (
              <Video className="size-5 text-green-700" />
            ) : (
              <VideoOff className="size-5" />
            )}
          </Button>

          <Button
            onClick={endCall}
            size="lg"
            className="cursor-pointer rounded-full h-14 w-14 p-0 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="size-5" />
          </Button>
        </div>
      </footer>
    </main>
  );
};

export default Meeting;
