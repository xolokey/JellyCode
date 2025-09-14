// Integration blueprint: javascript_openai
import OpenAI from "openai";

/*
Follow these instructions when using this blueprint:
1. Note that the newest OpenAI model is "gpt-5", not "gpt-4o" or "gpt-4". gpt-5 was released August 7, 2025 after your knowledge cutoff. Always prefer using gpt-5 as it is the latest model. When copying code from this blueprint, ensure you also mention this information verbatim as a comment so that you don't revert it to older models: `// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user`
2. Use the response_format: { type: "json_object" } option
3. Request output in JSON format in the prompt
*/

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CodeExplanation {
  explanation: string;
  concepts: string[];
  complexity: "beginner" | "intermediate" | "advanced";
}

export interface RefactorSuggestion {
  refactoredCode: string;
  changes: string[];
  reasoning: string;
}

export interface TestGeneration {
  testCode: string;
  framework: string;
  coverage: string[];
}

export class AICodeAssistant {
  private readonly model = "gpt-5"; // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

  async explainCode(code: string, language: string = "typescript"): Promise<CodeExplanation> {
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a code explanation expert. Analyze the provided ${language} code and explain what it does, key concepts used, and complexity level. Respond with JSON in this format: { "explanation": "detailed explanation", "concepts": ["concept1", "concept2"], "complexity": "beginner|intermediate|advanced" }`,
          },
          {
            role: "user",
            content: `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        explanation: result.explanation || "No explanation available",
        concepts: result.concepts || [],
        complexity: result.complexity || "intermediate",
      };
    } catch (error) {
      throw new Error(`Failed to explain code: ${error}`);
    }
  }

  async refactorCode(code: string, language: string = "typescript", context?: string): Promise<RefactorSuggestion> {
    try {
      const contextPrompt = context ? `\n\nAdditional context: ${context}` : "";
      
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a code refactoring expert. Analyze the provided ${language} code and suggest improvements for readability, performance, and maintainability. Keep the same functionality. Respond with JSON in this format: { "refactoredCode": "improved code", "changes": ["change1", "change2"], "reasoning": "explanation of improvements" }`,
          },
          {
            role: "user",
            content: `Refactor this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`${contextPrompt}`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        refactoredCode: result.refactoredCode || code,
        changes: result.changes || [],
        reasoning: result.reasoning || "No improvements suggested",
      };
    } catch (error) {
      throw new Error(`Failed to refactor code: ${error}`);
    }
  }

  async generateTests(code: string, language: string = "typescript"): Promise<TestGeneration> {
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a test generation expert. Create comprehensive unit tests for the provided ${language} code. Use appropriate testing framework (Jest for TypeScript/JavaScript). Respond with JSON in this format: { "testCode": "complete test code", "framework": "testing framework used", "coverage": ["scenario1", "scenario2"] }`,
          },
          {
            role: "user",
            content: `Generate unit tests for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        testCode: result.testCode || "// No tests generated",
        framework: result.framework || "Jest",
        coverage: result.coverage || [],
      };
    } catch (error) {
      throw new Error(`Failed to generate tests: ${error}`);
    }
  }

  async optimizeCode(code: string, language: string = "typescript"): Promise<RefactorSuggestion> {
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a performance optimization expert. Analyze the provided ${language} code and suggest optimizations for better performance, memory usage, and efficiency. Respond with JSON in this format: { "refactoredCode": "optimized code", "changes": ["optimization1", "optimization2"], "reasoning": "explanation of optimizations" }`,
          },
          {
            role: "user",
            content: `Optimize this ${language} code for better performance:\n\n\`\`\`${language}\n${code}\n\`\`\``,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        refactoredCode: result.refactoredCode || code,
        changes: result.changes || [],
        reasoning: result.reasoning || "No optimizations suggested",
      };
    } catch (error) {
      throw new Error(`Failed to optimize code: ${error}`);
    }
  }

  async chatCompletion(prompt: string, context?: string): Promise<string> {
    try {
      const contextPrompt = context ? `Context: ${context}\n\n` : "";
      
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an AI coding assistant. Help the user with programming questions, code review, debugging, and best practices. Be concise but thorough.",
          },
          {
            role: "user",
            content: `${contextPrompt}${prompt}`,
          },
        ],
        max_tokens: 1500,
      });

      return response.choices[0].message.content || "I couldn't generate a response.";
    } catch (error) {
      throw new Error(`Failed to generate chat completion: ${error}`);
    }
  }
}