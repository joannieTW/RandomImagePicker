import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the users table (keeping the existing schema)
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

// Define the image schema
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  data: text("data").notNull(), // Store base64 encoded image data
  selected: boolean("selected").default(false),
  selected_count: integer("selected_count").default(0), // Track selection count (up to 2)
  group_id: integer("group_id").default(0), // To track which group it belongs to
  timestamp: text("timestamp").notNull(), // Store ISO timestamp of upload
});

export const insertImageSchema = createInsertSchema(images).pick({
  name: true,
  data: true,
  timestamp: true,
});

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;

// Schema for uploading multiple images
export const uploadImagesSchema = z.object({
  images: z.array(
    z.object({
      name: z.string(),
      data: z.string(),
    })
  ),
});

export type UploadImages = z.infer<typeof uploadImagesSchema>;
