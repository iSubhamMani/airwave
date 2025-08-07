"use client";

import { useState } from "react";
import { User, LayoutDashboard, Mic, Settings, Radio } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Recordings", url: "/recordings", icon: Mic },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const currentPath = usePathname();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-[#1dd75b]/20 border-l-2 border-[#1dd75b] text-white"
      : "hover:bg-[#1dd75b]/10 text-white";

  return (
    <Sidebar
      className={`z-10 border-r border-white/10 shadow-glass transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="py-4 px-1.5 bg-[#111311]">
        {/* Logo/Brand */}
        <div className="mb-8 flex items-center justify-center">
          {!isCollapsed ? (
            <div className="flex items-center">
              <div className="overflow-hidden size-10 p-2">
                <Image
                  src={"/logo.png"}
                  alt="Airwave Logo"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold bg-clip-text text-white">
                Airwave
              </span>
            </div>
          ) : (
            <div className="overflow-hidden size-10 p-2">
              <Image
                src={"/logo.png"}
                alt="Airwave Logo"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <SidebarMenu className="space-y-2">
          {items.map((item) => (
            <div key={item.title} className="group">
              <div className="relative">
                <Link
                  href={item.url}
                  className={`py-2 ${getNavCls({ isActive: isActive(item.url) })} flex gap-2 items-center rounded-lg transition-all duration-200 ${
                    isCollapsed ? "justify-center" : "px-3"
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0 text-white" />
                  {!isCollapsed && (
                    <span className="font-medium text-white">{item.title}</span>
                  )}
                </Link>
              </div>
            </div>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
