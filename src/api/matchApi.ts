import { jwtDecode } from "jwt-decode";
import { api as axiosApi } from "./apiClient";
import type { Match as MatchType } from "@/models/Match";

// Define UserToken interface locally since it's not exported from auth.ts
interface UserToken {
  nameid?: string;
  sub?: string;
  nameidentifier?: string;
}

// export const matchApi = {
//   getMyOffers: async (): Promise<Match[]> => {
//     const res = await api.get("/matches/my-offers");
//     return res.data;
//   },

//   updateStatus: async (matchId: string, status: string) => {
//     return await api.patch(`/matches/${matchId}/status`, { status });
//   },
// };
// import { api } from "@/api/apiClient";

// // הגדרת המודל - תואם ל-MatchDto בסישארפ
// export interface Job {
//   id: number;
//   title: string;
//   description: string;
//   location: string;
//   payment?: number;
//   requiredDate: string;
//   isCatch: boolean;
//   isRemote: boolean;
//   isJobWithPepole: boolean;
//   categoryId: number;
//   leveJob: 'Easy' | 'Medium' | 'Hard';
//   employerId: number;
// }

// export interface Match {
//   id?: number;
//   candidateId: number;
//   jobId: number;
//   job?: Job;                // פרטי המשרה המלאים
//   matchScore: number;       // הציון שהאלגוריתם נתן
//   matchDate?: string;
//   status?: string;          // למשל: 'pending', 'approved'
// }

// export const matchApi = {
//   // 1. קבלת כל ההתאמות - [HttpGet]
//   getAll: async () => {
//     console.log('🌐 matchApi.getAll - Making request to /Match...');
//     const response = await api.get<Match[]>("/Match");
//     console.log('🌐 matchApi.getAll - Full response:', response);
//     console.log('🌐 matchApi.getAll - Response data:', response.data);
//     console.log('🌐 matchApi.getAll - Is array?', Array.isArray(response.data));
//     console.log('🌐 matchApi.getAll - Data type:', typeof response.data);
//     return response.data;
//   },

//   // 2. קבלת התאמה ספציפית - [HttpGet("{id}")]
//   getById: async (id: number) => {
//     const response = await api.get<Match>(`/Match/${id}`);
//     return response.data;
//   },

//   // 3. הרצת אלגוריתם השיבוץ האופטימלי - [HttpPost("run")]
//   runAlgorithm: async () => {
//     const response = await api.post<Match[]>("/Match/run");
//     return response.data;
//   },

//   // 4. קבלת ההתאמות הכי טובות למועמד - [HttpGet("candidate/{candidateId}")]
//   getTopMatches: async (candidateId: number, topCount: number = 1) => {
//     // שליחת topCount כ-Query Parameter כפי שמוגדר ב-C# [FromQuery]
//     const response = await api.get<Match[]>(`/Match/candidate/${candidateId}?topCount=${topCount}`);
//     return response.data;
//   },

//   // 5. קבלת מדד שביעות רצון כללי - [HttpGet("satisfaction")]
//   getSatisfactionRate: async () => {
//     const response = await api.get<number>("/Match/satisfaction");
//     return response.data;
//   },

//   // 6. חישוב ציון התאמה תיאורטי - [HttpGet("score")]
//   getMatchScore: async (candidateId: number, jobId: number) => {
//     // שליחת פרמטרים ב-Query String: ?candidateId=1&jobId=2
//     const response = await api.get<number>(`/Match/score`, {
//       params: { candidateId, jobId }
//     });
//     return response.data;
//   },

//   // 7. הוספת התאמה ידנית - [HttpPost]
//   create: async (matchData: Match) => {
//     const response = await api.post<Match>("/Match", matchData);
//     return response.data;
//   },

//   // 8. עדכון התאמה - [HttpPut("{id}")]
//   update: async (id: number, matchData: Match) => {
//     const response = await api.put(`/Match/${id}`, matchData);
//     return response.data;
//   },

//   // 9. מחיקת התאמה - [HttpDelete("{id}")]
//   delete: async (id: number) => {
//     const response = await api.delete(`/Match/${id}`);
//     return response.data;
//   },

//   // 10. הרצת אלגוריתם רק עבור המשתמש המחובר - [HttpPost("run-for-me")]
//   runAlgorithmForMe: async () => {
//     console.log('🚀 matchApi.runAlgorithmForMe - Running algorithm for current user...');
//     const response = await api.post<Match[]>("/Match/run-for-me");
//     console.log('🚀 matchApi.runAlgorithmForMe - Algorithm completed:', response.data);
//     return response.data;
//   },

//   // 11. עדכון סטטוס מאץ' - [HttpPut("{id}/status")]
//   updateStatus: async (id: number, status: string) => {
//     console.log(`🔄 matchApi.updateStatus - Updating match ${id} to status: ${status}`);
//     const response = await api.put<Match>(`/Match/${id}/status`, { status });
//     console.log('🔄 matchApi.updateStatus - Status updated:', response.data);
//     return response.data;
//   },

//   // 12. קבלת מועמדים שאישרו משרה - [HttpGet("job/{jobId}/accepted-candidates")]
//   getAcceptedCandidatesForJob: async (jobId: number) => {
//     console.log(`📋 matchApi.getAcceptedCandidatesForJob - Getting accepted candidates for job ${jobId}`);
//     const response = await api.get<Match[]>(`/Match/job/${jobId}/accepted-candidates`);
//     console.log('📋 matchApi.getAcceptedCandidatesForJob - Candidates:', response.data);
//     return response.data;
//   },

