import React from 'react';
import { Plus, MessageSquare, Trash2, LogOut, Bot } from 'lucide-react';
import type { ChatSession, User } from '../types';

interface SidebarProps {
  user: User;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onLogout: () => void;
}

export function Sidebar({ 
  user, 
  sessions, 
  currentSessionId, 
  onNewChat, 
  onSelectSession, 
  onDeleteSession, 
  onLogout 
}: SidebarProps) {
  return (
    <div className="w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 p-2 rounded-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">AI ChatBot</h1>
            <p className="text-xs text-gray-500">Welcome, {user.name}</p>
          </div>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-4 py-2.5 rounded-lg hover:from-indigo-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                currentSessionId === session.id
                  ? 'bg-indigo-50 border border-indigo-200'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.title}
                </p>
                <p className="text-xs text-gray-500">
                  {session.messages.length} messages
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}