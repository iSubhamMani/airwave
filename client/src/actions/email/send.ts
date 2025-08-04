"use server";
import { EmailTemplate } from "@/components/otp-email-template";
import { Resend } from "resend";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtp(email: string) {
  console.log("Sending OTP to:", email);
  try {
    if (!email.trim()) throw new Error("Email is required");
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Basic email validation
    if (!isEmailValid) throw new Error("Invalid email format");

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    const userExists = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!userExists.length) {
      throw new Error("User not found. Please sign up first.");
    }

    await db
      .update(usersTable)
      .set({
        otp: otp.toString(),
        otpExpiresAt: otpExpiry,
      })
      .where(eq(usersTable.email, email));

    const { error } = await resend.emails.send({
      from: "Subham from Airwave <no-reply@updates.subhammani.xyz>",
      to: email,
      subject: "Verify Your Email",
      react: await EmailTemplate({ otp: otp.toString() }),
      text: `Welcome to Airwave!\nPlease verify your email to move forward.\nYour OTP is: ${otp}\nThis OTP is valid for 10 minutes. Please do not share it with anyone.`,
    });

    if (error) {
      throw new Error("Error sending OTP");
    }

    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error Sending OTP"
    );
  }
}
