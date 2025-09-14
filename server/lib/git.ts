import { simpleGit, SimpleGit, StatusResult, BranchSummary } from "simple-git";
import path from "path";
import { GitFile, GitBranch, GitStatus } from "@shared/schema";

export class GitManager {
  private git: SimpleGit;
  private workspaceRoot: string;

  constructor(workspaceRoot: string = "./workspace") {
    this.workspaceRoot = path.resolve(workspaceRoot);
    this.git = simpleGit(this.workspaceRoot);
  }

  /**
   * Initialize Git repository if it doesn't exist
   */
  async initializeRepository(): Promise<void> {
    try {
      // Check if git repository exists
      const isRepo = await this.git.checkIsRepo();
      
      if (!isRepo) {
        console.log("Initializing Git repository in:", this.workspaceRoot);
        await this.git.init();
        
        // Set initial configuration
        await this.git.addConfig('user.name', 'JellyAI User');
        await this.git.addConfig('user.email', 'user@jellyai.dev');
        
        // Create initial commit if no commits exist
        try {
          await this.git.log({ maxCount: 1 });
        } catch (error) {
          // No commits exist, create initial commit
          await this.git.add('.gitignore');
          await this.git.commit('Initial commit', [], { '--allow-empty': null });
        }
      }
    } catch (error) {
      console.error("Failed to initialize Git repository:", error);
      throw new Error(`Git initialization failed: ${error}`);
    }
  }

  /**
   * Get comprehensive Git status including files and branch information
   */
  async getStatus(): Promise<GitStatus> {
    try {
      await this.initializeRepository();
      
      const [status, branches] = await Promise.all([
        this.git.status(),
        this.getBranches()
      ]);

      const currentBranch = branches.find(b => b.current)?.name || 'main';
      
      // Calculate ahead/behind commits
      let ahead = 0;
      let behind = 0;
      
      try {
        const tracking = status.tracking;
        if (tracking) {
          const branchStatus = await this.git.status(['--ahead-behind']);
          ahead = branchStatus.ahead || 0;
          behind = branchStatus.behind || 0;
        }
      } catch (error) {
        // No remote tracking branch
        console.log("No remote tracking branch found");
      }

      // Process files
      const files: GitFile[] = [];
      
      // Modified files
      status.modified.forEach(file => {
        files.push({
          path: file,
          status: "modified",
          staged: false,
        });
      });

      // Added/new files in staging area
      status.staged.forEach(file => {
        files.push({
          path: file,
          status: "added",
          staged: true,
        });
      });

      // Files in staging area (including modified)
      status.staged.forEach(file => {
        const existingFile = files.find(f => f.path === file);
        if (existingFile) {
          existingFile.staged = true;
        }
      });

      // Deleted files
      status.deleted.forEach(file => {
        files.push({
          path: file,
          status: "deleted",
          staged: false,
        });
      });

      // Untracked files
      status.not_added.forEach(file => {
        files.push({
          path: file,
          status: "untracked",
          staged: false,
        });
      });

      // Renamed files
      status.renamed.forEach(rename => {
        files.push({
          path: rename.to || rename.from,
          status: "renamed",
          staged: true,
        });
      });

      return {
        branch: currentBranch,
        ahead,
        behind,
        files,
        staged: files.filter(f => f.staged).length,
        modified: status.modified.length,
        untracked: status.not_added.length,
      };
    } catch (error) {
      console.error("Failed to get Git status:", error);
      throw new Error(`Failed to get Git status: ${error}`);
    }
  }

  /**
   * Get all branches with current branch marked
   */
  async getBranches(): Promise<GitBranch[]> {
    try {
      await this.initializeRepository();
      
      const branchSummary: BranchSummary = await this.git.branch(['-a']);
      const branches: GitBranch[] = [];

      // Process local branches
      Object.entries(branchSummary.branches).forEach(([name, branch]) => {
        if (!name.startsWith('remotes/')) {
          branches.push({
            name,
            current: branch.current,
            ahead: 0, // Will be calculated if needed
            behind: 0, // Will be calculated if needed
          });
        }
      });

      // Ensure we have at least one branch
      if (branches.length === 0) {
        branches.push({
          name: 'main',
          current: true,
          ahead: 0,
          behind: 0,
        });
      }

      return branches;
    } catch (error) {
      console.error("Failed to get branches:", error);
      throw new Error(`Failed to get branches: ${error}`);
    }
  }

  /**
   * Stage files for commit
   */
  async stageFiles(filePaths: string[]): Promise<void> {
    try {
      await this.initializeRepository();
      
      if (filePaths.length === 0) {
        throw new Error("No files specified for staging");
      }

      await this.git.add(filePaths);
      console.log("Staged files:", filePaths);
    } catch (error) {
      console.error("Failed to stage files:", error);
      throw new Error(`Failed to stage files: ${error}`);
    }
  }

