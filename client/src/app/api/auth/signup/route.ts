import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullname } = body;

    if (!email || !password || !fullname) {
      throw new Error("Missing required fields");
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser.length > 0) {
      throw new Error("User already exists with this email");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    await db.insert(usersTable).values({
      email,
      password: hashedPassword,
      name: fullname,
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  }
}
