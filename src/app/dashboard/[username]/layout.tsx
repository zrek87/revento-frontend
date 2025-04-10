"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/layout/DashboardSidebar";
import { ReactNode } from "react";

interface User {
  username: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { username } = useParams();

  const validUsername = typeof username === "string" ? username : "";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.username === validUsername) {
            setUser(parsedUser);
            setLoading(false);
            return;
          }
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}routes/auth/get_user.php?username=${validUsername}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          router.push("/auth/signin");
          return;
        }

        const data = await res.json();
        if (!data.username) {
          router.push("/auth/signin");
          return;
        }

        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/auth/signin");
      } finally {
        setLoading(false);
      }
    };

    if (validUsername) {
      checkUser();
    }
  }, [validUsername, router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex h-full">
      <Sidebar username={user?.username ?? validUsername} />
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">{children}</div>
    </div>
  );
}
