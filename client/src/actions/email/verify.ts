"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function verifyEmail(email: string, otp: string) {
  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users.length === 0) {
      throw new Error("Error Verifying - No User Found");
    }

    const user = users[0];

    const otpFromDB = user.otp!;
    const otpExpiry = user.otpExpiresAt!;

    if (new Date(otpExpiry).getTime() < Date.now())
      throw new Error("OTP has expired. Request a new one.");

    if (otpFromDB !== otp) throw new Error("Invalid OTP");

    await db
      .update(usersTable)
      .set({
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
      })
      .where(eq(usersTable.email, email));

    return { success: true, message: "Email Verified Successfully" };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error Verifying Email"
    );
  }
}
