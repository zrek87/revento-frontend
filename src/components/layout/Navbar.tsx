"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{
    username: string;
    role: string;
    avatar?: string;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    //Listen for login/logout updates dynamically
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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
    <nav className="dark:bg-gray-900 bg-gray-900 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <div className="cursor-pointer">
            <Image src="/logo.png" alt="Logo" width={70} height={50} priority />
          </div>
        </Link>

        {/*Render only after client loads*/}
        {isClient && (
          <>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer bg-gray-700 border border-white">
                    <AvatarImage src={user.avatar} alt="User Avatar" />
                    <AvatarFallback className="bg-gray-700 text-white font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="bg-gray-800 text-white"
                >
                  {user.role === "admin" && (
                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => router.push(`/dashboard/${user.username}`)}
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-500"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className="bg-slate-700 hover:bg-pink-600"
                onClick={() => router.push("/auth/signin")}
              >
                Sign In / Sign Up
              </Button>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
