import { User } from '../types';

export class AuthService {
  private static readonly USERS_KEY = 'chatbot_users';
  private static readonly CURRENT_USER_KEY = 'chatbot_current_user';

  static getUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static getCurrentUser(): User | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
  }

  static signup(email: string, password: string, name: string): { success: boolean; error?: string; user?: User } {
    const users = this.getUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'User already exists with this email' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  static signin(email: string, password: string): { success: boolean; error?: string; user?: User } {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  static signout(): void {
    this.setCurrentUser(null);
  }
}