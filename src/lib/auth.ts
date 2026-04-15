// import { jwtDecode } from "jwt-decode";

// export const saveToken = (token) => localStorage.setItem("token", token);
// export const getToken = () => localStorage.getItem("token");
// export const removeToken = () => localStorage.removeItem("token");
// export const getUser = () => {
//   const token = getToken();
//   if (!token) return null;
//   try { return jwtDecode(token); } catch { return null; }
// };
// export const getUserRole = () => getUser()?.role?.toLowerCase();
// //מה זה???
import { jwtDecode } from "jwt-decode";

// 1. נגדיר איך נראה המידע בתוך הטוקן שלך
interface UserToken {
  role: string;
  // את יכולה להוסיף כאן שדות נוספים אם יש בטוקן (כמו email, id וכו')
}

// 2. הוספת טיפול ב-token: נגדיר שהוא מסוג string
export const saveToken = (token: string) => localStorage.setItem("token", token);

export const getToken = (): string | null => localStorage.getItem("token");

export const removeToken = () => localStorage.removeItem("token");

export const getUser = () => {
  const token = getToken();
  if (!token) return null;
  try {
    // 3. נגיד ל-jwtDecode למה לצפות (UserToken)
    return jwtDecode<UserToken>(token);
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const user = getUser();
  // השימוש ב-toLowerCase יעבוד עכשיו כי TS יודע ש-role הוא string
  return user?.role?.toLowerCase();
};