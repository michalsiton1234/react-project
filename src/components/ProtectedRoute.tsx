import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getUser, getUserRole } from "@/lib/auth";

// הגדרת סוגי התפקידים האפשריים במערכת
type UserRole = "admin" | "employer" | "candidate" | "guest";

interface ProtectedRouteProps {
  children: ReactNode;          // כל רכיב React שיעטף
  allowedRoles: UserRole[];     // מערך של תפקידים מורשים
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const user = getUser();

  // אם אין משתמש מחובר - שלח לדף הבית
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const role = getUserRole() as UserRole;

  // מנהל (Admin) תמיד יכול לראות הכל
  if (role === "admin") {
    return <>{children}</>;
  }

  // בדיקה האם התפקיד הנוכחי נמצא ברשימת המורשים
  if (!allowedRoles.includes(role)) {
    // ניתוב מחדש לפי סוג התפקיד אם הוא מנסה להיכנס לדף לא לו
    if (role === "employer") return <Navigate to="/employer/jobs" replace />;
    if (role === "candidate") return <Navigate to="/candidate/profile" replace />;
    
    // אם אין לו תפקיד מוגדר או תפקיד לא מוכר
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}