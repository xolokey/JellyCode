import { LLMRequest, FileOperation, GitStatus, GitBranch, GitStageRequest, GitCommitRequest } from "@shared/schema";

export class APIClient {
  private baseURL = "/api";

  private async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Include cookies for session auth
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // File operations
  async readFile(path: string): Promise<{ content: string }> {
    const operation: FileOperation = { path, operation: "read" };
    return this.request("POST", "/files", operation);
  }

  async writeFile(path: string, content: string): Promise<{ success: boolean; message: string }> {
    const operation: FileOperation = { path, content, operation: "write" };
    return this.request("POST", "/files", operation);
  }

  async deleteFile(path: string): Promise<{ success: boolean; message: string }> {
    const operation: FileOperation = { path, operation: "delete" };
    return this.request("POST", "/files", operation);
  }

  async listFiles(path: string = ""): Promise<{ files: any[] }> {
    const operation: FileOperation = { path, operation: "list" };
    return this.request("POST", "/files", operation);
  }

  async getFileTree(): Promise<{ files: any[] }> {
    return this.request("GET", "/files/tree");
  }

  async createFolder(path: string): Promise<{ success: boolean; message: string }> {
    return this.request("POST", "/files/folder", { path });
  }

  // AI operations
  async sendLLMRequest(request: LLMRequest): Promise<any> {
    return this.request("POST", "/llm", request);
  }

  async explainCode(code: string): Promise<any> {
    return this.sendLLMRequest({
      prompt: code,
      action: "explain",
    });
  }

  async refactorCode(code: string, context?: string): Promise<any> {
    return this.sendLLMRequest({
      prompt: code,
      context,
      action: "refactor",
    });
  }

  async generateTests(code: string): Promise<any> {
    return this.sendLLMRequest({
      prompt: code,
      action: "generate-tests",
    });
  }

  async optimizeCode(code: string): Promise<any> {
    return this.sendLLMRequest({
      prompt: code,
      action: "optimize",
    });
  }

  async chatCompletion(prompt: string, context?: string): Promise<any> {
    return this.sendLLMRequest({
      prompt,
      context,
    });
  }

  // Auth operations
  async getCurrentUser(): Promise<any> {
    return this.request("GET", "/user");
  }

  async login(username: string, password: string): Promise<any> {
    return this.request("POST", "/login", { username, password });
  }

  async register(username: string, password: string): Promise<any> {
    return this.request("POST", "/register", { username, password });
  }

  async logout(): Promise<void> {
    return this.request("POST", "/logout");
  }

  // Git operations
  async getGitStatus(): Promise<GitStatus> {
    return this.request("GET", "/git/status");
  }

  async getGitBranches(): Promise<{ branches: GitBranch[] }> {
    return this.request("GET", "/git/branches");
  }

  async stageFiles(files: string[]): Promise<{ success: boolean; message: string }> {
    const request: GitStageRequest = { files };
    return this.request("POST", "/git/stage", request);
  }

  async unstageFiles(files: string[]): Promise<{ success: boolean; message: string }> {
    const request: GitStageRequest = { files };
    return this.request("POST", "/git/unstage", request);
  }

  async commitChanges(message: string): Promise<{ success: boolean; message: string }> {
    const request: GitCommitRequest = { message };
    return this.request("POST", "/git/commit", request);
  }

  async switchBranch(branchName: string): Promise<{ success: boolean; message: string }> {
    return this.request("POST", "/git/branch/switch", { branchName });
  }

  async createBranch(branchName: string): Promise<{ success: boolean; message: string }> {
    return this.request("POST", "/git/branch/create", { branchName });
  }

  async pullChanges(): Promise<{ success: boolean; message: string }> {
    return this.request("POST", "/git/pull");
  }

  async pushChanges(): Promise<{ success: boolean; message: string }> {
    return this.request("POST", "/git/push");
  }

  async getFileDiff(filePath: string): Promise<{ diff: string }> {
    return this.request("GET", `/git/diff/${encodeURIComponent(filePath)}`);
  }

  async getCommitHistory(limit: number = 10): Promise<{ commits: any[] }> {
    return this.request("GET", `/git/history?limit=${limit}`);
  }
}

export const apiClient = new APIClient();