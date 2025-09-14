import { type User, type InsertUser, type Project, type InsertProject, type File, type InsertFile, users, projects, files } from "@shared/schema";
import { randomUUID } from "crypto";
// Integration blueprint: javascript_auth_all_persistance
import session from "express-session";
import createMemoryStore from "memorystore";
// Integration blueprint: javascript_database
import { db } from "./db";
import { eq, and } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project management
  getProject(id: string): Promise<Project | undefined>;
  getUserProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject & { userId: string }): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // File management
  getFile(id: string): Promise<File | undefined>;
  getProjectFiles(projectId: string): Promise<File[]>;
  getFileByPath(projectId: string, path: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, content: string): Promise<File>;
  deleteFile(id: string): Promise<void>;
  
  // Session management - Integration blueprint: javascript_auth_all_persistance
  sessionStore: session.Store;
}

// Integration blueprint: javascript_database
export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Integration blueprint: javascript_auth_all_persistance
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    const userProjects = await db.select().from(projects).where(eq(projects.userId, userId));
    return userProjects;
  }

  async createProject(projectData: InsertProject & { userId: string }): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(projectData)
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    // Delete all files in the project first
    await db.delete(files).where(eq(files.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));
  }

  // File methods
  async getFile(id: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }

  async getProjectFiles(projectId: string): Promise<File[]> {
    const projectFiles = await db.select().from(files).where(eq(files.projectId, projectId));
    return projectFiles;
  }

  async getFileByPath(projectId: string, path: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(
      and(eq(files.projectId, projectId), eq(files.path, path))
    );
    return file || undefined;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const [file] = await db
      .insert(files)
      .values(insertFile)
      .returning();
    return file;
  }

  async updateFile(id: string, content: string): Promise<File> {
    const [file] = await db
      .update(files)
      .set({ content, lastModified: new Date() })
      .where(eq(files.id, id))
      .returning();
    
    if (!file) {
      throw new Error("File not found");
    }
    return file;
  }

  async deleteFile(id: string): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }
}

export const storage = new DatabaseStorage();