//   // 13. קבלת הצעות למועמד - [HttpGet("candidate-suggestions")]
//   getCandidateSuggestions: async () => {
//     console.log('🌐 matchApi.getCandidateSuggestions - Making request to /Match/candidate-suggestions');
//     const response = await api.get("/Match/candidate-suggestions");
//     console.log('🌐 matchApi.getCandidateSuggestions - Response:', response.data);
//     return response.data;
//   },

//   // 14. הגשת מועמד למשרה - [HttpPost("apply")]
//   applyToJob: async (jobId: number) => {
//     console.log(`🚀 matchApi.applyToJob - Applying to job ${jobId}`);
//     const response = await api.post("/Match/apply", { jobId });
//     console.log('🚀 matchApi.applyToJob - Response:', response.data);
//     return response.data;
//   },

//   // 15. קבלת המאצ'ים של המועמד - [HttpGet("my-matches")]
//   getMyMatches: async () => {
//     console.log('🌐 matchApi.getMyMatches - Making request to /Match/my-matches');
//     const response = await api.get("/Match/my-matches");
//     console.log('🌐 matchApi.getMyMatches - Response:', response.data);
//     return response.data;
//   },

//   // 16. קבלת הצעות למעסיק - [HttpGet("employer-offers")]
//   getEmployerOffers: async () => {
//     console.log('🌐 matchApi.getEmployerOffers - Making request to /Match/employer-offers');
//     const response = await api.get("/Match/employer-offers");
//     console.log('🌐 matchApi.getEmployerOffers - Response:', response.data);
//     return response.data;
//   }
// };
import { api } from "@/api/apiClient";

// --- Interfaces ---
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
  job?: Job;
  matchScore: number;
  matchDate?: string;
  status?: string;
  isSelectedByAlgorithm?: boolean; // Added for algorithm selection tracking
}

// --- פונקציות מיוצאות (Named Exports) ---

export const getAll = async () => {
  const response = await api.get<Match[]>("/Match");
  return response.data;
};
export const GetMatchsByEmpID=async (empId:number) => {
  const response = await api.get<Match[]>(`/Match/getByEmp/${empId}`);
  return response.data;
}
export const GetMatchByJobID=async (jobId:number) => {
  const response = await api.get<Match[]>(`/Match/mostMatch/${jobId}`);
  return response.data;
}
export const GetRejecteds=async (empID:number) => {
  const response = await api.get<Match[]>(`/Match/getRejecteds/${empID}`);
  return response.data;
}
export const getMyMatches = async () => {
  const response = await api.get<Match[]>("/Match/my-mostMatch");
  return response.data;
};

export const getCandidateSuggestions = async () => {
  const response = await api.get<Match[]>("/Match/candidate-suggestions");
  return response.data;
};

// הפונקציה שחסרה לך בתמונה האחרונה:
export const getEmployerOffers = async () => {
  console.log('🌐 matchApi.getEmployerOffers - Fetching...');
  const response = await api.get<Match[]>("/Match/employer-offers");
  return response.data;
};

export const getEmployerMatches = async () => {
  console.log('🌐 matchApi.getEmployerMatches - Fetching...');

  // Get employerId from token for API call
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ getEmployerMatches - No token found');
    return [];
  }

  try {
    const decoded = jwtDecode<UserToken>(token);
    const employerId = decoded.nameid || decoded.sub || decoded.nameidentifier;
    console.log('🌐 getEmployerMatches - Using employerId:', employerId);

    // Use direct path: /api/Match/{employerId}
    const response = await axiosApi.get<MatchType[]>(`/Match/${employerId}`);
    console.log('🌐 getEmployerMatches - Response:', response);
    console.log('🌐 getEmployerMatches - Response data:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ getEmployerMatches - Error:', error);
    console.error('❌ getEmployerMatches - Error status:', error.response?.status);
    console.error('❌ getEmployerMatches - Error response data:', error.response?.data);
    console.error('❌ getEmployerMatches - Full error response:', error.response);

    // Log the exact 400 error message if available
    if (error.response?.status === 400) {
      console.error('❌ getEmployerMatches - 400 Bad Request Details:');
      console.error('   - URL:', error.config?.url);
      console.error('   - Method:', error.config?.method);
      console.error('   - Headers:', error.config?.headers);
      console.error('   - Response Data:', JSON.stringify(error.response.data, null, 2));
    }

    return [];
  }
};



export const updateStatus = async (id: number, status: string) => {
  const response = await api.put<Match>(`/Match/${id}/status`, { status });
  return response.data;
};

export const applyToJob = async (jobId: number) => {
  try {
    const response = await api.post("/Match/apply", { jobId });
    return response.data;
  }
  catch (error: any) {
    console.error('❌ applyToJob - Error:', error);
    throw error; // Rethrow to be caught in the thunk
  }
};

// --- ייצוא האובייקט (למקרה שיש דפים שמשתמשים ב-matchApi.something) ---
export const matchApi = {
  getAll,
  getMyMatches,
  getCandidateSuggestions,
  getEmployerOffers,
  getEmployerMatches,
  updateStatus,
  applyToJob
};