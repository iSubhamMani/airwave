import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br to-black/90 from-[#101210] text-white">
        {/* Grainy Texture Overlay */}

        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        <AppSidebar />

        <div className="flex-1 flex flex-col z-10">
          {/* Header with trigger */}
          <header className="h-16 flex items-center justify-between backdrop-blur-glass px-6">
            <SidebarTrigger className="text-green-200 cursor-pointer" />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Welcome back, John
              </span>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
