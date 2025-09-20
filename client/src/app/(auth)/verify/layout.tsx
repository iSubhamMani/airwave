"use client";

import { Suspense } from "react";

export default function VerifyEmailPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center text-white font-medium">
          Loading...
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
