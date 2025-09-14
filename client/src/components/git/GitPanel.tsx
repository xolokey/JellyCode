import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { GitBranch, GitCommit, GitPullRequest, GitMerge, Plus, Minus, ChevronDown, MoreHorizontal, RefreshCw, Eye, FileText } from "lucide-react";

interface GitFile {
  id: string;
  path: string;
  status: "modified" | "added" | "deleted" | "untracked" | "renamed";
  staged: boolean;
  additions?: number;
  deletions?: number;
}

interface GitBranch {
  name: string;
  current: boolean;
  ahead?: number;
  behind?: number;
}

interface GitPanelProps {
  currentBranch?: string;
  branches?: GitBranch[];
  files?: GitFile[];
  onStageFile?: (fileId: string) => void;
  onUnstageFile?: (fileId: string) => void;
  onCommit?: (message: string) => void;
  onPush?: () => void;
  onPull?: () => void;
  onBranchSwitch?: (branchName: string) => void;
  onViewDiff?: (fileId: string) => void;
}

export function GitPanel({
  currentBranch = "main",
  branches = [
    { name: "main", current: true, ahead: 2, behind: 0 },
    { name: "feature/ai-improvements", current: false },
    { name: "bugfix/editor-tabs", current: false },
  ],
  files = [
    {
      id: "1",
      path: "src/components/Editor.tsx",
      status: "modified",
      staged: false,
      additions: 15,
      deletions: 3,
    },
    {
      id: "2",
      path: "src/lib/ai.ts",
      status: "added",
      staged: true,
      additions: 42,
    },
    {
      id: "3",
      path: "package.json",
      status: "modified",
      staged: true,
      additions: 2,
      deletions: 1,
    },
    {
      id: "4",
      path: "src/old-component.tsx",
      status: "deleted",
      staged: false,
      deletions: 25,
    },
  ],
  onStageFile,
  onUnstageFile,
  onCommit,
  onPush,
  onPull,
  onBranchSwitch,
  onViewDiff,
}: GitPanelProps) {
  const [commitMessage, setCommitMessage] = useState("");
  const [showAllBranches, setShowAllBranches] = useState(false);

  const stagedFiles = files.filter(f => f.staged);
  const unstagedFiles = files.filter(f => !f.staged);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "modified":
        return <FileText className="w-4 h-4 text-yellow-500" />;
      case "added":
        return <Plus className="w-4 h-4 text-green-500" />;
      case "deleted":
        return <Minus className="w-4 h-4 text-red-500" />;
      case "untracked":
        return <Plus className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  const handleCommit = () => {
    if (!commitMessage.trim() || stagedFiles.length === 0) return;
    console.log("Committing with message:", commitMessage);
    onCommit?.(commitMessage);
    setCommitMessage("");
  };

  const handleStageAll = () => {
    unstagedFiles.forEach(file => {
      console.log("Staging file:", file.id);
      onStageFile?.(file.id);
    });
  };

  const handleUnstageAll = () => {
    stagedFiles.forEach(file => {
      console.log("Unstaging file:", file.id);
      onUnstageFile?.(file.id);
    });
  };

  return (
    <div className="h-full flex flex-col" data-testid="git-panel">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4" />
          <span className="font-medium">Source Control</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => {
                  console.log("Refresh git status");
                }}
                data-testid="button-refresh-git"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-6 h-6" data-testid="button-git-menu">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem data-testid="button-view-history">
                View History
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="button-git-settings">
                Git Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Branch Info */}
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between w-full" data-testid="button-branch-selector">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    <span>{currentBranch}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {branches.map((branch) => (
                  <DropdownMenuItem
                    key={branch.name}
                    onClick={() => {
                      console.log("Switch to branch:", branch.name);
                      onBranchSwitch?.(branch.name);
                    }}
                    className="flex items-center justify-between"
                    data-testid={`branch-${branch.name}`}
                  >
                    <span className={branch.current ? "font-medium" : ""}>
                      {branch.name}
                    </span>
                    {branch.current && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Sync Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Pull changes");
                onPull?.();
              }}
              className="flex-1"
              data-testid="button-pull"
            >
              <GitPullRequest className="w-4 h-4 mr-1" />
              Pull
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Push changes");
                onPush?.();
              }}
              className="flex-1"
              data-testid="button-push"
            >
              <GitMerge className="w-4 h-4 mr-1" />
              Push
            </Button>
          </div>
        </div>

        <Separator />

        {/* Staged Changes */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Staged Changes ({stagedFiles.length})</span>
            {stagedFiles.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnstageAll}
                data-testid="button-unstage-all"
              >
                Unstage All
              </Button>
            )}
          </div>
          
          <div className="space-y-1">
            {stagedFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-2 p-2 rounded hover-elevate">
                <Checkbox
                  checked={true}
                  onCheckedChange={() => {
                    console.log("Unstage file:", file.id);
                    onUnstageFile?.(file.id);
                  }}
                  data-testid={`checkbox-staged-${file.id}`}
                />
                {getStatusIcon(file.status)}
                <span className={`flex-1 text-sm truncate ${getStatusColor(file.status)}`}>
                  {file.path}
                </span>
                <Badge variant="outline" className="text-xs">
                  {file.status[0].toUpperCase()}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => {
                        console.log("View diff for:", file.id);
                        onViewDiff?.(file.id);
                      }}
                      data-testid={`button-view-diff-staged-${file.id}`}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View diff</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Unstaged Changes */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Changes ({unstagedFiles.length})</span>
            {unstagedFiles.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStageAll}
                data-testid="button-stage-all"
              >
                Stage All
              </Button>
            )}
          </div>
          
          <div className="space-y-1">
            {unstagedFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-2 p-2 rounded hover-elevate">
                <Checkbox
                  checked={false}
                  onCheckedChange={() => {
                    console.log("Stage file:", file.id);
                    onStageFile?.(file.id);
                  }}
                  data-testid={`checkbox-unstaged-${file.id}`}
                />
                {getStatusIcon(file.status)}
                <span className={`flex-1 text-sm truncate ${getStatusColor(file.status)}`}>
                  {file.path}
                </span>
                <Badge variant="outline" className="text-xs">
                  {file.status[0].toUpperCase()}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => {
                        console.log("View diff for:", file.id);
                        onViewDiff?.(file.id);
                      }}
                      data-testid={`button-view-diff-unstaged-${file.id}`}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View diff</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>

        {/* Commit Section */}
        {stagedFiles.length > 0 && (
          <>
            <Separator />
            <div className="p-3 space-y-3">
              <Textarea
                placeholder="Commit message..."
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="min-h-[80px]"
                data-testid="textarea-commit-message"
              />
              <Button
                onClick={handleCommit}
                disabled={!commitMessage.trim()}
                className="w-full"
                data-testid="button-commit"
              >
                <GitCommit className="w-4 h-4 mr-2" />
                Commit ({stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''})
              </Button>
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  );
}