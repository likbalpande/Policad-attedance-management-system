import { pgTable, serial, varchar, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { timestamps } from "./timestamps";

export const courseTags = pgTable("course_tags", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 50 }).notNull(),
  createdByUserId: integer("created_by_user_id")
    .notNull()
    .references(() => users.id),
  ...timestamps(),
});
