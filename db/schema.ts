import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const participants = pgTable("participants", {
  id: serial().primaryKey(),
  name: text().notNull(),
  // Private: never returned by the public API.
  twitter: text().notNull(),
  instagram: text().notNull(),
  gaNumber: integer("ga_number").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
