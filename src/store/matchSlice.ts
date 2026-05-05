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
  console.log('🔄 matchSlice - Fetching matches from API...');
  const matches = await matchApi.getAll(); 
  console.log('🔄 matchSlice - Received matches:', matches);
  return matches; 
});

// עדכון סטטוס מאץ' - משתמש ב-API החדש
export const updateMatchStatus = createAsyncThunk(
  "matches/updateStatus",
  async ({ id, status }: { id: number; status: string }) => {
    console.log(`🔄 Redux - Updating match ${id} to status: ${status}`);
    const updatedMatch = await matchApi.updateStatus(id, status);
    console.log('🔄 Redux - Status updated:', updatedMatch);
    return updatedMatch;
  }
);

// הפעלת אלגוריתם רק עבור המשתמש המחובר
export const runAlgorithmForMe = createAsyncThunk(
  "matches/runAlgorithmForMe",
  async () => {
    console.log('🔄 Redux - Starting algorithm for current user...');
    const matches = await matchApi.runAlgorithmForMe();
    console.log('🔄 Redux - Algorithm completed, new matches:', matches);
    return matches;
  }
);
const matchSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state) => {
        console.log('🔄 matchSlice - fetchMatches.pending');
        state.loading = true;
      })
      .addCase(fetchMatches.fulfilled, (state, action: PayloadAction<Match[]>) => {
        console.log('🔄 matchSlice - fetchMatches.fulfilled with:', action.payload);
        console.log('🔄 matchSlice - Payload type:', typeof action.payload);
        console.log('🔄 matchSlice - Is array?', Array.isArray(action.payload));
        console.log('🔄 matchSlice - Payload length:', action.payload?.length);
        
        state.loading = false;
        
        // טיפול בתוצאות חלקיות או ריקות
        if (!action.payload) {
          console.log('⚠️ matchSlice - Payload is null/undefined, keeping existing items');
          state.error = "No data received from server";
        } else if (!Array.isArray(action.payload)) {
          console.log('⚠️ matchSlice - Payload is not an array, converting:', action.payload);
          state.items = Array.isArray(action.payload) ? action.payload : [action.payload];
        } else if (action.payload.length === 0) {
          console.log('ℹ️ matchSlice - Empty array received, clearing items');
          state.items = [];
          state.error = null; // נקה את השגיאה אם יש תוצאה ריקה תקינה
        } else {
          console.log('✅ matchSlice - Valid array received, updating items');
          state.items = action.payload;
          state.error = null;
        }
        
        console.log('🔄 matchSlice - Final state.items:', state.items);
        console.log('🔄 matchSlice - Final state.items.length:', state.items.length);
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        console.log('🔄 matchSlice - fetchMatches.rejected:', action.error);
        state.loading = false;
        state.error = action.error.message || "Failed to fetch matches";
      })
      .addCase(runAlgorithmForMe.pending, (state) => {
        console.log('🔄 matchSlice - runAlgorithmForMe.pending');
        state.loading = true;
      })
      .addCase(runAlgorithmForMe.fulfilled, (state, action: PayloadAction<Match[]>) => {
        console.log('🔄 matchSlice - runAlgorithmForMe.fulfilled:', action.payload);
        state.loading = false;
        // הוספת המאצ'ים החדשים לרשימה הקיימת
        state.items = [...state.items, ...action.payload];
        console.log('🔄 matchSlice - Added new matches, total items:', state.items.length);
      })
      .addCase(runAlgorithmForMe.rejected, (state, action) => {
        console.log('🔄 matchSlice - runAlgorithmForMe.rejected:', action.error);
        state.loading = false;
        state.error = action.error.message || "Failed to run algorithm";
      })
      .addCase(updateMatchStatus.pending, (state) => {
        console.log('🔄 matchSlice - updateMatchStatus.pending');
        state.loading = true;
      })
      .addCase(updateMatchStatus.fulfilled, (state, action: PayloadAction<Match>) => {
        console.log('🔄 matchSlice - updateMatchStatus.fulfilled:', action.payload);
        state.loading = false;
        // עדכון המאץ' הספציפי ברשימה
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          console.log('🔄 matchSlice - Updated match at index:', index);
        }
      })
      .addCase(updateMatchStatus.rejected, (state, action) => {
        console.log('🔄 matchSlice - updateMatchStatus.rejected:', action.error);
        state.loading = false;
        state.error = action.error.message || "Failed to update status";
      });
  },
});

export default matchSlice.reducer;