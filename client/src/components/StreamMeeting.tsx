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

const StreamMeeting = () => {
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
            Enter the RTMP url
          </DialogTitle>
          <div className="mt-4">
            <Input
              type="text"
              placeholder="rtmp://example.com/live/streamkey"
              className="text-xs sm:text-sm text-black placeholder:text-black/70"
            />
            <div className="mt-4 flex justify-end">
              <Button
                size="lg"
                className={`group cursor-pointer bg-green-900 text-green-200 hover:bg-green-900/80`}
              >
                <Radio className="size-5 group-hover:scale-105" />
                Go Live
              </Button>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default StreamMeeting;
