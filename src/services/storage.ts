import { ChatSession } from '../types';

export class StorageService {
  private static readonly SESSIONS_KEY = 'chatbot_sessions';

  static getSessions(userId: string): ChatSession[] {
    const sessions = localStorage.getItem(`${this.SESSIONS_KEY}_${userId}`);
    return sessions ? JSON.parse(sessions).map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    })) : [];
  }

  static saveSessions(userId: string, sessions: ChatSession[]): void {
    localStorage.setItem(`${this.SESSIONS_KEY}_${userId}`, JSON.stringify(sessions));
  }

  static saveSession(userId: string, session: ChatSession): void {
    const sessions = this.getSessions(userId);
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    this.saveSessions(userId, sessions);
  }

  static deleteSession(userId: string, sessionId: string): void {
    const sessions = this.getSessions(userId);
    const filtered = sessions.filter(s => s.id !== sessionId);
    this.saveSessions(userId, filtered);
  }
}