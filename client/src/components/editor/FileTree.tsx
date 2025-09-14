import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Search, MoreHorizontal, FileText, Settings, Code, Brackets, Database } from "lucide-react";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  isOpen?: boolean;
  gitStatus?: "modified" | "added" | "deleted" | "untracked";
}

interface FileTreeProps {
  files: FileNode[];
  selectedFile?: string;
  onFileSelect: (path: string) => void;
  onFileCreate?: (parentPath: string, type: "file" | "folder") => void;
  onFileRename?: (path: string, newName: string) => void;
  onFileDelete?: (path: string) => void;
}

export function FileTree({
  files,
  selectedFile,
  onFileSelect,
  onFileCreate,
  onFileRename,
  onFileDelete,
}: FileTreeProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src"]));

  const getFileIcon = (fileName: string, type: "file" | "folder", isOpen?: boolean) => {
    if (type === "folder") {
      return isOpen ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />;
    }

    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case "ts":
      case "tsx":
      case "js":
      case "jsx":
        return <Code className="w-4 h-4 text-blue-500" />;
      case "json":
        return <Brackets className="w-4 h-4 text-yellow-500" />;
      case "md":
        return <FileText className="w-4 h-4 text-green-500" />;
      case "sql":
        return <Database className="w-4 h-4 text-purple-500" />;
      case "css":
      case "scss":
        return <Settings className="w-4 h-4 text-pink-500" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const getGitStatusColor = (status?: string) => {
    switch (status) {
      case "modified":
        return "text-yellow-500";
      case "added":
        return "text-green-500";
      case "deleted":
        return "text-red-500";
      case "untracked":
        return "text-blue-500";
      default:
        return "";
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileNode = (node: FileNode, depth = 0) => {
    const isSelected = selectedFile === node.path;
    const isExpanded = expandedFolders.has(node.path);
    const shouldShow = !searchTerm || node.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!shouldShow) return null;

    return (
      <div key={node.id}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={`flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover-elevate ${
                isSelected ? "bg-accent text-accent-foreground" : ""
              }`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={() => {
                if (node.type === "folder") {
                  toggleFolder(node.path);
                } else {
                  console.log(`File selected: ${node.path}`);
                  onFileSelect(node.path);
                }
              }}
              data-testid={`${node.type}-${node.name}`}
            >
              {node.type === "folder" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-4 h-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(node.path);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </Button>
              )}
              {node.type === "file" && <div className="w-4" />}

              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getFileIcon(node.name, node.type, isExpanded)}
                <span className={`truncate ${getGitStatusColor(node.gitStatus)}`}>
                  {node.name}
                </span>
                {node.gitStatus && (
                  <Badge variant="outline" className="text-xs h-4 px-1">
                    {node.gitStatus[0].toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => {
                console.log(`Create file in ${node.path}`);
                onFileCreate?.(node.path, "file");
              }}
              data-testid="button-create-file"
            >
              <Plus className="w-4 h-4 mr-2" />
              New File
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                console.log(`Create folder in ${node.path}`);
                onFileCreate?.(node.path, "folder");
              }}
              data-testid="button-create-folder"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => {
                console.log(`Rename ${node.path}`);
                onFileRename?.(node.path, node.name);
              }}
              data-testid="button-rename"
            >
              Rename
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                console.log(`Delete ${node.path}`);
                onFileDelete?.(node.path);
              }}
              className="text-destructive"
              data-testid="button-delete"
            >
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {node.type === "folder" && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col" data-testid="file-tree">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-sm font-medium">Explorer</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={() => {
                console.log("More options clicked");
              }}
              data-testid="button-more-options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>More options</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8"
            data-testid="input-search-files"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto">
        {files.map((node) => renderFileNode(node))}
      </div>
    </div>
  );
}