import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  dreams: many(dreams),
}));

export const dreams = pgTable("dreams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  audioUrl: text("audio_url"),
  audioDuration: integer("audio_duration"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  tags: text("tags").array(),
});

export const dreamsRelations = relations(dreams, ({ one }) => ({
  user: one(users, {
    fields: [dreams.userId],
    references: [users.id],
  }),
  interpretation: one(interpretations, {
    fields: [dreams.id],
    references: [interpretations.dreamId],
  }),
  imageGeneration: one(imageGenerations, {
    fields: [dreams.id],
    references: [imageGenerations.dreamId],
  }),
}));

export const interpretations = pgTable("interpretations", {
  id: serial("id").primaryKey(),
  dreamId: integer("dream_id").references(() => dreams.id).notNull().unique(),
  interpretation: text("interpretation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  insights: jsonb("insights"),
});

export const interpretationsRelations = relations(interpretations, ({ one }) => ({
  dream: one(dreams, {
    fields: [interpretations.dreamId],
    references: [dreams.id],
  }),
}));

export const imageGenerations = pgTable("image_generations", {
  id: serial("id").primaryKey(),
  dreamId: integer("dream_id").references(() => dreams.id).notNull().unique(),
  imageUrl: text("image_url").notNull(),
  style: text("style").notNull(),
  prompt: text("prompt").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const imageGenerationsRelations = relations(imageGenerations, ({ one }) => ({
  dream: one(dreams, {
    fields: [imageGenerations.dreamId],
    references: [dreams.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDreamSchema = createInsertSchema(dreams).omit({
  id: true,
  createdAt: true,
});

export const insertInterpretationSchema = createInsertSchema(interpretations).omit({
  id: true,
  createdAt: true,
});

export const insertImageGenerationSchema = createInsertSchema(imageGenerations).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDream = z.infer<typeof insertDreamSchema>;
export type Dream = typeof dreams.$inferSelect;

export type InsertInterpretation = z.infer<typeof insertInterpretationSchema>;
export type Interpretation = typeof interpretations.$inferSelect;

export type InsertImageGeneration = z.infer<typeof insertImageGenerationSchema>;
export type ImageGeneration = typeof imageGenerations.$inferSelect;

// Extended schemas with additional fields
export const dreamWithRelations = z.object({
  dream: z.object({
    id: z.number(),
    userId: z.number(),
    title: z.string(),
    content: z.string(),
    audioUrl: z.string().nullable(),
    audioDuration: z.number().nullable(),
    isFavorite: z.boolean(),
    createdAt: z.date(),
    tags: z.array(z.string()).nullable(),
  }),
  interpretation: z.object({
    id: z.number(),
    dreamId: z.number(),
    interpretation: z.string(),
    createdAt: z.date(),
    insights: z.any().nullable(),
  }).nullable(),
  imageGeneration: z.object({
    id: z.number(),
    dreamId: z.number(),
    imageUrl: z.string(),
    style: z.string(),
    prompt: z.string(),
    createdAt: z.date(),
  }).nullable(),
});

export type DreamWithRelations = z.infer<typeof dreamWithRelations>;
