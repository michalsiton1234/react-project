// // // @ts-nocheck
// // import React, { createContext, useContext, useState, useEffect } from 'react';
// // import { api } from '@/api/apiClient';
// // // 🔴 הוספתי ייבוא של פונקציית פענוח התפקיד כדי שלא נצטרך לקרוא לשרת סתם
// // import { getUserRole } from '@/lib/auth';

// // interface User {
// //   id: string;
// //   email: string;
// //   role: string;
// //   fullName: string;
// //   isProfileComplete: boolean;
// // }

// // interface AuthContextType {
// //   user: User | null;
// //   isAuthenticated: boolean;
// //   isLoading: boolean;
// //   login: (token: string, userData: User) => void;
// //   logout: () => void;
// //   checkAuth: () => Promise<void>;
// // }

// // const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
// //   const [user, setUser] = useState<User | null>(null);
// //   const [isLoading, setIsLoading] = useState(true);

// //   const checkAuth = async () => {
// //     const token = localStorage.getItem('token');
// //     if (!token) {
// //       setIsLoading(false);
// //       setUser(null);
// //       return;
// //     }

// //     try {
// //       // 🔴 שינוי זמני: במקום לקרוא ל-API שלא קיים (/auth/me)
// //       // אנחנו פשוט נבדוק מה התפקיד בטוקן ונניח שהמשתמש מחובר
// //       const role = getUserRole();
      
// //       if (role) {
// //         // יוצרים אובייקט משתמש "מדומה" מהטוקן הקיים
// //         setUser({
// //           role: role,
// //           email: '', // אפשר להוסיף חילוץ אימייל מהטוקן אם צריך
// //           fullName: 'משתמש מחובר'
// //         } as User);
// //       } else {
// //         // אם הטוקן לא תקין/פג תוקף
// //         localStorage.removeItem('token');
// //         setUser(null);
// //       }
// //     } catch (error) {
// //       console.error("Auth check failed:", error);
// //       localStorage.removeItem('token');
// //       setUser(null);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     checkAuth();
// //   }, []);

// //   const login = (token: string, userData: User) => {
// //     localStorage.setItem('token', token);
// //     setUser(userData);
// //   };

// //   const logout = () => {
// //     localStorage.removeItem('token');
// //     setUser(null);
// //     window.location.href = '/';
// //   };

// //   return (
// //     <AuthContext.Provider value={{ 
// //       user, 
// //       isAuthenticated: !!user, 
// //       isLoading, 
// //       login, 
// //       logout,
// //       checkAuth 
// //     }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // export const useAuth = () => {
// //   const context = useContext(AuthContext);
// //   if (context === undefined) {
// //     throw new Error('useAuth must be used within an AuthProvider');
// //   }
// //   return context;
// // };
// // @ts-nocheck
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { getUserRole } from '@/lib/auth';

// interface User {
//   id: string;
//   email: string;
//   role: string;
//   fullName: string;
//   isProfileComplete: boolean;
// }

// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   login: (token: string) => void; // שיניתי את החתימה לפשוטה יותר
//   logout: () => void;
//   checkAuth: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const checkAuth = async () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       setIsLoading(false);
//       setUser(null);
//       return;
//     }

//     try {
//       const role = getUserRole();
      
//       if (role) {
//         setUser({
//           role: role,
//           fullName: 'משתמש מחובר',
//           email: ''
//         } as User);
//       } else {
//         localStorage.removeItem('token');
//         setUser(null);
//       }
//     } catch (error) {
//       localStorage.removeItem('token');
//       setUser(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   // ✅ התיקון הקריטי: פונקציית לוגין שמעדכנת סטייט מיד
//   const login = (token: string) => {
//     localStorage.setItem('token', token);
//     const role = getUserRole(); // שולף את התפקיד מהטוקן החדש ששמרנו
    
//     setUser({
//       role: role,
//       fullName: 'משתמש מחובר',
//       email: ''
//     } as User);
    
//     // ברגע ש-setUser רץ, isAuthenticated הופך ל-true באופן אוטומטי
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setUser(null);
//     window.location.href = '/login';
//   };

//   return (
//     <AuthContext.Provider value={{ 
//       user, 
//       isAuthenticated: !!user, 
//       isLoading, 
//       login, 
//       logout,
//       checkAuth 
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserRole } from '@/lib/auth';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
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
        const role = getUserRole();
        console.log("AuthProvider: Role decoded from token:", role);

        if (role) {
          setUser({ role, fullName: 'משתמש מחובר' });
        } else {
          console.warn("AuthProvider: Token exists but role is missing.");
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
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
    const role = getUserRole();
    setUser({ role, fullName: 'משתמש מחובר' });
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
      logout 
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