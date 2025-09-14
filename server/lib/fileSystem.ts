import fs from "fs/promises";
import path from "path";
import { promisify } from "util";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  size?: number;
  lastModified?: Date;
}

export class FileSystemManager {
  private workspaceRoot: string;

  constructor(workspaceRoot: string = "./workspace") {
    this.workspaceRoot = path.resolve(workspaceRoot);
  }

  private getFullPath(relativePath: string): string {
    const fullPath = path.resolve(this.workspaceRoot, relativePath);
    // Security check: ensure path is within workspace
    if (!fullPath.startsWith(this.workspaceRoot)) {
      throw new Error("Path outside workspace not allowed");
    }
    return fullPath;
  }

  async ensureWorkspace(): Promise<void> {
    try {
      await fs.access(this.workspaceRoot);
    } catch {
      await fs.mkdir(this.workspaceRoot, { recursive: true });
      // Create sample project structure
      await this.createSampleProject();
    }
  }

  private async createSampleProject(): Promise<void> {
    const sampleFiles = [
      {
        path: "src/App.tsx",
        content: `import React from 'react';
import { Button } from './components/Button';

function App() {
  return (
    <div className="app">
      <h1>Welcome to JellyAI</h1>
      <Button onClick={() => console.log('Hello!')}>
        Click me
      </Button>
    </div>
  );
}

export default App;`,
      },
      {
        path: "src/components/Button.tsx",
        content: `interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}`,
      },
      {
        path: "package.json",
        content: JSON.stringify({
          name: "sample-project",
          version: "1.0.0",
          description: "A sample project for JellyAI",
          main: "src/App.tsx",
          scripts: {
            start: "react-scripts start",
            build: "react-scripts build",
            test: "react-scripts test",
          },
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0",
          },
        }, null, 2),
      },
      {
        path: "README.md",
        content: `# Sample Project

This is a sample project created by JellyAI.

## Getting Started

1. Install dependencies: \`npm install\`
2. Start development server: \`npm start\`
3. Open http://localhost:3000 to view in browser

## Features

- React components
- TypeScript support
- Modern development setup
`,
      },
    ];

    for (const file of sampleFiles) {
      await this.writeFile(file.path, file.content);
    }
  }

  async readFile(relativePath: string): Promise<string> {
    const fullPath = this.getFullPath(relativePath);
    try {
      return await fs.readFile(fullPath, "utf-8");
    } catch (error) {
      throw new Error(`Failed to read file ${relativePath}: ${error}`);
    }
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = this.getFullPath(relativePath);
    const dir = path.dirname(fullPath);
    
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, content, "utf-8");
    } catch (error) {
      throw new Error(`Failed to write file ${relativePath}: ${error}`);
    }
  }

  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = this.getFullPath(relativePath);
    try {
      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
        await fs.rmdir(fullPath, { recursive: true });
      } else {
        await fs.unlink(fullPath);
      }
    } catch (error) {
      throw new Error(`Failed to delete ${relativePath}: ${error}`);
    }
  }

  async listFiles(relativePath: string = ""): Promise<FileNode[]> {
    const fullPath = this.getFullPath(relativePath);
    
    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      const nodes: FileNode[] = [];

      for (const entry of entries) {
        const entryPath = path.join(relativePath, entry.name);
        const fullEntryPath = this.getFullPath(entryPath);
        const stats = await fs.stat(fullEntryPath);

        const node: FileNode = {
          name: entry.name,
          path: entryPath,
          type: entry.isDirectory() ? "folder" : "file",
          lastModified: stats.mtime,
        };

        if (entry.isFile()) {
          node.size = stats.size;
        } else if (entry.isDirectory()) {
          // Recursively list subdirectories
          node.children = await this.listFiles(entryPath);
        }

        nodes.push(node);
      }

      return nodes.sort((a, b) => {
        // Folders first, then files, alphabetically
        if (a.type !== b.type) {
          return a.type === "folder" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      throw new Error(`Failed to list files in ${relativePath}: ${error}`);
    }
  }

  async createFolder(relativePath: string): Promise<void> {
    const fullPath = this.getFullPath(relativePath);
    try {
      await fs.mkdir(fullPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create folder ${relativePath}: ${error}`);
    }
  }

  async fileExists(relativePath: string): Promise<boolean> {
    const fullPath = this.getFullPath(relativePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  getWorkspaceRoot(): string {
    return this.workspaceRoot;
  }
}