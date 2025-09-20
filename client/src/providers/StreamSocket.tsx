"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useStreamSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  return socket;
};

const StreamSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const _socket = io(
      "https://ec2-43-205-94-200.ap-south-1.compute.amazonaws.com:8001"
    );
    setSocket(_socket);

    return () => {
      _socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {socket ? children : null}
    </SocketContext.Provider>
  );
};

export default StreamSocketProvider;
