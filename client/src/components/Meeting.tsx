"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "sonner";
import { useSignallingSocket } from "@/providers/SignallingSocket";
import { useStreamSocket } from "@/providers/StreamSocket";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  Copy,
} from "lucide-react";
import PeerService from "@/services/peer";
import { useRouter } from "next/navigation";
import StreamMeeting from "./StreamMeeting";
import { errorStyle, successStyle } from "./Toast";

const Meeting = ({
  peerService,
  meetId,
}: {
  peerService: PeerService;
  meetId: string;
}) => {
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [, setIsCopied] = useState(false);
  const [hostSid, setHostSid] = useState<string | null>(null);
  const router = useRouter();

  const signallingSocket = useSignallingSocket();
  const streamSocket = useStreamSocket();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

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
      signallingSocket.emit("user:call", { to: remoteSid, offer });
    },
    [peerService, signallingSocket]
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
      setHostSid(from);
      signallingSocket.emit("call:accepted", { to: from, ans });
    },
    [signallingSocket, peerService]
  );

  const handleCallAccepted = useCallback(
    async ({ ans, host }: { ans: RTCSessionDescriptionInit; host: string }) => {
      setHostSid(host);
      await peerService.setAnswer(ans);
      sendStream();
      const pc = peerService.peer;
      if (pc) {
        const onStable = () => {
          if (pc.signalingState === "stable") {
            signallingSocket.emit("request:stream", { to: remoteSocketId });

            // cleanup after firing once
            pc.removeEventListener("signalingstatechange", onStable);
          }
        };

        pc.addEventListener("signalingstatechange", onStable);
      }
    },
    [peerService, sendStream, signallingSocket, remoteSocketId]
  );

  const handleSendStream = useCallback(() => {
    if (myStream) sendStream();
  }, [myStream, sendStream]);

  const handleRemoteStream = useCallback((e: RTCTrackEvent) => {
    setRemoteStream(e.streams[0]);
  }, []);

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peerService.getOffer();
    signallingSocket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, signallingSocket, peerService]);

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
      signallingSocket.emit("peer:nego:done", { ans, to: from });
    },
    [signallingSocket, peerService]
  );

  // Function to create and return the combined video and audio stream
  const createCombinedStream = useCallback(() => {
    if (!localVideoRef.current || !remoteVideoRef.current || !myStream) {
      toast.error("Both streams are required to start streaming!", {
        style: errorStyle,
      });
      return null;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const localVideo = localVideoRef.current;
    const remoteVideo = remoteVideoRef.current;

    // Set canvas dimensions based on video sizes
    const width = localVideo.videoWidth + remoteVideo.videoWidth;
    const height = Math.max(localVideo.videoHeight, remoteVideo.videoHeight);
    canvas.width = width;
    canvas.height = height;

    const drawLoop = () => {
      // Only draw if both video elements are available and streams are active
      if (
        ctx &&
        localVideoRef.current &&
        localVideoRef.current.readyState >= 2 &&
        remoteVideoRef.current &&
        remoteVideoRef.current.readyState >= 2
      ) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          localVideoRef.current,
          0,
          0,
          localVideoRef.current.videoWidth,
          localVideoRef.current.videoHeight
        );

        if (remoteStream) {
          ctx.drawImage(
            remoteVideoRef.current,
            localVideoRef.current.videoWidth,
            0,
            remoteVideoRef.current.videoWidth,
            remoteVideoRef.current.videoHeight
          );
        }
      }

      // Continue the loop as long as the component is mounted
      animationFrameIdRef.current = requestAnimationFrame(drawLoop);
    };

    // Start the drawing loop
    drawLoop();

    const combinedVideoTrack = canvas.captureStream(30).getVideoTracks()[0];
    const combinedAudioTrack = myStream.getAudioTracks()[0];

    const combinedStream = new MediaStream([
      combinedVideoTrack,
      combinedAudioTrack,
    ]);

    // Return both the stream and the cleanup function
    return { combinedStream };
  }, [myStream, remoteStream]);

  // Function to start the streaming process
  const startStreaming = useCallback(async () => {
    if (isStreaming) {
      toast.info("Streaming is already in progress.");
      return;
    }

    // Create the combined stream
    const result = createCombinedStream();
    if (!result || !result.combinedStream) return;

    // Set up MediaRecorder
    mediaRecorderRef.current = new MediaRecorder(result.combinedStream, {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
    });

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        // Emit the video chunk to the server
        streamSocket.emit("video-chunk", e.data);
      }
    };

    mediaRecorderRef.current.onstart = () => {
      setIsStreaming(true);
      toast.success("Streaming started!", {
        style: successStyle,
      });
    };

    mediaRecorderRef.current.onstop = () => {
      setIsStreaming(false);
      toast.info("Streaming stopped.");
    };

    mediaRecorderRef.current.onerror = (e) => {
      console.error("MediaRecorder error:", e);
      toast.error("An error occurred during streaming.", {
        style: errorStyle,
      });
    };

    // Start recording, sending data every 200ms
    mediaRecorderRef.current.start(200);
  }, [createCombinedStream, isStreaming, streamSocket]);

  // Function to stop the streaming process
  const stopStreaming = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      if (animationFrameIdRef.current)
        cancelAnimationFrame(animationFrameIdRef.current);
    }
    // Also, tell the server to stop
    streamSocket.emit("stop:stream");
  }, [streamSocket]);

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

  // Copy meeting ID to clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(meetId)
      .then(() => {
        setIsCopied(true);
        toast("Copied!", {
          duration: 1000,
          position: "bottom-right",
          style: successStyle,
        });
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast("Failed to Copy!", {
          duration: 2000,
          position: "bottom-right",
          style: errorStyle,
        });
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
    signallingSocket.emit("call:ended", { to: remoteSocketId });
    setRemoteStream(null);
    setRemoteSocketId(null);
    toast.info("Call ended");
    router.push("/dashboard");
  };

  const handlePeerDisconnected = useCallback(() => {
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    if (peerService.peer) {
      peerService.resetPeer();
    }
    setRemoteStream(null);
    setRemoteSocketId(null);
    toast.info("Peer disconnected");
  }, [peerService, remoteStream]);

  const handleHostDisconnected = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    if (peerService.peer) {
      peerService.cleanPeer();
    }
    setRemoteStream(null);
    setRemoteSocketId(null);
    toast.info("Host disconnected");
    router.push("/dashboard");
  }, [myStream, peerService, remoteStream, router]);

  useEffect(() => {
    signallingSocket.on("user:joined", handleUserJoined);
    signallingSocket.on("guest:joined", handleGuestJoined);
    signallingSocket.on("incoming:call", handleIncomingCall);
    signallingSocket.on("call:accepted", handleCallAccepted);
    signallingSocket.on("send:stream", handleSendStream);
    signallingSocket.on("peer:nego:needed", handlePeerNegotiation);
    signallingSocket.on("peer:nego:final", handlePeerNegotiationFinal);
    signallingSocket.on("peer:disconnected", handlePeerDisconnected);
    signallingSocket.on("host:disconnected", handleHostDisconnected);

    return () => {
      signallingSocket.off("user:joined", handleUserJoined);
      signallingSocket.off("incoming:call", handleIncomingCall);
      signallingSocket.off("call:accepted", handleCallAccepted);
      signallingSocket.off("send:stream", handleSendStream);
      signallingSocket.off("peer:nego:needed", handlePeerNegotiation);
      signallingSocket.off("peer:nego:final", handlePeerNegotiationFinal);
      signallingSocket.off("guest:joined", handleGuestJoined);
      signallingSocket.off("peer:disconnected", handlePeerDisconnected);
      signallingSocket.off("host:disconnected", handleHostDisconnected);
    };
  }, [
    signallingSocket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleSendStream,
    handlePeerNegotiation,
    handlePeerNegotiationFinal,
    handleGuestJoined,
    handlePeerDisconnected,
    handleHostDisconnected,
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
      <div className="p-4 flex justify-end">
        <Button
          onClick={copyToClipboard}
          size="sm"
          className={`cursor-default bg-neutral-800 text-green-200 hover:bg-neutral-800/80`}
        >
          Podcast ID: {meetId} <Copy />
        </Button>
      </div>
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
                      {signallingSocket?.id?.substring(0, 1).toUpperCase() ||
                        "Y"}
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
            className={`cursor-pointer group rounded-full h-12 w-12 p-0 ${isMicOn ? "bg-white hover:bg-green-100" : "bg-red-500 hover:bg-red-600"}`}
          >
            {isMicOn ? (
              <Mic className="size-5 text-green-700 group-hover:scale-110" />
            ) : (
              <MicOff className="size-5 group-hover:scale-110" />
            )}
          </Button>

          <Button
            onClick={toggleVideo}
            size="lg"
            className={`cursor-pointer group rounded-full h-12 w-12 p-0 ${isVideoOn ? "bg-white hover:bg-green-100" : "bg-red-500 hover:bg-red-600"}`}
          >
            {isVideoOn ? (
              <Video className="size-5 text-green-700 group-hover:scale-110" />
            ) : (
              <VideoOff className="size-5 group-hover:scale-110 transition-transform" />
            )}
          </Button>

          {hostSid?.trim() && hostSid !== remoteSocketId && (
            <StreamMeeting
              isStreaming={isStreaming}
              onStartStreaming={startStreaming}
              onStopStreaming={stopStreaming}
              socket={streamSocket}
            />
          )}

          <Button
            onClick={endCall}
            size="lg"
            className="cursor-pointer rounded-full h-14 w-14 p-0 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="size-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </footer>
    </main>
  );
};

export default Meeting;
