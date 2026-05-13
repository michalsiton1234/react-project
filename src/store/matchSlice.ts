import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { applyToJob, matchApi, type Match } from "@/api/matchApi";
import type { RootState } from "@/store";

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
export const fetchMatches = createAsyncThunk(
  "matches/fetchMatches",
  async (_, { getState, rejectWithValue }) => {
    try {
      // בדיקת טוקן
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ matchSlice - No token found');
        return rejectWithValue('No authentication token available');
      }
    
      // Get role from Redux state instead of getUserRole()
      const state = getState() as RootState;
      const userRole = state.auth.user?.role;
      console.log('🔑 matchSlice - Role from Redux:', userRole);
      
      let matches;
      if (userRole === 'employer' || userRole === 'Employer') {
        console.log('🏢 matchSlice - Fetching employer matches...');
        matches = await matchApi.getEmployerMatches();
      } else if (userRole === 'candidate' || userRole === 'Candidate') {
        console.log('👤 matchSlice - Fetching candidate matches...');
        matches = await matchApi.getMyMatches();
      } else {
        console.error('❌ matchSlice - Unknown role:', userRole);
        return rejectWithValue('Unknown user role');
      }
      
      console.log('✅ matchSlice - Received matches:', matches);
      return matches;
    } catch (error: any) {
      console.error('❌ matchSlice - fetchMatches failed:', error);
      console.error('❌ matchSlice - Server response:', error.response?.data);
      console.error('❌ matchSlice - Status:', error.response?.status);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch matches');
    }
  }
);

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
export const applyToJobThunk = createAsyncThunk(
  "matches/applyToJob",
  async (jobId: number, { rejectWithValue }) => {
    try {
            debugger

      // שימוש בפונקציית ה-API שכתבת למטה
      const data = await applyToJob(jobId); 
      return data;
    } catch (error: any) {
      // return rejectWithValue(error.response.data);
throw error; // זריקת השגיאה כדי שתגיע ל-rejected
    }
  }
);
// הפעלת אלגוריתם רק עבור המשתמש המחובר
export const runAlgorithmForMe = createAsyncThunk(
  "matches/runAlgorithmForMe",
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux - Starting algorithm for current user...');
      
      // בדיקת טוקן לפני הקריאה
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ matchSlice - No token found in localStorage for algorithm');
        return rejectWithValue('No authentication token available');
      }
      
      console.log('🔑 matchSlice - Token found, running algorithm...');
      const matches = await matchApi.runAlgorithmForMe();
      console.log('✅ Redux - Algorithm completed, new matches:', matches);
      return matches;
    } catch (error: any) {
      console.error('❌ matchSlice - runAlgorithmForMe failed:', error);
      console.error('❌ matchSlice - Server response:', error.response?.data);
      console.error('❌ matchSlice - Status:', error.response?.status);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to run algorithm');
    }
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
      .addCase(fetchMatches.fulfilled, (state, action: PayloadAction<Match[] | { algorithmMatches: Match[]; appliedMatches: Match[] }>) => {
        console.log('🔄 matchSlice - fetchMatches.fulfilled with:', action.payload);
        console.log('🔄 matchSlice - Payload type:', typeof action.payload);
        console.log('🔄 matchSlice - Is array?', Array.isArray(action.payload));
        
        state.loading = false;
        
        // טיפול במבנה נתונים חדש: { algorithmMatches: [], appliedMatches: [] }
        if (!action.payload) {
          console.log('⚠️ matchSlice - Payload is null/undefined, keeping existing items');
          state.error = "No data received from server";
        } else if ('algorithmMatches' in action.payload && 'appliedMatches' in action.payload) {
          console.log('🔄 matchSlice - New API structure detected, merging arrays');
          const payload = action.payload as { algorithmMatches: Match[]; appliedMatches: Match[] };
          // מיזוג של שני המערכים עם נרמוליזציה
          const allMatches = [...payload.algorithmMatches, ...payload.appliedMatches];
          state.items = allMatches.map(match => ({
            ...match,
            status: match.status || 'pending'
          }));
          state.error = null;
        } else if (!Array.isArray(action.payload)) {
          console.log('⚠️ matchSlice - Payload is not an array, converting:', action.payload);
          // המרת אובייקט בודד למערך עם נרמוליזציה
          const singleMatch = action.payload as Match;
          state.items = [{
            ...singleMatch,
            status: singleMatch.status || 'pending'
          }];
        } else if (action.payload.length === 0) {
          console.log('ℹ️ matchSlice - Empty array received, clearing items');
          state.items = [];
          state.error = null;
        } else {
          console.log('✅ matchSlice - Valid array received, updating items');
          // נרמוליזציה של כל המאצ'ים במערך
          state.items = action.payload.map(match => ({
            ...match,
            status: match.status || 'pending'
          }));
          state.error = null;
        }
        
        console.log('🔄 matchSlice - Final state.items:', state.items);
        console.log('🔄 matchSlice - Final state.items.length:', state.items.length);
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        console.error('❌ matchSlice - fetchMatches.rejected:', action.error);
        console.error('❌ matchSlice - Rejection payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string || action.error.message || "Failed to fetch matches";
      })
      .addCase(runAlgorithmForMe.pending, (state) => {
        console.log('🔄 matchSlice - runAlgorithmForMe.pending');
        state.loading = true;
      })
      .addCase(runAlgorithmForMe.fulfilled, (state, action: PayloadAction<Match[] | { algorithmMatches: Match[]; appliedMatches: Match[] }>) => {
        console.log('🔄 matchSlice - runAlgorithmForMe.fulfilled:', action.payload);
        state.loading = false;
        
        // טיפול במבנה נתונים חדש: { algorithmMatches: [], appliedMatches: [] }
        if ('algorithmMatches' in action.payload && 'appliedMatches' in action.payload) {
          console.log('🔄 matchSlice - Algorithm API structure detected, merging arrays');
          const payload = action.payload as { algorithmMatches: Match[]; appliedMatches: Match[] };
          // מיזוג של שני המערכים עם נרמוליזציה
          const allMatches = [...payload.algorithmMatches, ...payload.appliedMatches];
          const normalizedNewMatches = allMatches.map(match => ({
            ...match,
            status: match.status || 'pending'
          }));
          state.items = normalizedNewMatches;
        } else {
          // הוספת המאצ'ים החדשים לרשימה הקיימת עם נרמוליזציה
          const normalizedNewMatches = action.payload.map(match => ({
            ...match,
            status: match.status || 'pending'
          }));
          state.items = [...state.items, ...normalizedNewMatches];
        }
        
        console.log('🔄 matchSlice - Added new matches, total items:', state.items.length);
      })
      .addCase(runAlgorithmForMe.rejected, (state, action) => {
        console.error('❌ matchSlice - runAlgorithmForMe.rejected:', action.error);
        console.error('❌ matchSlice - Rejection payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string || action.error.message || "Failed to run algorithm";
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