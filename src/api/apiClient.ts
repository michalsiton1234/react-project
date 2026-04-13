// @ts-nocheck
import axios from 'axios';

// כאן את שמה את הכתובת של שרת ה-C# שלך (למשל http://localhost:5000)
const BASE_URL = 'https://localhost:7165/api'; // תשני לפורט הנכון של ה-Visual Studio שלך

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// הוספת Interceptor לטיפול בשגיאות או הוספת טוקן (אופציונלי)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});