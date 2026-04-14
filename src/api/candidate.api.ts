import { api } from "./apiClient";

export const candidateAPI = {
    getProfile: (email: string) =>
        api.get(`/candidate/profile?email=${email}`),

    createProfile: (data: any) =>
        api.post("/candidate/profile", data),

    updateProfile: (id: string, data: any) =>
        api.put(`/candidate/profile/${id}`, data),

    getMatches: (email: string) =>
        api.get(`/candidate/matches?email=${email}`),

    updateMatchStatus: (id: string, status: string) =>
        api.put(`/candidate/match/${id}`, { status }),
};