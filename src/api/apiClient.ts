
import axios from 'axios';

// 1. ודאי שהפורט (5035) הוא באמת הפורט של ה-C# שלך כרגע
// תיקון לפורט 7198 שבו נמצא ה-API של המועמדים
const BASE_URL = 'https://localhost:7198/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - הוספת הטוקן
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    // בגרסאות חדשות של Axios, זו הדרך הבטוחה להוסיף Headers
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor - טיפול בשגיאות
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // לא מוחקים את הטוקן אוטומטית - מאפשרים לקומפוננטה לטפל בשגיאה
      // הטיפול ב-401 ייעשה ברמת הקומפוננטה לפי הצורך
    }

    return Promise.reject(error);
  }
);