import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  isVerified: boolean().default(false),
  otp: varchar({ length: 6 }).default(""),
  otpExpiresAt: integer().default(0),
  createdAt: integer().notNull().default(Date.now()),
});
