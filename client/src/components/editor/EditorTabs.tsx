import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { X, Circle, Dot, Plus, Code, FileText, Settings, Database, Brackets } from "lucide-react";

interface EditorTab {
  id: string;
  name: string;
  path: string;
  isDirty: boolean;
  language?: string;
}

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTab?: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabCloseAll?: () => void;
  onTabCloseOthers?: (tabId: string) => void;
  onNewTab?: () => void;
}

export function EditorTabs({
  tabs,
  activeTab,
  onTabSelect,
  onTabClose,
  onTabCloseAll,
  onTabCloseOthers,
  onNewTab,
}: EditorTabsProps) {
  const [draggedTab, setDraggedTab] = useState<string | null>(null);

  const getFileIcon = (fileName: string) => {
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
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleTabDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTab(tabId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleTabDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleTabDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    if (draggedTab && draggedTab !== targetTabId) {
      console.log(`Reorder tab ${draggedTab} to position of ${targetTabId}`);
      // TODO: Implement tab reordering
    }
    setDraggedTab(null);
  };

  return (
    <div className="flex items-center border-b bg-muted/20" data-testid="editor-tabs">
      <div className="flex flex-1 overflow-x-auto">
        {tabs.map((tab) => (
          <ContextMenu key={tab.id}>
            <ContextMenuTrigger asChild>
              <div
                className={`group flex items-center gap-2 px-3 py-2 text-sm border-r cursor-pointer hover-elevate min-w-0 ${
                  activeTab === tab.id
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  console.log(`Tab selected: ${tab.id}`);
                  onTabSelect(tab.id);
                }}
                draggable
                onDragStart={(e) => handleTabDragStart(e, tab.id)}
                onDragOver={handleTabDragOver}
                onDrop={(e) => handleTabDrop(e, tab.id)}
                data-testid={`tab-${tab.name}`}
              >
                {getFileIcon(tab.name)}
                
                <span className="truncate max-w-32" title={tab.path}>
                  {tab.name}
                </span>

                <div className="flex items-center gap-1">
                  {tab.isDirty && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Dot className="w-4 h-4 text-yellow-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Unsaved changes</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Close tab: ${tab.id}`);
                      onTabClose(tab.id);
                    }}
                    data-testid={`button-close-tab-${tab.name}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => {
                  console.log(`Close tab: ${tab.id}`);
                  onTabClose(tab.id);
                }}
                data-testid="button-close-tab"
              >
                Close
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  console.log(`Close others: ${tab.id}`);
                  onTabCloseOthers?.(tab.id);
                }}
                data-testid="button-close-others"
              >
                Close Others
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => {
                  console.log("Close all tabs");
                  onTabCloseAll?.();
                }}
                data-testid="button-close-all"
              >
                Close All
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      {/* New Tab Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 shrink-0"
            onClick={() => {
              console.log("New tab clicked");
              onNewTab?.();
            }}
            data-testid="button-new-tab"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>New Tab</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}