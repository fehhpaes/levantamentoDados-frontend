import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser, refreshToken } from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await getCurrentUser();
          const data = response.data;
          setUser({
            id: data.id,
            email: data.email,
            username: data.username,
            full_name: data.full_name,
            is_active: data.is_active,
            is_superuser: data.role === 'admin'
          });
        } catch (error) {
          // Token might be expired, try to refresh
          try {
            const storedRefreshToken = localStorage.getItem('refresh_token');
            if (storedRefreshToken) {
              const refreshResponse = await refreshToken(storedRefreshToken);
              localStorage.setItem('access_token', refreshResponse.data.access_token);
              if (refreshResponse.data.refresh_token) {
                localStorage.setItem('refresh_token', refreshResponse.data.refresh_token);
              }
              const userResponse = await getCurrentUser();
              const data = userResponse.data;
              setUser({
                id: data.id,
                email: data.email,
                username: data.username,
                full_name: data.full_name,
                is_active: data.is_active,
                is_superuser: data.role === 'admin'
              });
            } else {
              localStorage.removeItem('access_token');
            }
          } catch {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    const { access_token, refresh_token: newRefreshToken, user: userData } = response.data;
    
    localStorage.setItem('access_token', access_token);
    if (newRefreshToken) {
      localStorage.setItem('refresh_token', newRefreshToken);
    }
    
    if (userData) {
      setUser({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        full_name: userData.full_name,
        is_active: userData.is_active,
        is_superuser: userData.role === 'admin'
      });
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await getCurrentUser();
      const data = response.data;
      setUser({
        id: data.id,
        email: data.email,
        username: data.username,
        full_name: data.full_name,
        is_active: data.is_active,
        is_superuser: data.role === 'admin'
      });
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
