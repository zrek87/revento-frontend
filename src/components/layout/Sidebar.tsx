"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, Calendar, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/admin/users", label: "Manage Users", icon: <Users size={20} /> },
    {
      href: "/admin/addevent",
      label: "Add Event",
      icon: <Calendar size={20} />,
    },
    {
      href: "/admin/manageevents",
      label: "Manage Events",
      icon: <Calendar size={20} />,
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

      const result = await response.json();
      if (result.success) {
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("storage"));
        router.push("/auth/signin");
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

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white h-screen flex flex-col shadow-lg
        transform transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        } md:relative md:translate-x-0`}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </Button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition ${
                    pathname === link.href
                      ? "bg-gray-800 text-blue-400"
                      : "hover:bg-gray-800"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
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
