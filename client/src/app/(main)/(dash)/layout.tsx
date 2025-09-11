import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <div className="min-h-screen flex w-full items-center justify-center bg-gradient-to-br to-black/90 from-[#101210] text-white">
        Please log in to access the dashboard.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-[#101210] to-black/90  text-white">
      {/* Grainy Texture Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full" />
        {/* Gradient Orbs */}
        <div className="animate-orb absolute top-1/3 left-1/5 w-96 h-96 bg-gradient-to-r from-green-800/40 to-green-900/40 rounded-full blur-3xl" />
      </div>
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="flex-1 flex flex-col z-10">
        {/* Header with trigger */}
        <header className="h-16 flex items-center justify-end backdrop-blur-glass px-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Welcome back, {session.user.name || "User"}
            </span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
