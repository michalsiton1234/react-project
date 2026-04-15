import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { matchApi } from "@/api/matchApi";
import type { Match } from "@/models/Match";

interface MatchState {
  matches: Match[];
  loading: boolean;
}

const initialState: MatchState = {
  matches: [],
  loading: false,
};

// שליפה מהשרת
export const fetchMatches = createAsyncThunk(
  "matches/fetch",
  async () => {
    return await matchApi.getMyOffers();
  }
);

// עדכון סטטוס
export const updateMatchStatus = createAsyncThunk(
  "matches/update",
  async ({ id, status }: { id: string; status: string }) => {
    await matchApi.updateStatus(id, status);
    return { id, status };
  }
);

const matchSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.matches = action.payload;
        state.loading = false;
      })
      .addCase(updateMatchStatus.fulfilled, (state, action) => {
        const match = state.matches.find(m => m.job_id === action.payload.id);
        if (match) {
          match.status = action.payload.status as any;
        }
      });
  },
});

export default matchSlice.reducer;