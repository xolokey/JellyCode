import { useRef, useEffect, useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Zap, MessageSquare, Code, TestTube, Copy, Search, Replace, Maximize, Minimize } from "lucide-react";
import Editor, { loader } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

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

// Configure Monaco loader to prevent timing issues
loader.init().then(() => {
  console.log('Monaco Editor loader initialized');
}).catch((error) => {
  console.error('Monaco Editor loader failed:', error);
});

export const MonacoEditor = memo(function MonacoEditor({
  value,
  language,
  onChange,
  onCursorPositionChange,
  readOnly = false,
  theme = "dark",
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selectedText, setSelectedText] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFind, setShowFind] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);

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

  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    try {
      editorRef.current = editor;
      setIsEditorReady(true);
      console.log("Monaco Editor initialized with:", { language, theme, readOnly });
      
      // Listen for cursor position changes
      editor.onDidChangeCursorPosition((e) => {
        setCursorPosition({ line: e.position.lineNumber, column: e.position.column });
        onCursorPositionChange?.(e.position.lineNumber, e.position.column);
      });

      // Listen for selection changes
      editor.onDidChangeCursorSelection((e) => {
        const model = editor.getModel();
        if (model) {
          const selectedText = model.getValueInRange(e.selection);
          setSelectedText(selectedText);
        }
      });

      // Focus the editor
      editor.focus();
    } catch (error) {
      console.error('Monaco Editor mount error:', error);
    }
  }, [language, theme, readOnly, onCursorPositionChange]);

  const handleCodeAction = useCallback((actionId: string) => {
    const editor = editorRef.current;
    if (!editor || !isEditorReady) return;

    const model = editor.getModel();
    const selection = editor.getSelection();
    
    if (model && selection) {
      const selectedCode = model.getValueInRange(selection);
      console.log(`Code action triggered: ${actionId}`, { 
        selectedText: selectedCode, 
        cursorPosition,
        lineCount: model.getLineCount()
      });
      // TODO: Integrate with AI backend for code actions
    }
  }, [cursorPosition, isEditorReady]);

  const handleCopy = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !isEditorReady) return;
    
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      console.log("Text copied to clipboard");
    } else {
      // If no selection, copy current line
      const model = editor.getModel();
      const position = editor.getPosition();
      if (model && position) {
        const lineContent = model.getLineContent(position.lineNumber);
        navigator.clipboard.writeText(lineContent);
        console.log("Current line copied to clipboard");
      }
    }
  }, [selectedText, isEditorReady]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      console.log(`Fullscreen: ${!prev}`);
      return !prev;
    });
  }, []);

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
      <div className="flex-1" data-testid="editor-content">
        {!isEditorReady && (
          <div className="h-full flex items-center justify-center bg-muted/5">
            <div className="text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading editor...</p>
            </div>
          </div>
        )}
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={(newValue) => onChange?.(newValue || "")}
          onMount={handleEditorDidMount}
          theme={theme === "dark" ? "vs-dark" : "light"}
          loading={null} // Disable default loading screen
          options={{
            readOnly,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontSize: 14,
            lineHeight: 20,
            fontFamily: 'JetBrains Mono, Fira Code, Monaco, "Courier New", monospace',
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            folding: true,
            foldingStrategy: "indentation",
            renderLineHighlight: "line",
            selectOnLineNumbers: true,
            mouseWheelZoom: true,
            contextmenu: true,
            wordWrap: "bounded",
            wordWrapColumn: 120,
            rulers: [80, 120],
            bracketPairColorization: {
              enabled: true,
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            },
          }}
        />
      </div>
    </div>
  );
});