import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserRole, getUserId } from '@/lib/auth';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token');
      console.log("AuthProvider: Checking token in storage...", !!token);

      if (token) {
        console.log("AuthProvider: Token found:", token.substring(0, 20) + "...");
        const role = getUserRole();
        console.log("AuthProvider: Role decoded from token:", role);
        const userId = getUserId();
        console.log("AuthProvider: User ID decoded:", userId);

        if (role) {
          setUser({ 
            id: userId,
            role, 
            fullName: 'משתמש מחובר' 
          });
          console.log("AuthProvider: User set successfully:", { id: userId, role });
        } else {
          console.warn("AuthProvider: Token exists but role is missing.");
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log("AuthProvider: No token found in storage");
        setUser(null);
      }
    } catch (error) {
      console.error("AuthProvider: Auth check error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (token: string) => {
    console.log("AuthProvider: Login function called with token");
    localStorage.setItem('token', token);
    const role = getUserRole(); // שולף את התפקיד מהטוקן החדש
    const userId = getUserId(); // שולף גם את ה-ID
    console.log("AuthProvider: Login - Role:", role, "User ID:", userId);
    
    setUser({ 
      id: userId,
      role, 
      fullName: 'משתמש מחובר' 
    });
    setIsLoading(false);
  };

  const logout = () => {
    console.log("AuthProvider: Logging out...");
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout,
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};