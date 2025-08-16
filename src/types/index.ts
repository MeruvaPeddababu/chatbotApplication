export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  color: string;
  provider: string;
}