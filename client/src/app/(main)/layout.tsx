"use client";

import { SessionProvider } from "next-auth/react";
import SocketProvider from "../../providers/Socket";
import React from "react";

const MainLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SocketProvider>
      <SessionProvider>{children}</SessionProvider>
    </SocketProvider>
  );
};

export default MainLayout;
