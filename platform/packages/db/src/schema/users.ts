import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  text,
  timestamp,
  unique,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import type { UserRole } from "@platform/permissions";
import { organizations } from "./organizations";
import { timestamps } from "./timestamps";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    orgId: integer("org_id")
      .notNull()
      .references(() => organizations.id),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    whatsapp: varchar("whatsapp", { length: 20 }),
    // application_level_enum(super_admin, admin, faculty, student)
    role: varchar("role", { length: 25 }).$type<UserRole>().notNull(),
    // stored in plain text (intentional - see discussion-summaries item 14)
    password: varchar("password", { length: 50 }),
    passwordGeneratedAt: timestamp("password_generated_at", { withTimezone: true }).notNull(),
    otp: varchar("otp", { length: 10 }),
    otpGeneratedAt: timestamp("otp_generated_at", { withTimezone: true }),
    loginCount: integer("login_count").default(0).notNull(),
    // Set on every successful login (all roles). Drives the student
    // concurrent-session check - see product-idea.txt.
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    allowPasswordLogin: boolean("allow_password_login").default(false).notNull(),
    alias: text("alias"),
    createdByUserId: integer("created_by_user_id").references((): AnyPgColumn => users.id),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    ...timestamps(),
  },
  (table) => ({
    uqIdentifierOrg: unique("uq__users__identifier__org_id").on(table.identifier, table.orgId),
    uqEmail: unique("uq__users__email").on(table.email),
    uqPhone: unique("uq__users__phone").on(table.phone),
    uqWhatsapp: unique("uq__users__whatsapp").on(table.whatsapp),
    passwordGeneratedAtIdx: index("idx__users__password_generated_at").on(
      table.passwordGeneratedAt,
    ),
    createdByUserIdIdx: index("idx__users__created_by_user_id").on(table.createdByUserId),
  }),
);
