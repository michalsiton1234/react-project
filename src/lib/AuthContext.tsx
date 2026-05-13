import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import { getUserRole, getUserId } from '@/lib/auth';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

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
          return true; // Authentication successful
        } else {
          console.warn("AuthProvider: Token exists but role is missing.");
          localStorage.removeItem('token');
          setUser(null);
          return false; // Authentication failed
        }
      } else {
        console.log("AuthProvider: No token found in storage");
        setUser(null);
        return false; // Authentication failed
      }
    } catch (error) {
      console.error("AuthProvider: Auth check error:", error);
      setUser(null);
      return false; // Authentication failed
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
    
    const userData = { 
      id: userId,
      role, 
      fullName: 'משתמש מחובר' 
    };
    
    // Sync with Redux store
    dispatch(setCredentials({ user: userData, token }));
    
    setUser(userData);
    setIsLoading(false);
  };

  const logout = () => {
    console.log("AuthProvider: Logging out...");
    localStorage.removeItem('token');
    setUser(null);
    // לא מבצעים רדיירקט אוטומטי - מאפשרים לקומפוננטה להחליט
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