import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Zap, MessageSquare, Code, TestTube, Copy, Search, Replace, Maximize, Minimize } from "lucide-react";

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  onCursorPositionChange?: (line: number, column: number) => void;
  readOnly?: boolean;
  theme?: "light" | "dark";
}

interface CodeAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export function MonacoEditor({
  value,
  language,
  onChange,
  onCursorPositionChange,
  readOnly = false,
  theme = "dark",
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selectedText, setSelectedText] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFind, setShowFind] = useState(false);

  const codeActions: CodeAction[] = [
    {
      id: "explain",
      label: "Explain Code",
      icon: <MessageSquare className="w-4 h-4" />,
      description: "Get AI explanation of selected code",
    },
    {
      id: "refactor",
      label: "Refactor",
      icon: <Code className="w-4 h-4" />,
      description: "AI-powered code refactoring",
    },
    {
      id: "generate-tests",
      label: "Generate Tests",
      icon: <TestTube className="w-4 h-4" />,
      description: "Generate unit tests for selected function",
    },
    {
      id: "optimize",
      label: "Optimize",
      icon: <Zap className="w-4 h-4" />,
      description: "Optimize code performance",
    },
  ];

  useEffect(() => {
    // TODO: Initialize Monaco Editor here
    // This would integrate with @monaco-editor/react in a real implementation
    console.log("Monaco Editor initialized with:", { language, theme, readOnly });
    
    // Simulate cursor position updates
    const interval = setInterval(() => {
      const newLine = Math.floor(Math.random() * 50) + 1;
      const newColumn = Math.floor(Math.random() * 80) + 1;
      setCursorPosition({ line: newLine, column: newColumn });
      onCursorPositionChange?.(newLine, newColumn);
    }, 3000);

    return () => clearInterval(interval);
  }, [language, theme, readOnly, onCursorPositionChange]);

  const handleCodeAction = (actionId: string) => {
    console.log(`Code action triggered: ${actionId}`, { selectedText, cursorPosition });
    // TODO: Integrate with AI backend
  };

  const handleCopy = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      console.log("Text copied to clipboard");
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    console.log(`Fullscreen: ${!isFullscreen}`);
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`} data-testid="monaco-editor">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {language}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
          {selectedText && (
            <Badge variant="secondary" className="text-xs">
              {selectedText.length} chars selected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Find/Replace */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => {
                  setShowFind(!showFind);
                  console.log(`Find dialog: ${!showFind}`);
                }}
                data-testid="button-find"
              >
                <Search className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Find & Replace (Ctrl+F)</p>
            </TooltipContent>
          </Tooltip>

          {/* Copy */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={handleCopy}
                disabled={!selectedText}
                data-testid="button-copy"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy Selection (Ctrl+C)</p>
            </TooltipContent>
          </Tooltip>

          {/* AI Code Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                disabled={!selectedText}
                data-testid="button-ai-actions"
              >
                <Zap className="w-4 h-4 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {codeActions.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => handleCodeAction(action.id)}
                  className="flex items-center gap-2"
                  data-testid={`action-${action.id}`}
                >
                  {action.icon}
                  <div className="flex flex-col">
                    <span>{action.label}</span>
                    <span className="text-xs text-muted-foreground">{action.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={toggleFullscreen}
                data-testid="button-fullscreen"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFullscreen ? "Exit" : "Enter"} Fullscreen (F11)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Find/Replace Bar */}
      {showFind && (
        <div className="flex items-center gap-2 p-2 border-b bg-muted/10" data-testid="find-replace-bar">
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="Find..."
              className="px-2 py-1 text-sm border rounded bg-background"
              data-testid="input-find"
            />
            <input
              type="text"
              placeholder="Replace..."
              className="px-2 py-1 text-sm border rounded bg-background"
              data-testid="input-replace"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" data-testid="button-replace">
              <Replace className="w-3 h-3 mr-1" />
              Replace
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFind(false)}
              data-testid="button-close-find"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Monaco Editor Container */}
      <div 
        ref={editorRef} 
        className="flex-1 bg-background font-mono text-sm"
        onClick={() => {
          // Simulate text selection
          const selection = "const hello = 'world';";
          setSelectedText(selection);
          console.log("Text selected:", selection);
        }}
        data-testid="editor-content"
      >
        {/* TODO: Replace with actual Monaco Editor */}
        <div className="h-full p-4 overflow-auto">
          <div className="text-muted-foreground">
            <p>// Monaco Editor will be integrated here</p>
            <p>// Language: {language}</p>
            <p>// Theme: {theme}</p>
            <p>// ReadOnly: {readOnly.toString()}</p>
            <br />
            <p>// Click to simulate text selection</p>
            <p>// Use toolbar buttons to test AI actions</p>
            <br />
            <pre className="text-foreground">
{`function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(5, 3);
console.log('Result:', result);

// This is a sample file for demonstration
// Select text and use AI actions from the toolbar`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}