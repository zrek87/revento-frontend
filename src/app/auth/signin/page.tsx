"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

export default function Signin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}routes/auth/signin.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setLoading(false);

      if (result.success) {
        localStorage.setItem("user", JSON.stringify(result));
        window.dispatchEvent(new Event("storage"));

        toast.success("Sign-in successful! Redirecting...", {
          icon: <CheckCircleIcon className="text-green-500 w-6 h-6" />,
        });

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        toast.error(result.message, {
          icon: <XCircleIcon className="text-red-500 w-6 h-6" />,
        });
      }
    } catch {
      setLoading(false);
      toast.error("Something went wrong! Please try again.", {
        icon: <XCircleIcon className="text-red-500 w-6 h-6" />,
      });
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col lg:flex-row">
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

      <div className="absolute inset-0 bg-black/60 backdrop-blur-lg" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full h-full px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="w-full lg:w-1/2 flex justify-center lg:justify-start text-center lg:text-left mb-6 lg:mb-0"
        >
          <h1 className="text-3xl lg:text-5xl font-bold leading-snug bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent animate-gradient">
            Book the best events, <br /> experiences, and shows <br /> on
            <span className="text-pink-500"> Revento</span>.
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="w-full lg:w-1/2 flex flex-col items-center justify-center"
        >
          <Card className="w-full max-w-[400px] bg-black/70 backdrop-blur-xl border border-white/20 text-white shadow-2xl p-8 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">
                Sign In
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/40 text-white placeholder-white/60 focus:ring-2 focus:ring-pink-400 focus:outline-none"
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
                    placeholder="Enter your password"
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/40 text-white placeholder-white/60 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 hover:from-red-500 hover:to-pink-600 transition-all text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
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
            <Card className="bg-black/70 backdrop-blur-lg border border-white/30 text-white shadow-lg p-5 text-center rounded-lg">
              <p className="text-sm text-white/80 mb-3">
                Don’t have an account?
              </p>
              <Link href="/auth/signup">
                <Button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-500 hover:to-purple-600 transition-all text-white font-semibold">
                  Create an Account
                </Button>
              </Link>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
