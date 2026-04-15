// import { api } from "./apiClient";
// import type { Match } from "@/models/Match";

// export const matchApi = {
//   getMyOffers: async (): Promise<Match[]> => {
//     const res = await api.get("/matches/my-offers");
//     return res.data;
//   },

//   updateStatus: async (matchId: string, status: string) => {
//     return await api.patch(`/matches/${matchId}/status`, { status });
//   },
// };
import { api } from "@/api/apiClient";

// הגדרת המודל - תואם ל-MatchDto בסישארפ
export interface Match {
  id?: number;
  candidateId: number;
  jobId: number;
  matchScore: number;       // הציון שהאלגוריתם נתן
  matchDate?: string;
  status?: string;          // למשל: 'pending', 'approved'
}

export const matchAPI = {
  // 1. קבלת כל ההתאמות - [HttpGet]
  getAll: async () => {
    const response = await api.get<Match[]>("/Match");
    return response.data;
  },

  // 2. קבלת התאמה ספציפית - [HttpGet("{id}")]
  getById: async (id: number) => {
    const response = await api.get<Match>(`/Match/${id}`);
    return response.data;
  },

  // 3. הרצת אלגוריתם השיבוץ האופטימלי - [HttpPost("run")]
  runAlgorithm: async () => {
    const response = await api.post<Match[]>("/Match/run");
    return response.data;
  },

  // 4. קבלת ההתאמות הכי טובות למועמד - [HttpGet("candidate/{candidateId}")]
  getTopMatches: async (candidateId: number, topCount: number = 1) => {
    // שליחת topCount כ-Query Parameter כפי שמוגדר ב-C# [FromQuery]
    const response = await api.get<Match[]>(`/Match/candidate/${candidateId}?topCount=${topCount}`);
    return response.data;
  },

  // 5. קבלת מדד שביעות רצון כללי - [HttpGet("satisfaction")]
  getSatisfactionRate: async () => {
    const response = await api.get<number>("/Match/satisfaction");
    return response.data;
  },

  // 6. חישוב ציון התאמה תיאורטי - [HttpGet("score")]
  getMatchScore: async (candidateId: number, jobId: number) => {
    // שליחת פרמטרים ב-Query String: ?candidateId=1&jobId=2
    const response = await api.get<number>(`/Match/score`, {
      params: { candidateId, jobId }
    });
    return response.data;
  },

  // 7. הוספת התאמה ידנית - [HttpPost]
  create: async (matchData: Match) => {
    const response = await api.post<Match>("/Match", matchData);
    return response.data;
  },

  // 8. עדכון התאמה - [HttpPut("{id}")]
  update: async (id: number, matchData: Match) => {
    const response = await api.put(`/Match/${id}`, matchData);
    return response.data;
  },

  // 9. מחיקת התאמה - [HttpDelete("{id}")]
  delete: async (id: number) => {
    const response = await api.delete(`/Match/${id}`);
    return response.data;
  }
};