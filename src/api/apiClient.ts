// import axios from 'axios';


// const BASE_URL = 'http://localhost:5035/api';

// export const api = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor (token)
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');

//   if (token) {
//     config.headers = config.headers ?? {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// // Response interceptor (errors)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     debugger;
//     console.error("API Error:", error);

//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }

//     return Promise.reject(error);
//   }
// );
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
  (response) => response,
  (error) => {
    // אם את רוצה להפסיק לעצור כל פעם, תמחקי את ה-debugger הזה
    // debugger; 

    console.error("API Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });

    if (error.response?.status === 401) {
      console.warn("Unauthorized! Redirecting to login...");
      localStorage.removeItem("token");
      // אם זה קורה מיד כשאת נכנסת, אולי הטוקן פג תוקף בשרת
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);