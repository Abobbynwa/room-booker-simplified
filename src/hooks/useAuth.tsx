import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAdminSession, adminSignIn, adminSignOut, AdminUser } from '@/lib/mockData';

interface AuthContextType {
  user: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const session = getAdminSession();
    setUser(session);
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = adminSignIn(email, password);
    if (result.success) {
      setUser(getAdminSession());
      return { error: null };
    }
    return { error: new Error(result.error || 'Sign in failed') };
  };

  const signUp = async (email: string, password: string) => {
    // For frontend-only, signup works the same as signin with admin credentials
    return signIn(email, password);
  };

  const signOut = async () => {
    adminSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin: user?.isAdmin ?? false, 
      isLoading, 
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
