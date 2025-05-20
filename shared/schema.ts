import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping the original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Code Snippets schema
export const snippets = pgTable("snippets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  userId: integer("user_id").references(() => users.id),
  timestamp: integer("timestamp").notNull(),
});

export const insertSnippetSchema = createInsertSchema(snippets).pick({
  name: true,
  code: true,
  userId: true,
  timestamp: true,
});

export type InsertSnippet = z.infer<typeof insertSnippetSchema>;
export type Snippet = typeof snippets.$inferSelect;

// Examples schema
export const examples = pgTable("examples", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  category: text("category").notNull(),
});

export const insertExampleSchema = createInsertSchema(examples).pick({
  name: true,
  code: true,
  category: true,
});

export type InsertExample = z.infer<typeof insertExampleSchema>;
export type Example = typeof examples.$inferSelect;

// Resources schema
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  name: true,
  url: true,
  description: true,
  category: true,
});

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;
