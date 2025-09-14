import { useState, useEffect } from "react";
import React from "react";

declare global {
  interface Window {
    autoSaveTimeout: NodeJS.Timeout;
  }
}
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TopBar } from "./TopBar";
import { StatusBar } from "./StatusBar";
import { FileTree } from "../editor/FileTree";
import { EditorTabs } from "../editor/EditorTabs";
import { MonacoEditor } from "../editor/MonacoEditor";
import { ChatPanel } from "../ai/ChatPanel";
import { GitPanel } from "../git/GitPanel";
import { SearchPanel } from "../search/SearchPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelLeft, PanelRight, Files, GitBranch, Search, MessageSquare, Settings, X, User } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { AuthDialog } from "../auth/AuthDialog";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  // Add props as needed for real implementation
}

export function AppLayout({}: AppLayoutProps) {
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [leftActiveTab, setLeftActiveTab] = useState("files");
  const [rightActiveTab, setRightActiveTab] = useState("chat");
  const [user, setUser] = useState(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // State variables for file management
  const [activeFile, setActiveFile] = useState("src/components/Button.tsx");
  const [fileContent, setFileContent] = useState("");

  // Editor tabs state - moved here to ensure all hooks are called in same order
  const [editorTabs] = useState([
    {
      id: "1",
      name: "App.tsx",
      path: "src/App.tsx",
      isDirty: false,
      language: "typescript",
    },
    {
      id: "2", 
      name: "Button.tsx",
      path: "src/components/Button.tsx",
      isDirty: true,
      language: "typescript",
    },
    {
      id: "3",
      name: "styles.css",
      path: "src/styles.css", 
      isDirty: false,
      language: "css",
    },
  ]);

  // Check current user authentication status
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Set user when authentication data loads
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else if (!userLoading && !currentUser) {
      setAuthDialogOpen(true);
    }
  }, [currentUser, userLoading]);

  // Fetch file tree from backend (only when authenticated)
  const { data: fileTreeData } = useQuery({
    queryKey: ["/api/files/tree"],
    queryFn: () => apiClient.getFileTree(),
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  // Load file content when active file changes (only when authenticated)
  const { data: fileData } = useQuery({
    queryKey: ["/api/files/content", activeFile],
    queryFn: () => apiClient.readFile(activeFile),
    enabled: !!activeFile && !!user,
    refetchOnWindowFocus: false,
  });

  // Update content when file data loads
  useEffect(() => {
    if (fileData?.content) {
      setFileContent(fileData.content);
    }
  }, [fileData]);

  const handleFileSelect = async (path: string) => {
    console.log("File selected:", path);
    setActiveFile(path);
  };

  const handleFileSave = async (content: string) => {
    if (!activeFile) return;
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    try {
      await apiClient.writeFile(activeFile, content);
      console.log("File saved successfully");
      toast({
        title: "File saved",
        description: `Successfully saved ${activeFile}`,
      });
    } catch (error: any) {
      console.error("Failed to save file:", error);
      if (error?.message?.includes("Authentication")) {
        setAuthDialogOpen(true);
      }
      toast({
        title: "Save failed",
        description: "Failed to save file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setAuthDialogOpen(false);
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error("Logout failed:", error);
    }
  };

  // Mock data and constants - moved here to be defined before conditional rendering
  const mockFiles = [
    {
      id: "1",
      name: "src",
      type: "folder" as const,
      path: "src",
      isOpen: true,
      children: [
        {
          id: "2",
          name: "components",
          type: "folder" as const,
          path: "src/components",
          children: [
            {
              id: "3",
              name: "Button.tsx",
              type: "file" as const,
              path: "src/components/Button.tsx",
              gitStatus: "modified" as const,
            },
            {
              id: "4",
              name: "Modal.tsx",
              type: "file" as const,
              path: "src/components/Modal.tsx",
            },
          ],
        },
        {
          id: "5",
          name: "App.tsx",
          type: "file" as const,
          path: "src/App.tsx",
        },
      ],
    },
    {
      id: "6",
      name: "package.json",
      type: "file" as const,
      path: "package.json",
    },
  ];

  const sampleCode = `import React from 'react';
import { Button } from '@/components/ui/button';

interface ButtonProps {
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function CustomButton({ 
  variant = 'default', 
  size = 'md',
  children,
  onClick 
}: ButtonProps) {
  return (
    <Button 
      variant={variant}
      size={size}
      onClick={onClick}
      className="hover-elevate"
    >
      {children}
    </Button>
  );
}`;

  // Show loading state while checking authentication
  if (userLoading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex h-screen items-center justify-center" data-testid="loading-auth">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading JellyAI IDE...</p>
          </div>
        </div>
        <AuthDialog
          open={authDialogOpen}
          onClose={() => setAuthDialogOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  const handleLLMRequest = async (message: string) => {
    if (!user) {
      setAuthDialogOpen(true);
      throw new Error("Please log in to use AI features");
    }
    try {
      const response = await apiClient.chatCompletion(message, fileContent);
      console.log("LLM response:", response);
      return response;
    } catch (error: any) {
      console.error("LLM request failed:", error);
      if (error?.message?.includes("Authentication")) {
        setAuthDialogOpen(true);
      }
      throw error;
    }
  };

  const handleCodeAction = async (action: string, code: string) => {
    if (!user) {
      setAuthDialogOpen(true);
      throw new Error("Please log in to use AI features");
    }
    try {
      let response;
      switch (action) {
        case "explain":
          response = await apiClient.explainCode(code);
          break;
        case "refactor":
          response = await apiClient.refactorCode(code, fileContent);
          break;
        case "generate-tests":
          response = await apiClient.generateTests(code);
          break;
        case "optimize":
          response = await apiClient.optimizeCode(code);
          break;
        default:
          throw new Error("Unknown action");
      }
      console.log("Code action response:", response);
      return response;
    } catch (error: any) {
      console.error("Code action failed:", error);
      if (error?.message?.includes("Authentication")) {
        setAuthDialogOpen(true);
      }
      throw error;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="app-layout">
      {/* Top Bar */}
      <TopBar
        projectName="jellyai"
        currentBranch="feature/ui-components"
        saveStatus="saved"
        isConnected={true}
        user={user}
        onSettingsClick={() => console.log("Settings clicked")}
        onProfileClick={() => console.log("Profile clicked")}
        onLogoutClick={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar */}
          {leftPanelVisible && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                <div className="h-full flex flex-col">
                  <Tabs value={leftActiveTab} onValueChange={setLeftActiveTab} className="h-full flex flex-col">
                    <div className="flex items-center justify-between border-b">
                      <TabsList className="h-8 p-0 bg-transparent">
                        <TabsTrigger value="files" className="text-xs px-2 h-8" data-testid="tab-files">
                          <Files className="w-3 h-3 mr-1" />
                          Files
                        </TabsTrigger>
                        <TabsTrigger value="search" className="text-xs px-2 h-8" data-testid="tab-search">
                          <Search className="w-3 h-3 mr-1" />
                          Search
                        </TabsTrigger>
                        <TabsTrigger value="git" className="text-xs px-2 h-8" data-testid="tab-git">
                          <GitBranch className="w-3 h-3 mr-1" />
                          Git
                        </TabsTrigger>
                      </TabsList>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 mr-1"
                            onClick={() => setLeftPanelVisible(false)}
                            data-testid="button-close-left-panel"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Hide sidebar</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <TabsContent value="files" className="flex-1 m-0">
                      <FileTree
                        files={fileTreeData?.files || mockFiles}
                        selectedFile={activeFile}
                        onFileSelect={handleFileSelect}
                        onFileCreate={(parentPath, type) => console.log("Create", type, "in", parentPath)}
                        onFileRename={(path, newName) => console.log("Rename", path, "to", newName)}
                        onFileDelete={(path) => console.log("Delete", path)}
                      />
                    </TabsContent>

                    <TabsContent value="search" className="flex-1 m-0">
                      <SearchPanel
                        onFileOpen={(path, line) => console.log("Open file:", path, "at line:", line)}
                        onSearch={(query, type) => console.log("Search:", query, "type:", type)}
                      />
                    </TabsContent>

                    <TabsContent value="git" className="flex-1 m-0">
                      <GitPanel
                        onStageFile={(fileId) => console.log("Stage file:", fileId)}
                        onUnstageFile={(fileId) => console.log("Unstage file:", fileId)}
                        onCommit={(message) => console.log("Commit:", message)}
                        onPush={() => console.log("Push changes")}
                        onPull={() => console.log("Pull changes")}
                        onBranchSwitch={(branch) => console.log("Switch to branch:", branch)}
                        onViewDiff={(fileId) => console.log("View diff for:", fileId)}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Editor Area */}
          <ResizablePanel defaultSize={leftPanelVisible && rightPanelVisible ? 60 : 80}>
            <div className="h-full flex flex-col">
              {/* Show left panel toggle when hidden */}
              {!leftPanelVisible && (
                <div className="absolute top-14 left-2 z-10">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => setLeftPanelVisible(true)}
                        data-testid="button-show-left-panel"
                      >
                        <PanelLeft className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Show sidebar</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              <EditorTabs
                tabs={editorTabs}
                activeTab="2"
                onTabSelect={(tabId) => console.log("Tab selected:", tabId)}
                onTabClose={(tabId) => console.log("Tab closed:", tabId)}
                onTabCloseAll={() => console.log("Close all tabs")}
                onTabCloseOthers={(tabId) => console.log("Close others except:", tabId)}
                onNewTab={() => console.log("New tab")}
              />

              <div className="flex-1">
                <MonacoEditor
                  value={fileContent || sampleCode}
                  language="typescript"
                  onChange={(value) => {
                    setFileContent(value);
                    // Auto-save after 2 seconds of no changes
                    clearTimeout(window.autoSaveTimeout);
                    window.autoSaveTimeout = setTimeout(() => {
                      handleFileSave(value);
                    }, 2000);
                  }}
                  onCursorPositionChange={(line, column) => console.log("Cursor:", line, column)}
                  theme="dark"
                />
              </div>
            </div>
          </ResizablePanel>

          {/* Right Sidebar */}
          {rightPanelVisible && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                <div className="h-full flex flex-col">
                  <Tabs value={rightActiveTab} onValueChange={setRightActiveTab} className="h-full flex flex-col">
                    <div className="flex items-center justify-between border-b">
                      <TabsList className="h-8 p-0 bg-transparent">
                        <TabsTrigger value="chat" className="text-xs px-2 h-8" data-testid="tab-chat">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          AI Chat
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="text-xs px-2 h-8" data-testid="tab-settings">
                          <Settings className="w-3 h-3 mr-1" />
                          Settings
                        </TabsTrigger>
                      </TabsList>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 mr-1"
                            onClick={() => setRightPanelVisible(false)}
                            data-testid="button-close-right-panel"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Hide panel</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <TabsContent value="chat" className="flex-1 m-0">
                      <ChatPanel
                        onSendMessage={handleLLMRequest}
                        onCodeApply={(code) => {
                          setFileContent(code);
                          handleFileSave(code);
                        }}
                        isLoading={false}
                      />
                    </TabsContent>

                    <TabsContent value="settings" className="flex-1 m-0 p-4">
                      <div className="space-y-4">
                        <h3 className="font-medium">Editor Settings</h3>
                        <p className="text-sm text-muted-foreground">
                          Settings panel will be implemented here
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </ResizablePanel>
            </>
          )}

          {/* Show right panel toggle when hidden */}
          {!rightPanelVisible && (
            <div className="absolute top-14 right-2 z-10">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setRightPanelVisible(true)}
                    data-testid="button-show-right-panel"
                  >
                    <PanelRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show AI panel</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <StatusBar
        cursorPosition={{ line: 42, column: 15 }}
        fileEncoding="UTF-8"
        language="typescript"
        gitStatus={{
          branch: "feature/ui-components",
          ahead: 2,
          behind: 0,
          modified: 3,
          staged: 1,
        }}
        lspStatus="connected"
        collaborators={2}
        aiStatus="idle"
      />
    </div>
  );
}