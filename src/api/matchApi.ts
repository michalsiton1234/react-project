import { api } from "./apiClient";
import type { Match } from "@/models/Match";

export const matchApi = {
  getMyOffers: async (): Promise<Match[]> => {
    const res = await api.get("/matches/my-offers");
    return res.data;
  },

  updateStatus: async (matchId: string, status: string) => {
    return await api.patch(`/matches/${matchId}/status`, { status });
  },
};