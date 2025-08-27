"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/providers/Socket";
import { LoaderCircle, Mic, Radio, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const Dashboard = () => {
  const [joinPodcastId, setJoinPodcastId] = useState("");
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const { data: session } = useSession();
  const router = useRouter();

  const handleStartMeeting = useCallback(() => {
    if (!session?.user?.email) return;
    socket.emit("room:create", { email: session?.user.email });
    setLoading(true);
  }, [socket, session]);

  const handleRoomJoin = useCallback(() => {
    if (!session?.user?.email || !joinPodcastId) return;
    //socket.emit("room:join", { roomId: joinPodcastId, email: session?.user.email });
    router.push(`/meeting/${joinPodcastId}`);
  }, [session, joinPodcastId, router]);

  const handleRoomCreated = useCallback(({ roomId }: { roomId: string }) => {
    console.log("Room created with ID:", roomId);
    setLoading(false);
    router.push(`/meeting/${roomId}`);
  }, []);

  useEffect(() => {
    socket.on("room:created", handleRoomCreated);

    return () => {
      socket.off("room:created", handleRoomCreated);
    };
  }, [socket, handleRoomCreated]);

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md bg-green-100/10 border-green-200/80 backdrop-blur-xl shadow-2xl">
        <CardContent className="flex flex-col gap-6">
          <CardContent className="space-y-8">
            {/* Start Meeting Section */}
            <div className="space-y-4">
              <div className="text-center">
                <Mic className="mx-auto h-10 w-10 text-green-200 mb-3" />
                <p className="text-sm text-white">
                  Create a new podcast room and share the meeting ID with your
                  guest
                </p>
              </div>
              <Button
                onClick={handleStartMeeting}
                className="w-full text-xs sm:text-sm group bg-green-200 text-green-700 hover:bg-green-200 font-semibold cursor-pointer shadow-xl transition-all duration-150 ease-in-out"
              >
                <Radio className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                {loading ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  "Start New Podcast"
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-glass-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-glass-bg px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            {/* Join Meeting Section */}
            <div className="space-y-4">
              <div className="text-center">
                <Users className="mx-auto h-10 w-10 text-green-200 mb-3" />
                <p className="text-sm text-white">
                  Enter the meeting ID to join an existing podcast session
                </p>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Enter Meeting ID"
                  value={joinPodcastId}
                  onChange={(e) => setJoinPodcastId(e.target.value)}
                  className="text-xs sm:text-sm text-white placeholder:text-white/60"
                />
                <Button
                  onClick={handleRoomJoin}
                  disabled={!joinPodcastId}
                  className="w-full text-xs sm:text-sm group bg-white text-green-700 hover:bg-white/90 font-semibold cursor-pointer shadow-xl transition-all duration-150 ease-in-out"
                >
                  <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Join Podcast
                </Button>
              </div>
            </div>
          </CardContent>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
