"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Radio } from "lucide-react";
import { Input } from "./ui/input";
import { useCallback, useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Socket } from "socket.io-client";
import { toast } from "sonner";
import { errorStyle } from "./Toast";

interface StreamMeetingProps {
  socket: Socket;
  isStreaming: boolean;
  onStartStreaming: () => void;
  onStopStreaming: () => void;
}

const StreamMeeting = ({
  socket,
  isStreaming,
  onStartStreaming,
  onStopStreaming,
}: StreamMeetingProps) => {
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [streamKey, setStreamKey] = useState<string>("");

  const handleGoLive = () => {
    if (!streamUrl || !streamKey) {
      toast.error("Please enter both stream URL and stream key", {
        duration: 3000,
        position: "bottom-right",
        style: errorStyle,
      });
      return;
    }

    socket.emit("start:stream", { streamUrl, streamKey });
  };

  const handleEndStream = () => {
    onStopStreaming();
  };

  const handleStreamReady = useCallback(() => {
    onStartStreaming();
  }, [onStartStreaming]);

  useEffect(() => {
    socket.on("stream:ready", handleStreamReady);

    return () => {
      socket.off("stream:ready", handleStreamReady);
    };
  }, [handleStreamReady, socket]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className={`group cursor-pointer rounded-full h-12 w-12 p-0 bg-green-300 text-green-900 hover:bg-green-300/80`}
        >
          <Radio className="size-5 group-hover:scale-105" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-md bg-neutral-300/80 border-green-200/80 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-neutral-800">
            {isStreaming ? "Live Streaming" : "Start Live Stream"}
          </DialogTitle>
          <div className="mt-4 space-y-4">
            {!isStreaming && (
              <>
                <div className="space-y-2">
                  <Label
                    htmlFor="streamUrl"
                    className="text-neutral-800 text-xs sm:text-sm"
                  >
                    Stream Url
                  </Label>
                  <Input
                    id="streamUrl"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    type="text"
                    placeholder="rtmp://example.com/live"
                    className="text-xs sm:text-sm text-black placeholder:text-black/70"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="streamKey"
                    className="text-neutral-800 text-xs sm:text-sm"
                  >
                    Stream Key
                  </Label>
                  <Input
                    id="streamKey"
                    value={streamKey}
                    onChange={(e) => setStreamKey(e.target.value)}
                    type="password"
                    placeholder="your-stream-key"
                    className="text-xs sm:text-sm text-black placeholder:text-black/70"
                  />
                </div>
              </>
            )}
            <div className="flex justify-end">
              {isStreaming ? (
                <Button
                  onClick={handleEndStream}
                  size="lg"
                  className="group cursor-pointer bg-red-700 text-white hover:bg-red-800"
                >
                  End Stream
                </Button>
              ) : (
                <Button
                  onClick={handleGoLive}
                  size="lg"
                  className="group cursor-pointer bg-green-900 text-green-200 hover:bg-green-900/80"
                >
                  <Radio className="size-5 group-hover:scale-105" />
                  Go Live
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default StreamMeeting;
