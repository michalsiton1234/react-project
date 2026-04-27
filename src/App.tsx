import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import Layout from './components/Layout';

// Pages
import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Login from './pages/Login';
import CandidateProfile from './pages/candidate/CandidateProfile';
import CandidateOffers from './pages/candidate/CandidateOffers';
import MyArea from './pages/candidate/MyArea';
import Accepted from './pages/candidate/Accepted';
import EmployerJobs from './pages/employer/EmployerJobs';
import EmployerMatches from './pages/employer/EmployerMatches';
import Admin from './pages/Admin';
debugger
const AuthenticatedApp = () => {
  // --- התיקון כאן: משתמשים במידע האמיתי מה-AuthContext ---
  const { isLoading, isAuthenticated } = useAuth();

  // הדפסה לבדיקה ב-Console
  console.log("Current Auth Status:", { isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#080C14] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* נתיבים ציבוריים */}
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Setup />} />
      
      {/* לוגין: אם כבר מחוברת - מעביר אוטומטית למשרות. אם לא - מציג לוגין */}
      <Route 
        path="/login" 
        
        element={!isAuthenticated ? <Login /> : <Navigate to="/employer/jobs" replace />} 
      />

      {/* נתיב Setup מוגן */}
      <Route 
      
        path="/setup" 
        element={isAuthenticated ? <Setup /> : <Navigate to="/login" replace />} 
      />

      {/* --- נתיבים מוגנים (עטופים ב-Layout) --- */}
      <Route element={ <Layout />}>
        {/* נתיבי מעסיק */}
        <Route path="/employer/jobs" element={<EmployerJobs />} />
        <Route path="/employer/matches" element={<EmployerMatches />} />

        {/* נתיבי מועמד */}
        <Route path="/candidate/profile" element={<CandidateProfile />} />
        <Route path="/candidate/offers" element={<CandidateOffers />} />
        <Route path="/candidate/my-area" element={<MyArea />} />
        <Route path="/candidate/accepted" element={<Accepted />} />

        {/* נתיב מנהל */}
        <Route path="/admin" element={<Admin />} />
      </Route>

      {/* דף 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router>
          <AuthenticatedApp />
          <Toaster position="top-center" richColors closeButton />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;