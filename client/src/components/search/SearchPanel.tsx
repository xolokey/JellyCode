import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, FileText, Code, Filter, Settings, ExternalLink, ChevronRight } from "lucide-react";

interface SearchResult {
  id: string;
  type: "file" | "code" | "symbol";
  title: string;
  path: string;
  content: string;
  line?: number;
  column?: number;
  language?: string;
  relevance: number;
}

interface SearchPanelProps {
  onFileOpen?: (path: string, line?: number) => void;
  onSearch?: (query: string, type: "file" | "code" | "ai") => void;
}

export function SearchPanel({
  onFileOpen,
  onSearch,
}: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("file");
  const [isSearching, setIsSearching] = useState(false);
  
  // Mock search results
  const [results] = useState<SearchResult[]>([
    {
      id: "1",
      type: "file",
      title: "Button.tsx",
      path: "src/components/ui/Button.tsx",
      content: "A reusable button component with multiple variants",
      relevance: 0.95,
    },
    {
      id: "2",
      type: "code",
      title: "calculateSum function",
      path: "src/utils/math.ts",
      content: "function calculateSum(a: number, b: number): number {\n  return a + b;\n}",
      line: 15,
      column: 1,
      language: "typescript",
      relevance: 0.87,
    },
    {
      id: "3",
      type: "file",
      title: "package.json",
      path: "package.json",
      content: "Project configuration and dependencies",
      relevance: 0.72,
    },
    {
      id: "4",
      type: "code",
      title: "API endpoint handler",
      path: "src/api/routes.ts",
      content: "app.get('/api/users', async (req, res) => {\n  // Handle user requests\n});",
      line: 42,
      column: 1,
      language: "typescript",
      relevance: 0.65,
    },
  ]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    console.log(`Searching for "${searchQuery}" in ${activeTab}`);
    onSearch?.(searchQuery, activeTab as "file" | "code" | "ai");
    
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "file":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "code":
        return <Code className="w-4 h-4 text-green-500" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  };

  const filteredResults = results.filter(result => {
    if (activeTab === "file") return result.type === "file";
    if (activeTab === "code") return result.type === "code";
    return true;
  });

  return (
    <div className="h-full flex flex-col" data-testid="search-panel">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <span className="font-medium">Search</span>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={() => console.log("Search settings")}
              data-testid="button-search-settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Search settings</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Search Input */}
      <div className="p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Search files, code, or ask AI..."
            className="pl-8"
            data-testid="input-search"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 w-6 h-6"
              onClick={() => setQuery("")}
              data-testid="button-clear-search"
            >
              ×
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="file" className="text-xs" data-testid="tab-file-search">
              Files
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs" data-testid="tab-code-search">
              Code
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs" data-testid="tab-ai-search">
              AI Search
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : query ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "{query}"
                </span>
                <Button variant="ghost" size="sm" data-testid="button-filter-results">
                  <Filter className="w-3 h-3 mr-1" />
                  Filter
                </Button>
              </div>
              
              {filteredResults.map((result) => (
                <div
                  key={result.id}
                  className="p-3 rounded border hover-elevate cursor-pointer"
                  onClick={() => {
                    console.log("Open result:", result.path, result.line);
                    onFileOpen?.(result.path, result.line);
                  }}
                  data-testid={`search-result-${result.id}`}
                >
                  <div className="flex items-start gap-3">
                    {getResultIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{result.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {(result.relevance * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mb-2">
                        {result.path}
                        {result.line && `:${result.line}`}
                      </div>
                      
                      <div 
                        className="text-sm text-foreground/80 line-clamp-2"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightMatch(result.content, query) 
                        }}
                      />
                      
                      {result.language && (
                        <Badge variant="secondary" className="text-xs mt-2">
                          {result.language}
                        </Badge>
                      )}
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Search your codebase</p>
              <p className="text-xs text-muted-foreground">
                Find files, code snippets, or use AI to search semantically
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* AI Search Info */}
      {activeTab === "ai" && (
        <div className="p-3 border-t bg-muted/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ExternalLink className="w-3 h-3" />
            <span>AI search uses embeddings for semantic code search</span>
          </div>
        </div>
      )}
    </div>
  );
}