import { createSlice,type PayloadAction } from "@reduxjs/toolkit";
import { getUserRole, getUserId } from "@/lib/auth";

interface AuthState {
  user: any | null;
  token: string | null;
}

// פונקציית אתחול שמפענחת את הטוקן ומאכלסת את ה-user
const getInitialState = (): AuthState => {
  const token = localStorage.getItem("token");
  let user = null;
  
  if (token) {
    try {
      const role = getUserRole();
      const userId = getUserId();
      console.log("AuthSlice: User ID from token:", userId);
      if (role) {
        user = { id: userId, role, fullName: 'משתמש מחובר' };
      }
    } catch (error) {
      console.error("AuthSlice: Error parsing token:", error);
      localStorage.removeItem("token");
    }
  }
  
  return {
    user,
    token,
  };
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer; // הנה ה-Default Export שכולם חיפשו!