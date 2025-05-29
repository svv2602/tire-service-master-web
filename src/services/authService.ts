import { apiClient } from '../api';
import config from '../config';

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    // Загружаем токен при создании экземпляра
    this.token = localStorage.getItem(config.AUTH_TOKEN_STORAGE_KEY);
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getToken(): string | null {
    return this.token;
  }

  public setToken(token: string | null): void {
    this.token = token;
    
    if (token) {
      // Сохраняем токен в localStorage
      localStorage.setItem(config.AUTH_TOKEN_STORAGE_KEY, token);
      
      // Форматируем токен для заголовка
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      // Устанавливаем заголовок для axios
      apiClient.defaults.headers.common['Authorization'] = formattedToken;
    } else {
      // Удаляем токен из localStorage и заголовков
      localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public getAuthorizationHeader(): string | null {
    if (!this.token) return null;
    return this.token.startsWith('Bearer ') ? this.token : `Bearer ${this.token}`;
  }
}

export const authService = AuthService.getInstance();
export default authService; 