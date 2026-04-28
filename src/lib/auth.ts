// // // import { jwtDecode } from "jwt-decode";

// // // export const saveToken = (token) => localStorage.setItem("token", token);
// // // export const getToken = () => localStorage.getItem("token");
// // // export const removeToken = () => localStorage.removeItem("token");
// // // export const getUser = () => {
// // //   const token = getToken();
// // //   if (!token) return null;
// // //   try { return jwtDecode(token); } catch { return null; }
// // // };
// // // export const getUserRole = () => getUser()?.role?.toLowerCase();
// // // //מה זה???
// // import { jwtDecode } from "jwt-decode";

// // // 1. נגדיר איך נראה המידע בתוך הטוקן שלך
// // interface UserToken {
// //   role: string;
// //   // את יכולה להוסיף כאן שדות נוספים אם יש בטוקן (כמו email, id וכו')
// // }

// // // // 2. הוספת טיפול ב-token: נגדיר שהוא מסוג string
// // // export const saveToken = (token: string) => localStorage.setItem("token", token);

// // // export const getToken = (): string | null => localStorage.getItem("token");

// // // export const removeToken = () => localStorage.removeItem("token");

// // // export const getUser = () => {
// // //   const token = getToken();
// // //   if (!token) return null;
// // //   try {
// // //     // 3. נגיד ל-jwtDecode למה לצפות (UserToken)
// // //     return jwtDecode<UserToken>(token);
// // //   } catch {
// // //     return null;
// // //   }
// // // };

// // // export const getUserRole = () => {
// // //   const user = getUser();
// // //   // השימוש ב-toLowerCase יעבוד עכשיו כי TS יודע ש-role הוא string
// // //   return user?.role?.toLowerCase();
// // // };
// // import { jwtDecode } from "jwt-decode";

// // // 1. נגדיר את המבנה כולל הכתובת הארוכה של מיקרוסופט
// // interface UserToken {
// //   // המפתח הרגיל
// //   role?: string;
// //   // הכתובת שסישארפ בדרך כלל משתמש בה
// //   "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
// //   email?: string;
// //   nameid?: string;
// // }

// // export const saveToken = (token: string) => localStorage.setItem("token", token);
// // export const getToken = (): string | null => localStorage.getItem("token");
// // export const removeToken = () => localStorage.removeItem("token");

// // export const getUser = () => {
// //   const token = getToken();
// //   if (!token) return null;
// //   try {
// //     return jwtDecode<UserToken>(token);
// //   } catch {
// //     return null;
// //   }
// // };

// // export const getUserRole = () => {
// //   const user = getUser();
// //   if (!user) return null;

// //   // 🟢 כאן הקסם: בודקים את שני המפתחות האפשריים
// //   const role = user.role || user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  
// //   return role ? role.toLowerCase() : null;
// // };
// import { jwtDecode } from "jwt-decode";

// // הגדרת המבנה של הטוקן (ה-Payload)
// interface UserToken {
//   nameid?: string; // ה-ID שסישארפ שולח
//   email?: string;
//   "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
//   role?: string;
// }

// export const getToken = (): string | null => localStorage.getItem("token");

// export const getUser = () => {
//   const token = getToken();
//   if (!token) return null;
//   try {
//     return jwtDecode<UserToken>(token);
//   } catch {
//     return null;
//   }
// };

// // 🟢 זו הפונקציה שחסרה לך! ודאי שיש לה export בהתחלה
// export const getUserId = () => {
//   const user = getUser();
//   return user?.nameid || null;
// };

// export const getUserRole = () => {
//   const user = getUser();
//   if (!user) return null;
import { jwtDecode } from "jwt-decode";

// 1. הגדרת המבנה של הטוקן
interface UserToken {
  nameid?: string; 
  sub?: string;
  nameidentifier?: string;
  email?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  role?: string;
}

// 2. פונקציות ניהול הטוקן (עבור Login ו-Setup)
export const saveToken = (token: string) => localStorage.setItem("token", token);

export const getToken = (): string | null => localStorage.getItem("token");

export const removeToken = () => localStorage.removeItem("token");

// 3. פונקציות שליפת מידע מהטוקן
export const getUser = () => {
  const token = getToken();
  
  if (!token) return null;
  try {
    return jwtDecode<UserToken>(token);
  } catch {
    return null;
  }
};

export const getUserId = () => {
  const user = getUser();
  return user?.nameid || user?.sub || user?.nameidentifier || null;
};

export const getUserRole = () => {
  const user = getUser();
  if (!user) return null;
  const role = user.role || user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  return role ? role.toLowerCase() : null;
};

export const getEmployerId = async (): Promise<number | null> => {
  const userId = getUserId();
  if (!userId) return null;
  
  try {
    const response = await fetch(`https://localhost:7198/api/Employer?userId=${userId}`);
    if (!response.ok) return null;
    
    const employers = await response.json();
    const employer = employers.find((emp: any) => emp.userId === parseInt(userId));
    return employer ? employer.id : null;
  } catch {
    return null;
  }
};