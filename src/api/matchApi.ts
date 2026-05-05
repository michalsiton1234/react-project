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
export interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  payment?: number;
  requiredDate: string;
  isCatch: boolean;
  isRemote: boolean;
  isJobWithPepole: boolean;
  categoryId: number;
  leveJob: 'Easy' | 'Medium' | 'Hard';
  employerId: number;
}

export interface Match {
  id?: number;
  candidateId: number;
  jobId: number;
  job?: Job;                // פרטי המשרה המלאים
  matchScore: number;       // הציון שהאלגוריתם נתן
  matchDate?: string;
  status?: string;          // למשל: 'pending', 'approved'
}

export const matchApi = {
  // 1. קבלת כל ההתאמות - [HttpGet]
  getAll: async () => {
    console.log('🌐 matchApi.getAll - Making request to /Match...');
    const response = await api.get<Match[]>("/Match");
    console.log('🌐 matchApi.getAll - Full response:', response);
    console.log('🌐 matchApi.getAll - Response data:', response.data);
    console.log('🌐 matchApi.getAll - Is array?', Array.isArray(response.data));
    console.log('🌐 matchApi.getAll - Data type:', typeof response.data);
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
  },

  // 10. הרצת אלגוריתם רק עבור המשתמש המחובר - [HttpPost("run-for-me")]
  runAlgorithmForMe: async () => {
    console.log('🚀 matchApi.runAlgorithmForMe - Running algorithm for current user...');
    const response = await api.post<Match[]>("/Match/run-for-me");
    console.log('🚀 matchApi.runAlgorithmForMe - Algorithm completed:', response.data);
    return response.data;
  },

  // 11. עדכון סטטוס מאץ' - [HttpPut("{id}/status")]
  updateStatus: async (id: number, status: string) => {
    console.log(`🔄 matchApi.updateStatus - Updating match ${id} to status: ${status}`);
    const response = await api.put<Match>(`/Match/${id}/status`, { status });
    console.log('🔄 matchApi.updateStatus - Status updated:', response.data);
    return response.data;
  },

  // 12. קבלת מועמדים שאישרו משרה - [HttpGet("job/{jobId}/accepted-candidates")]
  getAcceptedCandidatesForJob: async (jobId: number) => {
    console.log(`📋 matchApi.getAcceptedCandidatesForJob - Getting accepted candidates for job ${jobId}`);
    const response = await api.get<Match[]>(`/Match/job/${jobId}/accepted-candidates`);
    console.log('📋 matchApi.getAcceptedCandidatesForJob - Candidates:', response.data);
    return response.data;
  }
};