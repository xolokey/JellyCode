import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { FileSystemManager } from "./lib/fileSystem";
import { AICodeAssistant } from "./lib/openai";
import { llmRequestSchema, fileOperationSchema } from "@shared/schema";
import { setupAuth } from "./auth";

const fileManager = new FileSystemManager();
const aiAssistant = new AICodeAssistant();

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

  // WebSocket will be added in next task
  const httpServer = createServer(app);

  return httpServer;
}
