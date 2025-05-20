export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  client_id?: number;
  partner_id?: number;
  manager_id?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
} 