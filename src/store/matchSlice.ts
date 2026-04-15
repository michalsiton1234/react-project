import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { matchApi, type Match } from "@/api/matchApi";

interface MatchState {
  items: Match[];
  loading: boolean;
  error: string | null;
}

const initialState: MatchState = {
  items: [],
  loading: false,
  error: null,
};

// פעולה אסינכרונית להבאת כל ההתאמות
// במקום getMyOffers, השתמשי ב-getAll
export const fetchMatches = createAsyncThunk("matches/fetchAll", async () => {
  return await matchApi.getAll(); 
});

// במקום updateStatus, השתמשי ב-update
export const updateMatchStatus = createAsyncThunk(
  "matches/updateStatus",
  async ({ id, matchData }: { id: number; matchData: Match }) => {
    return await matchApi.update(id, matchData); 
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
      .addCase(fetchMatches.fulfilled, (state, action: PayloadAction<Match[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch matches";
      });
  },
});

export default matchSlice.reducer;