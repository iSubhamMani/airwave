/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext<any>(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useMemo(() => io("http://localhost:8000"), []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
