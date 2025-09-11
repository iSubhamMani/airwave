"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const Logout = () => {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="cursor-pointer bg-green-300 rounded-full p-1 sm:p-2 hover:bg-green-300/90 transition-colors"
    >
      <LogOut className="size-3 sm:size-4 md:size-5 text-green-900" />
    </button>
  );
};

export default Logout;
