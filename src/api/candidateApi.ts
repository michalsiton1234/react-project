import { api } from "./apiClient";
import type { CandidateProfile } from "@/models/CandidateProfile";

export const candidateApi = {
  getProfile: async (): Promise<CandidateProfile> => {
    const res = await api.get("/candidates/me");
    return res.data;
  },

  updateProfile: async (profile: CandidateProfile) => {
    return await api.put("/candidates/me", profile);
  },
};