"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface User {
  username: string;
  fullname: string;
  email: string;
  user_uuid?: string;
}

interface DashboardPageProps {
  params: Promise<{ username: string }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params
      .then((resolvedParams) => {
        setUsername(resolvedParams.username);
      })
      .catch((err) => {
        console.error("Error resolving params:", err);
        setError("Failed to load username.");
      });
  }, [params]);

  useEffect(() => {
    if (!username) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          if (parsedUser.username === username) {
            setUser(parsedUser);
            setLoading(false);
            return;
          }
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}routes/auth/get_user.php?username=${username}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();

        if (!data.success || !data.user) {
          throw new Error("User not found.");
        }

        const sanitizedUser = {
          ...data.user,
          fullname: data.user.fullname || "No Name Provided",
        };

        localStorage.setItem("user", JSON.stringify(sanitizedUser));
        setUser(sanitizedUser);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md text-center">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/auth/signin")} className="mt-4">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-white overflow-hidden">
      <h1 className="text-4xl font-extrabold">
        Welcome, {user?.fullname || "User"}!
      </h1>
      <p className="text-gray-400 mt-2">Your account details</p>

      <div className="mt-10 w-full max-w-2xl space-y-6">
        <div className="flex justify-between border-b border-gray-700 pb-3">
          <span className="text-gray-400 text-lg font-medium">Full Name:</span>
          <span className="text-lg">
            {user?.fullname || "No Name Provided"}
          </span>
        </div>
        <div className="flex justify-between border-b border-gray-700 pb-3">
          <span className="text-gray-400 text-lg font-medium">Username:</span>
          <span className="text-lg">{user?.username}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400 text-lg font-medium">Email:</span>
          <span className="text-lg">{user?.email}</span>
        </div>
      </div>
    </div>
  );
}
