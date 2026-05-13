// import { api } from "./apiClient";
// import type { JobListing } from "@/models/JobListing";

// export const jobsApi = {
//   getAll: async (): Promise<JobListing[]> => {
//     const res = await api.get("/jobs");
//     return res.data;
//   },

//   create: async (job: JobListing) => {
//     return await api.post("/jobs", job);
//   },
// };
import { api } from "@/api/apiClient";

// הגדרת Interface למשרה - תואם בדיוק לשדות שמופיעים בדף ה-React שלך
export interface JobListing {
  id?: number;
  title: string;
  description: string;
  city?: string;
  payment?: number;
  level?: 'easy' | 'medium' | 'hard';
  is_remote?: boolean;
  with_people?: boolean;
  status?: 'open' | 'closed' | 'filled';
  employerId?: number; // מזהה המעסיק שפרסם
}

export const jobAPI = {
  // GET: api/JobListing - קבלת כל המשרות הקיימות במערכת
  getAll: async () => {
    const response = await api.get<JobListing[]>("/JobListing");
    return response.data;
  },

  // GET: api/JobListing/{id} - קבלת פרטי משרה ספציפית
  getById: async (id: number) => {
    const response = await api.get<JobListing>(`/JobListing/${id}`);
    return response.data;
  },

  // POST: api/JobListing - פרסום משרה חדשה
  create: async (jobData: JobListing) => {
    const response = await api.post<JobListing>("/JobListing", jobData);
    return response.data;
  },

  // PUT: api/JobListing/{id} - עדכון פרטי משרה קיימת
  update: async (id: number, jobData: JobListing) => {
    const response = await api.put(`/JobListing/${id}`, jobData);
    return response.data;
  },

  // DELETE: api/JobListing/{id} - מחיקת משרה
  delete: async (id: number) => {
    const response = await api.delete(`/JobListing/${id}`);
    return response.data;
  },

  // PATCH: api/JobListing/{id}/status - עדכון סטטוס פעיל/לא פעיל (Toggle)
  toggleStatus: async (id: number, isActive: boolean) => {
    // שליחה ב-Query String כפי שמוגדר ב-C# [FromQuery]
    const response = await api.patch(`/JobListing/${id}/status?isActive=${isActive}`);
    return response.data;
  },
  GetTopMatchesForCandidate: async (idCandidate: number) => {
    const response = await api.get(`/JobListing/GetTopMatches/${idCandidate}`);
    return response.data;
  }
};