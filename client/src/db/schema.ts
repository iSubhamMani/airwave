import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  isVerified: boolean().default(false),
  otp: varchar({ length: 6 }),
  otpExpiresAt: timestamp({ withTimezone: true }),
  createdAt: date()
    .notNull()
    .default(sql`now()`),
});
