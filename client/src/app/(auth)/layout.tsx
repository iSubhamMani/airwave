import { Card } from "@/components/ui/card";
import React, { ReactNode } from "react";

const Auth = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative flex justify-center items-center min-h-screen bg-black text-white">
      <div
        className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-800 to-black"
        style={{
          background: `
              radial-gradient(circle at 20% 80%, rgba(22, 163, 74, 0.3), transparent 50%), /* Green tint */
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1), transparent 50%),
              linear-gradient(135deg, #166534 0%, #000 30%, #000 50%, #000000 60%)
            `,
        }}
      />

      {/* Grainy Texture Overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center flex justify-center items-center">
        <Card className="w-full max-w-md bg-white/10 border-green-200/80 backdrop-blur-xl shadow-2xl">
          {children}
        </Card>
      </div>
    </div>
  );
};

export default Auth;
