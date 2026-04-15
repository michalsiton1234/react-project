// import { api } from "./apiClient";

// export const candidateAPI = {
//     getProfile: (email: string) =>
//         api.get(`/candidate/profile?email=${email}`),

//     createProfile: (data: any) =>
//         api.post("/candidate/profile", data),

//     updateProfile: (id: string, data: any) =>
//         api.put(`/candidate/profile/${id}`, data),

//     getMatches: (email: string) =>
//         api.get(`/candidate/matches?email=${email}`),

//     updateMatchStatus: (id: string, status: string) =>
//         api.put(`/candidate/match/${id}`, { status }),
// };
// import { api } from "./apiClient";

// export const candidateAPI = {
//     // קבלת כל המועמדים - [HttpGet]
//     getAll: () => 
//         api.get("/Candidate"),

//     // קבלת מועמד לפי ID - [HttpGet("{id}")]
//     getById: (id: number) => 
//         api.get(`/Candidate/${id}`),

//     // יצירת מועמד חדש - [HttpPost]
//     create: (data: any) => 
//         api.post("/Candidate", data),

//     // עדכון פרטי מועמד - [HttpPut("{id}")]
//     update: (id: number, data: any) => 
//         api.put(`/Candidate/${id}`, data),

//     // מחיקת מועמד - [HttpDelete("{id}")]
//     delete: (id: number) => 
//         api.delete(`/Candidate/${id}`),

//     // עדכון העדפות - [HttpPatch("{id}/preferences")]
//     updatePreferences: (id: number, preferences: any) => 
//         api.patch(`/Candidate/${id}/preferences`, preferences),

//     // מציאת המשרה הכי מתאימה - [HttpGet("{id}/best-match")]
//     getBestMatch: (id: number) => 
//         api.get(`/Candidate/${id}/best-match`),

//     // אישור לקיחת משרה - [HttpPost("{id}/take-job/{jobId}")]
//     takeJob: (id: number, jobId: number) => 
//         api.post(`/Candidate/${id}/take-job/${jobId}`),
// };