import { InteractiveHoverButton } from "@/components/InteractiveHoverButton";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import React from "react";

const Signup = () => {
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
          <Label htmlFor="email" className="text-green-200 text-xs sm:text-sm">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="text-xs sm:text-sm text-white"
          />
        </div>
        <div className="space-y-2 w-full">
          <Label htmlFor="email" className="text-green-200 text-xs sm:text-sm">
            Password
          </Label>
          <Input
            id="email"
            type="password"
            placeholder="Enter your password"
            className="text-xs sm:text-sm text-white"
          />
        </div>
        <InteractiveHoverButton className="text-xs sm:text-sm bg-white">
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
