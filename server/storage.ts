import { type User, type InsertUser, type Project, type InsertProject, type File, type InsertFile } from "@shared/schema";
import { randomUUID } from "crypto";
// Integration blueprint: javascript_auth_all_persistance
import session from "express-session";
import createMemoryStore from "memorystore";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private files: Map<string, File>;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.files = new Map();
    // Integration blueprint: javascript_auth_all_persistance
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId,
    );
  }

  async createProject(projectData: InsertProject & { userId: string }): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...projectData,
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    // Delete all files in the project first
    const projectFiles = Array.from(this.files.values()).filter(
      (file) => file.projectId === id,
    );
    for (const file of projectFiles) {
      this.files.delete(file.id);
    }
    this.projects.delete(id);
  }

  // File methods
  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getProjectFiles(projectId: string): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.projectId === projectId,
    );
  }

  async getFileByPath(projectId: string, path: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.projectId === projectId && file.path === path,
    );
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = randomUUID();
    const file: File = {
      ...insertFile,
      id,
      projectId: insertFile.projectId || null,
      lastModified: new Date(),
    };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: string, content: string): Promise<File> {
    const file = this.files.get(id);
    if (!file) {
      throw new Error("File not found");
    }
    const updatedFile: File = {
      ...file,
      content,
      lastModified: new Date(),
    };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: string): Promise<void> {
    this.files.delete(id);
  }
}

export const storage = new MemStorage();
