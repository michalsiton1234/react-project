import { api } from "./apiClient";
import type { JobListing } from "@/models/JobListing";

export const jobsApi = {
  getAll: async (): Promise<JobListing[]> => {
    const res = await api.get("/jobs");
    return res.data;
  },

  create: async (job: JobListing) => {
    return await api.post("/jobs", job);
  },
};