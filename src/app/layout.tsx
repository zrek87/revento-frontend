"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";
import { checkSession, extendSession } from "@/lib/session";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const extendSessionRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function validateSession() {
      const isLoggedIn = await checkSession();
      if (!isLoggedIn) {
        router.push("/auth/signin");
      }
    }

    validateSession();

    //Extend session only every 5 minutes
    const handleUserActivity = () => {
      if (extendSessionRef.current) {
        clearTimeout(extendSessionRef.current);
      }
      extendSessionRef.current = setTimeout(() => {
        extendSession();
      }, 300000); // 5 minutes
    };

    const activityEvents = ["mousemove", "keydown", "click"];
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleUserActivity);
    });

    return () => {
      if (extendSessionRef.current) {
        clearTimeout(extendSessionRef.current);
      }
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [router]);

  const isAdminPage = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <body className="bg-black text-white flex flex-col min-h-screen">
        {!isAdminPage && <Navbar />}
        <main className="flex-1">{children}</main>
        {!isAdminPage && <Footer />}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
