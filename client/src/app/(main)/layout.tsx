"use client";

import { SessionProvider } from "next-auth/react";
import SignallingSocketProvider from "../../providers/SignallingSocket";
import StreamSocketProvider from "../../providers/StreamSocket";
import React from "react";

const MainLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SignallingSocketProvider>
      <StreamSocketProvider>
        <SessionProvider>{children}</SessionProvider>
      </StreamSocketProvider>
    </SignallingSocketProvider>
  );
};

export default MainLayout;
