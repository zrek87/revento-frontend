"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Link from "next/link";
import PreferencesDrawer from "@/components/PreferencesDrawer";

export default function Signup() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        router.push("/dashboard");
      }
    }
  }, [router]);

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowDrawer(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col lg:flex-row">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://res.cloudinary.com/doszwmi8e/video/upload/v1739473338/%D8%AC%D9%85%D8%A7%D9%84_%D8%A8%D9%88%D9%84%D9%8A%D9%81%D8%A7%D8%B1%D8%AF_%D8%B1%D9%8A%D8%A7%D8%B6_%D8%B3%D9%8A%D8%AA%D9%8A_ryvw56.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Blur Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-lg" />

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full h-full px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="w-full lg:w-1/2 flex justify-center lg:justify-start text-center lg:text-left mb-6 lg:mb-0"
        >
          <h1 className="text-3xl lg:text-5xl font-bold leading-snug bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent animate-gradient">
            Join <span className="text-purple-500">Revento</span> <br />
            and explore unforgettable <br />
            events & experiences.
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="w-full lg:w-1/2 flex flex-col items-center justify-center"
        >
          <Card className="w-full max-w-[400px] bg-black/70 backdrop-blur-xl border border-white/20 text-white shadow-2xl p-7 rounded-2xl mt-9">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">
                Create an Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    name="fullname"
                    type="text"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-500 hover:to-purple-600 transition-all text-white font-semibold"
                >
                  Sign Up
                </Button>
              </form>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-full max-w-[400px] mt-6"
          >
            <Card className="bg-black/70 backdrop-blur-lg border border-white/30 text-white shadow-lg p-5 text-center rounded-lg mb-9">
              <p className="text-sm text-white/80 mb-3">
                Already have an account?
              </p>
              <Link href="/auth/signin">
                <Button className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 hover:from-red-500 hover:to-pink-600 transition-all text-white font-semibold">
                  Sign In
                </Button>
              </Link>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <PreferencesDrawer
        open={showDrawer}
        setOpen={setShowDrawer}
        userId={userId}
        setUserId={setUserId}
        formData={formData}
      />
    </div>
  );
}
