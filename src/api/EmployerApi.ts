import { api } from "@/api/apiClient"; // ייבוא ה-Axios שלך

// הגדרת המודל - וודאי שהוא תואם לשדות ב-EmployerDto שלך
export interface Employer {
  id?: number;
  companyName: string;
  email?: string;
  // הוסיפי כאן שדות נוספים אם יש ב-C# (כמו טלפון, כתובת וכו')
}

// הגדרת המודל של המשרות לצורך פונקציית GetJobs
export interface JobListing {
  id: number;
  title: string;
  description: string;
  // שדות נוספים...
}

export const employerAPI = {
  // GET: api/Employer - קבלת כל המעסיקים
  getAll: async () => {
    const response = await api.get<Employer[]>("/Employer");
    return response.data;
  },

  // GET: api/Employer/{id} - קבלת מעסיק לפי מזהה
  getById: async (id: number) => {
    const response = await api.get<Employer>(`/Employer/${id}`);
    return response.data;
  },

  // GET: api/Employer/{id}/jobs - הפונקציה המיוחדת שהגדרת בשרת!
  getEmployerJobs: async (id: number) => {
    const response = await api.get<JobListing[]>(`/Employer/${id}/jobs`);
    return response.data;
  },

  // POST: api/Employer - יצירת מעסיק חדש
  create: async (employerData: Employer) => {
    const response = await api.post<Employer>("/Employer", employerData);
    return response.data;
  },

  // PUT: api/Employer/{id} - עדכון פרטי מעסיק
  update: async (id: number, employerData: Employer) => {
    const response = await api.put(`/Employer/${id}`, employerData);
    return response.data;
  },

  // DELETE: api/Employer/{id} - מחיקת מעסיק
  delete: async (id: number) => {
    const response = await api.delete(`/Employer/${id}`);
    return response.data;
  }
};