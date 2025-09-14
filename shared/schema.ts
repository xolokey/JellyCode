import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  path: text("path").notNull(),
  content: text("content").notNull(),
  projectId: varchar("project_id").references(() => projects.id),
  lastModified: timestamp("last_modified").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
});

export const insertFileSchema = createInsertSchema(files).pick({
  path: true,
  content: true,
  projectId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

// API request/response schemas
export const llmRequestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  context: z.string().optional(),
  action: z.enum(["explain", "refactor", "generate-tests", "optimize"]).optional(),
});

export const fileOperationSchema = z.object({
  path: z.string().min(1),
  content: z.string().optional(),
  operation: z.enum(["read", "write", "delete", "list"]),
});

export type LLMRequest = z.infer<typeof llmRequestSchema>;
export type FileOperation = z.infer<typeof fileOperationSchema>;

// Git-related schemas
export const gitFileSchema = z.object({
  path: z.string(),
  status: z.enum(["modified", "added", "deleted", "untracked", "renamed"]),
  staged: z.boolean(),
  additions: z.number().optional(),
  deletions: z.number().optional(),
});

export const gitBranchSchema = z.object({
  name: z.string(),
  current: z.boolean(),
  ahead: z.number().optional(),
  behind: z.number().optional(),
});

export const gitStatusSchema = z.object({
  branch: z.string(),
  ahead: z.number(),
  behind: z.number(),
  files: z.array(gitFileSchema),
  staged: z.number(),
  modified: z.number(),
  untracked: z.number(),
});

export const gitStageRequestSchema = z.object({
  files: z.array(z.string()),
});

export const gitCommitRequestSchema = z.object({
  message: z.string().min(1).max(500),
});

export type GitFile = z.infer<typeof gitFileSchema>;
export type GitBranch = z.infer<typeof gitBranchSchema>;
export type GitStatus = z.infer<typeof gitStatusSchema>;
export type GitStageRequest = z.infer<typeof gitStageRequestSchema>;
export type GitCommitRequest = z.infer<typeof gitCommitRequestSchema>;
