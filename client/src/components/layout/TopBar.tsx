import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GitBranch, Save, Settings, LogOut, User, Wifi, WifiOff } from "lucide-react";

interface TopBarProps {
  projectName: string;
  currentBranch: string;
  saveStatus: "saved" | "saving" | "unsaved";
  isConnected: boolean;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
  onLogoutClick?: () => void;
}

export function TopBar({
  projectName,
  currentBranch,
  saveStatus,
  isConnected,
  onSettingsClick,
  onProfileClick,
  onLogoutClick,
}: TopBarProps) {
  const [presenceUsers] = useState([
    { id: "1", name: "Alice Johnson", avatar: "", initials: "AJ" },
    { id: "2", name: "Bob Smith", avatar: "", initials: "BS" },
  ]);

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case "saved":
        return <Save className="w-4 h-4 text-green-500" />;
      case "saving":
        return <Save className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case "unsaved":
        return <Save className="w-4 h-4 text-red-500" />;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "saved":
        return "All changes saved";
      case "saving":
        return "Saving...";
      case "unsaved":
        return "Unsaved changes";
    }
  };

  return (
    <header className="flex items-center justify-between h-12 px-4 border-b bg-background" data-testid="topbar">
      <div className="flex items-center gap-4">
        {/* Project Info */}
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-foreground" data-testid="text-project-name">
            {projectName}
          </h1>
          <Badge variant="outline" className="text-xs" data-testid="badge-branch">
            <GitBranch className="w-3 h-3 mr-1" />
            {currentBranch}
          </Badge>
        </div>

        {/* Save Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1" data-testid="status-save">
              {getSaveStatusIcon()}
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {getSaveStatusText()}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getSaveStatusText()}</p>
          </TooltipContent>
        </Tooltip>

        {/* Connection Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center" data-testid="status-connection">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isConnected ? "Connected" : "Disconnected"}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2">
        {/* Collaboration Presence */}
        <div className="flex items-center -space-x-2">
          {presenceUsers.map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <Avatar className="w-6 h-6 border-2 border-background" data-testid={`avatar-user-${user.id}`}>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            console.log("Settings clicked");
            onSettingsClick?.();
          }}
          data-testid="button-settings"
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-user-menu">
              <Avatar className="w-6 h-6">
                <AvatarImage src="" alt="User" />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onProfileClick} data-testid="button-profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogoutClick} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}