  /**
   * Unstage files
   */
  async unstageFiles(filePaths: string[]): Promise<void> {
    try {
      await this.initializeRepository();
      
      if (filePaths.length === 0) {
        throw new Error("No files specified for unstaging");
      }

      await this.git.reset(['HEAD', ...filePaths]);
      console.log("Unstaged files:", filePaths);
    } catch (error) {
      console.error("Failed to unstage files:", error);
      throw new Error(`Failed to unstage files: ${error}`);
    }
  }

  /**
   * Commit staged changes
   */
  async commit(message: string): Promise<void> {
    try {
      await this.initializeRepository();
      
      if (!message.trim()) {
        throw new Error("Commit message is required");
      }

      // Check if there are staged changes
      const status = await this.git.status();
      if (status.staged.length === 0) {
        throw new Error("No staged changes to commit");
      }

      await this.git.commit(message);
      console.log("Committed with message:", message);
    } catch (error) {
      console.error("Failed to commit:", error);
      throw new Error(`Failed to commit: ${error}`);
    }
  }

  /**
   * Switch to a different branch
   */
  async switchBranch(branchName: string): Promise<void> {
    try {
      await this.initializeRepository();
      
      const branches = await this.getBranches();
      const targetBranch = branches.find(b => b.name === branchName);
      
      if (!targetBranch) {
        // Create new branch
        await this.git.checkoutLocalBranch(branchName);
        console.log("Created and switched to new branch:", branchName);
      } else {
        // Switch to existing branch
        await this.git.checkout(branchName);
        console.log("Switched to branch:", branchName);
      }
    } catch (error) {
      console.error("Failed to switch branch:", error);
      throw new Error(`Failed to switch branch: ${error}`);
    }
  }

  /**
   * Pull changes from remote repository
   */
  async pull(): Promise<void> {
    try {
      await this.initializeRepository();
      
      // Check if remote exists
      const remotes = await this.git.getRemotes(true);
      if (remotes.length === 0) {
        throw new Error("No remote repository configured");
      }

      await this.git.pull();
      console.log("Successfully pulled changes from remote");
    } catch (error) {
      console.error("Failed to pull:", error);
      throw new Error(`Failed to pull: ${error}`);
    }
  }

  /**
   * Push changes to remote repository
   */
  async push(): Promise<void> {
    try {
      await this.initializeRepository();
      
      // Check if remote exists
      const remotes = await this.git.getRemotes(true);
      if (remotes.length === 0) {
        throw new Error("No remote repository configured");
      }

      // Get current branch
      const status = await this.git.status();
      const currentBranch = status.current;
      
      if (!currentBranch) {
        throw new Error("No current branch found");
      }

      await this.git.push('origin', currentBranch);
      console.log("Successfully pushed changes to remote");
    } catch (error) {
      console.error("Failed to push:", error);
      throw new Error(`Failed to push: ${error}`);
    }
  }

  /**
   * Get file diff for a specific file
   */
  async getFileDiff(filePath: string): Promise<string> {
    try {
      await this.initializeRepository();
      
      const diff = await this.git.diff([filePath]);
      return diff;
    } catch (error) {
      console.error("Failed to get file diff:", error);
      throw new Error(`Failed to get file diff: ${error}`);
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(branchName: string): Promise<void> {
    try {
      await this.initializeRepository();
      
      await this.git.checkoutLocalBranch(branchName);
      console.log("Created new branch:", branchName);
    } catch (error) {
      console.error("Failed to create branch:", error);
      throw new Error(`Failed to create branch: ${error}`);
    }
  }

  /**
   * Delete a branch
   */
  async deleteBranch(branchName: string): Promise<void> {
    try {
      await this.initializeRepository();
      
      const currentBranch = (await this.git.status()).current;
      if (currentBranch === branchName) {
        throw new Error("Cannot delete the current branch");
      }

      await this.git.deleteLocalBranch(branchName);
      console.log("Deleted branch:", branchName);
    } catch (error) {
      console.error("Failed to delete branch:", error);
      throw new Error(`Failed to delete branch: ${error}`);
    }
  }

  /**
   * Get commit history
   */
  async getCommitHistory(limit: number = 10): Promise<any[]> {
    try {
      await this.initializeRepository();
      
      const log = await this.git.log({ maxCount: limit });
      return log.all.map(commit => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        date: commit.date,
      }));
    } catch (error) {
      console.error("Failed to get commit history:", error);
      throw new Error(`Failed to get commit history: ${error}`);
    }
  }
}