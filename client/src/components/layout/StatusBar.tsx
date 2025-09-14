import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, XCircle, AlertCircle, GitBranch, Users, Zap } from "lucide-react";

interface StatusBarProps {
  cursorPosition: { line: number; column: number };
  fileEncoding?: string;
  language?: string;
  gitStatus?: {
    branch: string;
    ahead: number;
    behind: number;
    modified: number;
    staged: number;
  };
  lspStatus?: "connected" | "error" | "loading";
  collaborators?: number;
  aiStatus?: "idle" | "thinking" | "error";
}

export function StatusBar({
  cursorPosition,
  fileEncoding = "UTF-8",
  language = "typescript",
  gitStatus,
  lspStatus = "connected",
  collaborators = 0,
  aiStatus = "idle",
}: StatusBarProps) {
  const getLspStatusIcon = () => {
    switch (lspStatus) {
      case "connected":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "error":
        return <XCircle className="w-3 h-3 text-red-500" />;
      case "loading":
        return <AlertCircle className="w-3 h-3 text-yellow-500 animate-pulse" />;
    }
  };

  const getAiStatusIcon = () => {
    switch (aiStatus) {
      case "idle":
        return <Zap className="w-3 h-3 text-muted-foreground" />;
      case "thinking":
        return <Zap className="w-3 h-3 text-primary animate-pulse" />;
      case "error":
        return <Zap className="w-3 h-3 text-red-500" />;
    }
  };

  return (
    <footer className="flex items-center justify-between h-8 px-4 text-xs border-t bg-muted/30" data-testid="statusbar">
      <div className="flex items-center gap-4">
        {/* Cursor Position */}
        <span className="text-muted-foreground" data-testid="text-cursor-position">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>

        {/* Language */}
        <Badge variant="outline" className="text-xs h-5" data-testid="badge-language">
          {language}
        </Badge>

        {/* Encoding */}
        <span className="text-muted-foreground" data-testid="text-encoding">
          {fileEncoding}
        </span>

        {/* Git Status */}
        {gitStatus && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-muted-foreground" data-testid="status-git">
                <GitBranch className="w-3 h-3" />
                <span>{gitStatus.branch}</span>
                {(gitStatus.ahead > 0 || gitStatus.behind > 0) && (
                  <span className="text-blue-500">
                    ↑{gitStatus.ahead} ↓{gitStatus.behind}
                  </span>
                )}
                {gitStatus.modified > 0 && (
                  <span className="text-yellow-500">M{gitStatus.modified}</span>
                )}
                {gitStatus.staged > 0 && (
                  <span className="text-green-500">S{gitStatus.staged}</span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p>Branch: {gitStatus.branch}</p>
                {gitStatus.ahead > 0 && <p>Ahead: {gitStatus.ahead} commits</p>}
                {gitStatus.behind > 0 && <p>Behind: {gitStatus.behind} commits</p>}
                {gitStatus.modified > 0 && <p>Modified: {gitStatus.modified} files</p>}
                {gitStatus.staged > 0 && <p>Staged: {gitStatus.staged} files</p>}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Collaborators */}
        {collaborators > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-muted-foreground" data-testid="status-collaborators">
                <Users className="w-3 h-3" />
                <span>{collaborators}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{collaborators} active collaborator{collaborators > 1 ? 's' : ''}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* AI Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1" data-testid="status-ai">
              {getAiStatusIcon()}
              <span className="text-muted-foreground capitalize">{aiStatus}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI Assistant: {aiStatus}</p>
          </TooltipContent>
        </Tooltip>

        {/* LSP Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1" data-testid="status-lsp">
              {getLspStatusIcon()}
              <span className="text-muted-foreground">LSP</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Language Server: {lspStatus}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </footer>
  );
}