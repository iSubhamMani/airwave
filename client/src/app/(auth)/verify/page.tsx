"use client";

import { sendOtp } from "@/actions/email/send";
import { InteractiveHoverButton } from "@/components/InteractiveHoverButton";
import { errorStyle, successStyle } from "@/components/Toast";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useState } from "react";
import { toast } from "sonner";

const VerifyEmail = () => {
  const [otp, setOtp] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const { emailSent, setEmailSent } = useAuth((store) => store);

  const handleOtpSend = async () => {
    try {
      const res = await sendOtp(email);

      if (res.success) {
        setEmailSent(true);
        setEmail("");
        toast("OTP has been sent!", {
          duration: 3000,
          position: "top-center",
          style: successStyle,
        });
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "Error sending OTP", {
        duration: 3000,
        position: "top-center",
        style: errorStyle,
      });
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl font-bold text-white">
          Verify Your Email
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {emailSent ? (
          <div className="space-y-6">
            <InputOTP
              value={otp}
              onChange={(value) => setOtp(value)}
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            >
              <InputOTPGroup className="flex gap-2 justify-center">
                {[...Array(6)].map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="w-12 h-14 text-center text-white text-xl bg-white/15 
              border-x-0 border-t-0 border-b border-white rounded-sm 
              focus:outline-none focus:ring-2 focus:ring-white"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <p className="text-sm text-center text-white">
              Didn&apos;t receive the OTP?{" "}
              <span className="text-green-200 font-bold cursor-pointer hover:underline">
                Resend OTP
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-green-200 text-xs sm:text-sm"
            >
              Registered Email
            </Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              type="email"
              placeholder="Enter your registered email"
              className="text-xs sm:text-sm text-white"
            />
          </div>
        )}

        {emailSent ? (
          <InteractiveHoverButton className="text-xs sm:text-sm">
            Verify OTP
          </InteractiveHoverButton>
        ) : (
          <InteractiveHoverButton
            onClick={handleOtpSend}
            className="text-xs sm:text-sm"
          >
            Send OTP
          </InteractiveHoverButton>
        )}
      </CardContent>
    </>
  );
};

export default VerifyEmail;
