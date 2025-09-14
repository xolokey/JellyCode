import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { FileSystemManager } from "./lib/fileSystem";
import { AICodeAssistant } from "./lib/openai";
import { GitManager } from "./lib/git";
import { llmRequestSchema, fileOperationSchema, gitStageRequestSchema, gitCommitRequestSchema } from "@shared/schema";
import { setupAuth } from "./auth";

const fileManager = new FileSystemManager();
const aiAssistant = new AICodeAssistant();
const gitManager = new GitManager();

// Rate limiting for LLM requests
const llmRequestCounts = new Map<string, { count: number; resetTime: number }>();
const LLM_RATE_LIMIT = 10; // requests per minute
const LLM_RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = llmRequestCounts.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    llmRequestCounts.set(userId, { count: 1, resetTime: now + LLM_RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= LLM_RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize workspace
  await fileManager.ensureWorkspace();
  
  // Integration blueprint: javascript_auth_all_persistance
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // LLM Proxy Endpoint
  app.post("/api/llm", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = req.user?.id;
      if (!checkRateLimit(userId)) {
        return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
      }

      const result = llmRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request", details: result.error.errors });
      }

      const { prompt, context, action } = result.data;
      let response: any;

      switch (action) {
        case "explain":
          response = await aiAssistant.explainCode(prompt, "typescript");
          break;
        case "refactor":
          response = await aiAssistant.refactorCode(prompt, "typescript", context);
          break;
        case "generate-tests":
          response = await aiAssistant.generateTests(prompt, "typescript");
          break;
        case "optimize":
          response = await aiAssistant.optimizeCode(prompt, "typescript");
          break;
        default:
          response = { message: await aiAssistant.chatCompletion(prompt, context) };
      }

      res.json(response);
    } catch (error) {
      console.error("LLM request error:", error);
      res.status(500).json({ error: "Failed to process LLM request" });
    }
  });

  // File Operations
  app.post("/api/files", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const result = fileOperationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request", details: result.error.errors });
      }

      const { path, content, operation } = result.data;

      switch (operation) {
        case "read":
          const fileContent = await fileManager.readFile(path);
          res.json({ content: fileContent });
          break;

        case "write":
          if (!content) {
            return res.status(400).json({ error: "Content required for write operation" });
          }
          await fileManager.writeFile(path, content);
          res.json({ success: true, message: "File written successfully" });
          break;

        case "delete":
          await fileManager.deleteFile(path);
          res.json({ success: true, message: "File deleted successfully" });
          break;

        case "list":
          const files = await fileManager.listFiles(path);
          res.json({ files });
          break;

        default:
          res.status(400).json({ error: "Invalid operation" });
      }
    } catch (error) {
      console.error("File operation error:", error);
      res.status(500).json({ error: (error as Error).message || "File operation failed" });
    }
  });

  // Get file tree
  app.get("/api/files/tree", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const files = await fileManager.listFiles();
      res.json({ files });
    } catch (error) {
      console.error("File tree error:", error);
      res.status(500).json({ error: "Failed to get file tree" });
    }
  });

  // Create folder
  app.post("/api/files/folder", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { path } = req.body;
      if (!path) {
        return res.status(400).json({ error: "Path required" });
      }

      await fileManager.createFolder(path);
      res.json({ success: true, message: "Folder created successfully" });
    } catch (error) {
      console.error("Create folder error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to create folder" });
    }
  });

  // Git Operations
  
  // Get Git status
  app.get("/api/git/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const status = await gitManager.getStatus();
      res.json(status);
    } catch (error) {
      console.error("Git status error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to get Git status" });
    }
  });

  // Get Git branches
  app.get("/api/git/branches", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const branches = await gitManager.getBranches();
      res.json({ branches });
    } catch (error) {
      console.error("Git branches error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to get Git branches" });
    }
  });

  // Stage files
  app.post("/api/git/stage", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const result = gitStageRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request", details: result.error.errors });
      }

      const { files } = result.data;
      await gitManager.stageFiles(files);
      res.json({ success: true, message: `Staged ${files.length} file(s)` });
    } catch (error) {
      console.error("Git stage error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to stage files" });
    }
  });

  // Unstage files
  app.post("/api/git/unstage", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const result = gitStageRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request", details: result.error.errors });
      }

      const { files } = result.data;
      await gitManager.unstageFiles(files);
      res.json({ success: true, message: `Unstaged ${files.length} file(s)` });
    } catch (error) {
      console.error("Git unstage error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to unstage files" });
    }
  });

  // Commit changes
  app.post("/api/git/commit", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const result = gitCommitRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request", details: result.error.errors });
      }

      const { message } = result.data;
      await gitManager.commit(message);
      res.json({ success: true, message: "Changes committed successfully" });
    } catch (error) {
      console.error("Git commit error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to commit changes" });
    }
  });

  // Switch branch
  app.post("/api/git/branch/switch", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { branchName } = req.body;
      if (!branchName) {
        return res.status(400).json({ error: "Branch name required" });
      }

      await gitManager.switchBranch(branchName);
      res.json({ success: true, message: `Switched to branch: ${branchName}` });
    } catch (error) {
      console.error("Git branch switch error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to switch branch" });
    }
  });

  // Create branch
  app.post("/api/git/branch/create", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { branchName } = req.body;
      if (!branchName) {
        return res.status(400).json({ error: "Branch name required" });
      }

      await gitManager.createBranch(branchName);
      res.json({ success: true, message: `Created branch: ${branchName}` });
    } catch (error) {
      console.error("Git create branch error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to create branch" });
    }
  });

  // Pull changes
  app.post("/api/git/pull", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      await gitManager.pull();
      res.json({ success: true, message: "Changes pulled successfully" });
    } catch (error) {
      console.error("Git pull error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to pull changes" });
    }
  });

  // Push changes
  app.post("/api/git/push", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      await gitManager.push();
      res.json({ success: true, message: "Changes pushed successfully" });
    } catch (error) {
      console.error("Git push error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to push changes" });
    }
  });

  // Get file diff
  app.get("/api/git/diff/:path(*)", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const filePath = req.params.path;
      if (!filePath) {
        return res.status(400).json({ error: "File path required" });
      }

      const diff = await gitManager.getFileDiff(filePath);
      res.json({ diff });
    } catch (error) {
      console.error("Git diff error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to get file diff" });
    }
  });

  // Get commit history
  app.get("/api/git/history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const history = await gitManager.getCommitHistory(limit);
      res.json({ commits: history });
    } catch (error) {
      console.error("Git history error:", error);
      res.status(500).json({ error: (error as Error).message || "Failed to get commit history" });
    }
  });

  // WebSocket will be added in next task
  const httpServer = createServer(app);

  return httpServer;
}
