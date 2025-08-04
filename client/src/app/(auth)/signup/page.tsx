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
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import axios, { isAxiosError } from "axios";
import { sendOtp } from "@/actions/email/send";
import { useAuth } from "@/store/auth";

const Signup = () => {
  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { setEmailSent } = useAuth((store) => store);

  const verifyCredentials = (password: string, email: string) => {
    try {
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isEmailValid) throw new Error("Invalid email address");

      const isPasswordValid = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(
        password
      ); // At least 8 characters, at least one letter and one number
      if (!isPasswordValid)
        throw new Error(
          "Password must be at least 8 characters long and contain at least one letter and one number"
        );
      return true;
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Error validating credentials",
        {
          duration: 5000,
          position: "top-center",
          style: errorStyle,
        }
      );
      return false;
    }
  };

  const handleSignup = async () => {
    const isValidCredentials = verifyCredentials(password, email);
    if (!isValidCredentials) return;

    try {
      setLoading(true);
      const res = await axios.post("/api/auth/signup", {
        email,
        password,
        fullname,
      });

      if (res.status === 200) {
        toast("Signup successful!", {
          duration: 3000,
          position: "top-center",
          style: successStyle,
        });

        try {
          const res = await sendOtp(email);

          if (res.success) {
            setEmailSent(true);
            setEmail("");
            setFullname("");
            setPassword("");
            toast("OTP has been sent!", {
              duration: 3000,
              position: "top-center",
              style: successStyle,
            });

            router.replace("/verify");
          }
        } catch (error) {
          toast(error instanceof Error ? error.message : "Error sending OTP", {
            duration: 3000,
            position: "top-center",
            style: errorStyle,
          });
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast(error.response?.data?.error || "Error signing up", {
          duration: 5000,
          position: "top-center",
          style: errorStyle,
        });
      } else {
        toast("Error signing up", {
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
          Please signup to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="space-y-2 w-full">
          <Label
            htmlFor="fullname"
            className="text-green-200 text-xs sm:text-sm"
          >
            Full Name
          </Label>
          <Input
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            id="fullname"
            type="text"
            placeholder="Enter your full name"
            className="text-xs sm:text-sm text-white"
          />
        </div>
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
          onClick={handleSignup}
          disabled={loading}
          className="text-xs sm:text-sm bg-white"
        >
          Signup
        </InteractiveHoverButton>
        <p className="text-xs sm:text-sm text-white text-center">
          Already have an account?{" "}
          <Link className="text-green-200 hover:text-green-300" href={"/login"}>
            Login
          </Link>
        </p>
      </CardContent>
    </>
  );
};

export default Signup;
