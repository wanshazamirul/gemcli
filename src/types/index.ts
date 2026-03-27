export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface CommandResult {
  type: 'command' | 'message';
  output?: string;
  error?: string;
}

export interface GeminiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type Theme = 'green' | 'amber';
