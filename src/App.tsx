import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageSquare } from 'lucide-react';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ModelSelector } from './components/ModelSelector';
import { AuthService } from './services/auth';
import { StorageService } from './services/storage';
import { openRouterService } from './services/openrouter';
import type { User, ChatSession, Message, Model } from './types';

const MODELS: Model[] = [
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek Chat v3',
    description: 'Advanced reasoning and conversation',
    color: 'bg-blue-500',
    provider: 'DeepSeek'
  },
  {
    id: 'qwen/qwen3-coder:free',
    name: 'Qwen3 Coder',
    description: 'Code generation and programming',
    color: 'bg-green-500',
    provider: 'Qwen'
  },
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM-4.5 Air',
    description: 'Lightweight and efficient AI',
    color: 'bg-purple-500',
    provider: 'Z-AI'
  },
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek R1',
    description: 'Research and analysis focused',
    color: 'bg-red-500',
    provider: 'DeepSeek'
  }
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize user and sessions
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const userSessions = StorageService.getSessions(currentUser.id);
      setSessions(userSessions);
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    const userSessions = StorageService.getSessions(loggedInUser.id);
    setSessions(userSessions);
  };

  const handleLogout = () => {
    AuthService.signout();
    setUser(null);
    setSessions([]);
    setCurrentSession(null);
  };

  const createNewSession = (): ChatSession => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `Chat ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return newSession;
  };

  const handleNewChat = () => {
    const newSession = createNewSession();
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    setError('');
    
    if (user) {
      StorageService.saveSession(user.id, newSession);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setError('');
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (user) {
      StorageService.deleteSession(user.id, sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    }
  };

  const updateSessionTitle = (session: ChatSession, userMessage: string) => {
    if (session.messages.length === 1) { // First message
      const title = userMessage.length > 30 
        ? `${userMessage.substring(0, 30)}...` 
        : userMessage;
      session.title = title;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user || isLoading) return;

    let session = currentSession;
    if (!session) {
      session = createNewSession();
      setSessions(prev => [session!, ...prev]);
      setCurrentSession(session);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    // Update session with user message
    const updatedSession = {
      ...session,
      messages: [...session.messages, userMessage],
      updatedAt: new Date()
    };

    updateSessionTitle(updatedSession, content);
    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    StorageService.saveSession(user.id, updatedSession);

    setIsLoading(true);
    setError('');

    try {
      const messages = updatedSession.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await openRouterService.sendMessage(messages, selectedModel);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        model: selectedModel
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
        updatedAt: new Date()
      };

      setCurrentSession(finalSession);
      setSessions(prev => prev.map(s => s.id === finalSession.id ? finalSession : s));
      StorageService.saveSession(user.id, finalSession);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar
        user={user}
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentSession?.title || 'Select a chat or start a new one'}
              </h2>
              {currentSession && (
                <p className="text-sm text-gray-500">
                  {currentSession.messages.length} messages
                </p>
              )}
            </div>
            
            <div className="w-64">
              <ModelSelector
                models={MODELS}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          {currentSession ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {currentSession.messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-4">
                        <MessageSquare className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Start a Conversation
                      </h3>
                      <p className="text-gray-500 max-w-sm">
                        Ask me anything! I'm powered by multiple AI models and ready to help.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {currentSession.messages.map((message) => {
                      const model = MODELS.find(m => m.id === message.model);
                      return (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          modelName={model?.name}
                          modelColor={model?.color}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 p-4 m-4 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <ChatInput
                onSendMessage={handleSendMessage}
                disabled={isLoading}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-4">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to AI ChatBot
                </h3>
                <p className="text-gray-500 max-w-sm mb-6">
                  Choose from multiple AI models and start chatting. Create a new chat to get started.
                </p>
                <button
                  onClick={handleNewChat}
                  className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-cyan-600 transition-all font-medium"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;