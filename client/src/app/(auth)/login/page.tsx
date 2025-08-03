"use client";

import { InteractiveHoverButton } from "@/components/InteractiveHoverButton";
import { errorStyle, successStyle } from "@/components/Toast";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast("Email and password are required", {
        duration: 3000,
        position: "top-center",
        style: errorStyle,
      });
      return;
    }
    try {
      setLoading(true);
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        throw new Error(res.error);
      }
      if (res?.ok) {
        toast("Logged in successfully", {
          duration: 3000,
          position: "top-center",
          style: successStyle,
        });
        setEmail("");
        setPassword("");
        router.replace("/dashboard");
      }
    } catch (error) {
      if (error instanceof Error && error.message === "email_not_verified") {
        toast("Please verify your email first", {
          duration: 5000,
          position: "top-center",
          style: errorStyle,
        });
      } else {
        toast(error instanceof Error ? error.message : "Error signing in", {
          duration: 5000,
          position: "top-center",
          style: errorStyle,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl font-bold text-white">
          Welcome to Airwave👋
        </CardTitle>
        <CardDescription className="text-green-200 text-xs sm:text-sm">
          Please login to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="space-y-2 w-full">
          <Label htmlFor="email" className="text-green-200 text-xs sm:text-sm">
            Email
          </Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            type="email"
            placeholder="Enter your email"
            className="text-xs sm:text-sm text-white"
          />
        </div>
        <div className="space-y-2 w-full">
          <Label
            htmlFor="password"
            className="text-green-200 text-xs sm:text-sm"
          >
            Password
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your password"
              className="text-xs sm:text-sm text-white"
            />
            {passwordVisible ? (
              <EyeOff
                onClick={() => setPasswordVisible(false)}
                className="text-green-200 size-5"
              />
            ) : (
              <Eye
                onClick={() => setPasswordVisible(true)}
                className="text-green-200 size-5"
              />
            )}
          </div>
        </div>
        <InteractiveHoverButton
          onClick={handleLogin}
          disabled={loading}
          className="text-xs sm:text-sm"
        >
          Login
        </InteractiveHoverButton>
        <p className="text-xs sm:text-sm text-white text-center">
          Don&apos;t have an account?{" "}
          <Link
            className="text-green-200 hover:text-green-300"
            href={"/signup"}
          >
            Signup
          </Link>
        </p>
      </CardContent>
    </>
  );
};

export default Login;
