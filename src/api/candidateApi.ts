// import { api } from "./apiClient";
// import type { CandidateProfile } from "@/models/CandidateProfile";

// export const candidateApi = {
//   getProfile: async (): Promise<CandidateProfile> => {
//     const res = await api.get("/candidates/me");
//     return res.data;
//   },

//   updateProfile: async (profile: CandidateProfile) => {
//     return await api.put("/candidates/me", profile);
//   },
// };
import { api } from "./apiClient";

// הגדרת טיפוס הנתונים כדי שהקוד יהיה בטוח (תואם ל-CandidateProfileDto)
export interface CandidateProfile {
  id?: number;
  fullName?: string;
  email?: string;
  // הוסיפי כאן את שאר השדות שיש לך ב-DTO ב-C#
}

export const candidateAPI = {
  // 1. קבלת כל המועמדים - [HttpGet]
  getAll: async () => {
    const res = await api.get<CandidateProfile[]>("/Candidate");
    return res.data;
  },

  // 2. קבלת מועמד ספציפי לפי ID - [HttpGet("{id}")]
  getById: async (id: number) => {
    const res = await api.get<CandidateProfile>(`/Candidate/${id}`);
    return res.data;
  },
 getByUserId: async (id: number) => {
    const res = await api.get<CandidateProfile>(`/Candidate/byUser/${id}`);
    return res.data;
  },
  // 3. יצירת מועמד חדש - [HttpPost]
  create: async (data: CandidateProfile) => {
    const res = await api.post<CandidateProfile>("/Candidate", data);
    return res.data;
  },
toemp: async (id: number | string) => {
    const res = await api.get<CandidateProfile>(`/Candidate/toemp/${id}`);
    return res.data;
  },
  // 4. עדכון פרטי מועמד - [HttpPut("{id}")]
  update: async (id: number, data: CandidateProfile) => {
    const res = await api.put(`/Candidate/${id}`, data);
    return res.data;
  },

  // 5. מחיקת מועמד - [HttpDelete("{id}")]
  delete: async (id: number) => {
    const res = await api.delete(`/Candidate/${id}`);
    return res.data;
  },

  // 6. עדכון העדפות בלבד - [HttpPatch("{id}/preferences")]
  updatePreferences: async (id: number, preferences: any) => {
    const res = await api.patch(`/Candidate/${id}/preferences`, preferences);
    return res.data;
  },

  // 7. פונקציה מיוחדת: מציאת המשרה הכי מתאימה - [HttpGet("{id}/best-match")]
  getBestMatch: async (id: number) => {
    const res = await api.get(`/Candidate/${id}/best-match`);
    return res.data;
  },

  // 8. פונקציה מיוחדת: מועמד מאשר לקיחת משרה - [HttpPost("{id}/take-job/{jobId}")]
  takeJob: async (id: number, jobId: number) => {
    const res = await api.post(`/Candidate/${id}/take-job/${jobId}`);
    return res.data;
  }
};