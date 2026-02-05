import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { adminLogin } from '@/lib/backend-api';

interface AdminUser {
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_EMAIL_KEY = 'admin_email';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const email = localStorage.getItem(ADMIN_EMAIL_KEY);
    if (token && email) {
      setToken(token);
      setUser({ email, isAdmin: true });
    } else {
      setToken(null);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await adminLogin(email, password);
      localStorage.setItem(ADMIN_TOKEN_KEY, result.access_token);
      localStorage.setItem(ADMIN_EMAIL_KEY, email);
      setToken(result.access_token);
      setUser({ email, isAdmin: true });
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign in failed') };
    }
  };

  const signUp = async (email: string, password: string) => {
    // For frontend-only, signup works the same as signin with admin credentials
    return signIn(email, password);
  };

  const signOut = async () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_EMAIL_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin: user?.isAdmin ?? false, 
      isLoading, 
      token,
      signIn, 
      signUp, 
      signOut 
    }}>
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
