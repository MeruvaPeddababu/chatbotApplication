import React from 'react';
import { Bot, User } from 'lucide-react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  modelName?: string;
  modelColor?: string;
}

export function ChatMessage({ message, modelName, modelColor }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatContent = (content: string) => {
    // Simple code block detection and formatting
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    
    let formattedContent = content;
    
    // Replace code blocks
    formattedContent = formattedContent.replace(codeBlockRegex, (match, language, code) => {
      return `<pre class="bg-gray-900 text-gray-100 rounded-lg p-4 my-2 overflow-x-auto"><code class="text-sm">${code.trim()}</code></pre>`;
    });
    
    // Replace inline code
    formattedContent = formattedContent.replace(inlineCodeRegex, (match, code) => {
      return `<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm">${code}</code>`;
    });
    
    // Convert line breaks to <br> tags
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return formattedContent;
  };

  return (
    <div className={`flex gap-4 p-4 ${message.role === 'assistant' ? 'bg-gray-50/50' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        message.role === 'assistant' 
          ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white' 
          : 'bg-gray-200 text-gray-600'
      }`}>
        {message.role === 'assistant' ? (
          <Bot className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900">
            {message.role === 'assistant' ? 'AI Assistant' : 'You'}
          </span>
          {message.role === 'assistant' && modelName && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <div className={`w-2 h-2 rounded-full ${modelColor}`} />
              {modelName}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
        </div>
        
        <div 
          className="text-gray-800 text-sm leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
        />
      </div>
    </div>
  );
}