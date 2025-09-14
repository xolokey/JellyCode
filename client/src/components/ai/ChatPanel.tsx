import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Send, User, Bot, Copy, Code, Trash2, MoreVertical, Sparkles, Zap, MessageSquare } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "code" | "error";
}

interface ChatPanelProps {
  onSendMessage?: (message: string) => void;
  onCodeApply?: (code: string) => void;
  isLoading?: boolean;
}

export function ChatPanel({
  onSendMessage,
  onCodeApply,
  isLoading = false,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI coding assistant. I can help you explain code, refactor functions, generate tests, and answer programming questions. What would you like to work on?",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [suggestions] = useState([
    "Explain this function",
    "Refactor this code",
    "Generate unit tests",
    "Find bugs in this code",
    "Optimize performance",
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text",
    };

    setMessages(prev => [...prev, userMessage]);
    console.log("User message sent:", input);
    onSendMessage?.(input);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you want help with: "${input}". Here's what I can suggest:\n\n\`\`\`typescript\n// This is a sample response\nfunction optimizedFunction() {\n  // Improved implementation\n  return result;\n}\n\`\`\`\n\nWould you like me to explain this further or make any adjustments?`,
        timestamp: new Date(),
        type: "code",
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    console.log("Copied to clipboard");
  };

  const clearChat = () => {
    setMessages([]);
    console.log("Chat cleared");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const extractCodeFromMessage = (content: string): string | null => {
    const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : null;
  };

  return (
    <div className="flex flex-col h-full bg-background" data-testid="chat-panel">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-medium">AI Assistant</span>
          {isLoading && (
            <Badge variant="secondary" className="text-xs">
              <Zap className="w-3 h-3 mr-1 animate-pulse" />
              Thinking...
            </Badge>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-6 h-6" data-testid="button-chat-menu">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={clearChat} data-testid="button-clear-chat">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              data-testid={`message-${message.role}-${message.id}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="space-y-2">
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => copyToClipboard(message.content)}
                            data-testid={`button-copy-message-${message.id}`}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy message</p>
                        </TooltipContent>
                      </Tooltip>

                      {message.role === "assistant" && message.type === "code" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6"
                              onClick={() => {
                                const code = extractCodeFromMessage(message.content);
                                if (code) {
                                  console.log("Apply code:", code);
                                  onCodeApply?.(code);
                                }
                              }}
                              data-testid={`button-apply-code-${message.id}`}
                            >
                              <Code className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Apply code to editor</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-accent" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Suggestions */}
      {messages.length <= 1 && (
        <div className="p-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="text-xs h-6"
                onClick={() => handleSuggestionClick(suggestion)}
                data-testid={`suggestion-${suggestion.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything about your code..."
            disabled={isLoading}
            className="flex-1"
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}