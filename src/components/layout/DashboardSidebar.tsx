"use client";

import { useState } from "react";
import { Home, Calendar, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  username: string;
}

export default function Sidebar({ username }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", icon: <Home />, href: `/dashboard/${username}` },
    {
      name: "Events",
      icon: <Calendar />,
      href: `/dashboard/${username}/booked-events`,
    },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}routes/auth/logout.php`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("storage"));
        router.push("/auth/signin");
      } else {
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/*Sidebar*/}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white h-screen flex flex-col shadow-lg
        transform transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        } md:relative md:translate-x-0`}
      >
        {/*Sidebar header*/}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">Revento</h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </Button>
        </div>

        {/*Navigation links*/}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              let isActive = pathname === item.href;
              if (item.href.includes("booked-events")) {
                isActive = pathname.startsWith(item.href);
              }

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 p-3 rounded-lg transition text-gray-300
                      ${
                        isActive
                          ? "bg-pink-700 text-white font-semibold shadow-lg"
                          : "hover:bg-gray-700"
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Button
            variant="destructive"
            className="w-full flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
