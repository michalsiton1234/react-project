import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Users,
  Zap,
  Building2,
  Eye,
  Send,
  User as UserIcon,
  MapPin,
  DollarSign,
  
  Sparkles,
  LogOut,
  Plus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getEmployerId } from "@/lib/auth";
import { toast } from "sonner";
import { fetchMatches } from "@/store/matchSlice";
import type { RootState } from "@/store";
import type { JobListing } from "@/models/JobListing";
import type { CandidateProfile } from "@/models/CandidateProfile";
import type { Match } from "@/models/Match";

const LEVEL_LABELS = { easy: "קלה", medium: "בינונית", hard: "קשה" };

export default function EmployerMatches() {
  console.log('🏢 EmployerMatches component - MOUNTED');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { logout } = useAuth();
  const { items: allMatches, loading: matchesLoading } = useSelector((state: RootState) => {
    console.log('🔍 EmployerMatches - Redux State:', state);
    console.log('🔍 EmployerMatches - Matches State:', state.matches);
    console.log('🔍 EmployerMatches - All Matches:', state.matches.items);
    console.log('🔍 EmployerMatches - User:', state.auth.user);
    return state.matches;
  });
  const { user } = useSelector((state: RootState) => {
    console.log('🔍 EmployerMatches - Full Auth State:', state.auth);
    console.log('🔍 EmployerMatches - Auth User:', state.auth.user);
    console.log('🔍 EmployerMatches - Auth Token:', state.auth.token);
    return state.auth;
  });
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [acceptedCandidates, setAcceptedCandidates] = useState<{ [jobId: number]: Match[] }>({});
  const [activeTab, setActiveTab] = useState<"matches" | "jobs" | "offers">("matches");
  const [loading, setLoading] = useState(true);

  // סינון התאמות לפי employerId - מסנן לפי המשרות ששייכות למעסיק
  const matches = allMatches.filter(match => {
    console.log('🔍 Filtering match:', match, 'against user:', user);
    console.log('🔍 User ID:', user?.id, 'Type:', typeof user?.id);
    
    // בדיקה אם המשרה של המאץ' שייכת למעסיק הנוכחי
    const job = jobs.find(j => j.id === match.jobId);
    const isOwner = job && String(job.employerId) === String(user?.id);
    
    console.log('🔍 Match JobId:', match.jobId, 'Found Job:', job, 'Is Owner:', isOwner);
    
    return isOwner; // מציג רק מאצ'ים של המעסיק הנוכחי
  });
  console.log('🔍 Filtered matches for employer:', matches);
  console.log('🔍 Total matches count:', matches.length);

  useEffect(() => {
    console.log('🚀 EmployerMatches - useEffect triggered');
    // טעינת הנתונים הנוספים (jobs, candidates) קודם
    loadData();
  }, [dispatch]);

  // useEffect נפרד ל-fetchMatches - רץ רק אחרי שה-user נטען
  useEffect(() => {
    if (user && user.id) {
      console.log('🚀 EmployerMatches - User loaded, dispatching fetchMatches...');
      console.log('🚀 User ID:', user.id, 'Type:', typeof user.id);
      dispatch(fetchMatches() as any);
    } else {
      console.log('⚠️ EmployerMatches - User not loaded yet, skipping fetchMatches');
    }
  }, [user, dispatch]);

  // טעינת מועמדים שאישרו כשהמשרות נטענות
  useEffect(() => {
    jobs.forEach(job => {
      loadAcceptedCandidates(job.id);
    });
  }, [jobs]);

  const loadData = async () => {
    try {
      console.log('📊 EmployerMatches - Loading data...');
      setLoading(true);
      
      // נסה לקבל employerId אבל אל תכשל אם הוא לא קיים
      let employerId;
      try {
        employerId = await getEmployerId();
        console.log('📊 EmployerMatches - EmployerId:', employerId);
        console.log('📊 EmployerMatches - Expected UserId (from DB): 3071');
        console.log('📊 EmployerMatches - User from Redux:', user);
        
        // וידוא סנכרון UserId
        if (employerId && user?.id) {
          console.log('📊 UserId Sync Check:', {
            frontendUserId: user.id,
            employerIdFromApi: employerId,
            expectedDbUserId: 3071,
            isSynced: String(user.id) === String(employerId)
          });
        }
      } catch (err) {
        console.warn('⚠️ Failed to get employerId:', err);
        employerId = null;
      }
      
      // טען משרות רק אם יש employerId
      let jobsData = [];
      if (employerId) {
        try {
          const jobsRes = await api.get(`/JobListing/getByEmp/${employerId}`);
          jobsData = jobsRes.data || [];
          console.log('✅ Jobs loaded successfully:', jobsData.length);
        } catch (err) {
          console.warn('⚠️ Failed to load jobs, using empty array:', err);
          jobsData = [];
        }
      } else {
        console.warn('⚠️ No employerId, skipping jobs loading');
      }
      
      // טען מועמדים עם הגנה
      let candidatesData = [];
      try {
        const candidatesRes = await api.get("/Candidate");
        candidatesData = candidatesRes.data || [];
        console.log('✅ Candidates loaded successfully:', candidatesData.length);
      } catch (err) {
        console.warn('⚠️ Failed to load candidates, using empty array:', err);
        candidatesData = [];
      }
      
      // עדכן את ה-state רק אם הצלחנו
      setJobs(jobsData);
      setCandidates(candidatesData);
      
      console.log('📊 Final data state:', {
        jobsCount: jobsData.length,
        candidatesCount: candidatesData.length,
        hasEmployerId: !!employerId
      });
      
    } catch (error) {
      console.error("❌ Critical error in loadData:", error);
      // ודא שהמערכים ריקים במקרה של כשלון כללי
      setJobs([]);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const findMatching = (job: JobListing) => {
    return candidates.filter((c) => {
      if (job.level !== c.level) return false;
      if (!job.isRemote && c.is_remote_only) return false;
      if (job.payment < (c.min_hourly_rate || 0)) return false;
      const alreadyMatched = matches.some(
        (m) => m.jobId === job.id && m.candidateId === c.id
      );
      return !alreadyMatched;
    });
  };

  // פונקציה חדשה שמציגה את כל המועמדים הרלוונטיים כולל אלו שאישרו
  const findAllRelevantCandidates = (job: JobListing) => {
    return candidates.filter((c) => {
      if (job.level !== c.level) return false;
      if (!job.isRemote && c.is_remote_only) return false;
      if (job.payment < (c.min_hourly_rate || 0)) return false;
      return true; // מציג את כל המועמדים המתאימים, ללא סינון של מאצ'ים קיימים
    });
  };

  // פונקציה שמקבלת את סטטוס המועמד למשרה ספציפית
  const getCandidateStatusForJob = (candidateId: number, jobId: number) => {
    const match = matches.find(m => m.candidateId === candidateId && m.jobId === jobId);
    return match?.status || null;
  };

  const handleSendOffer = async (job: JobListing, candidate: CandidateProfile) => {
    try {
      await api.post("/matches/send-offer", {
        jobId: job.id,
        candidateId: candidate.id,
      });
      toast.success("ההצעה נשלחה בהצלחה! 📧");
      dispatch(fetchMatches() as any); // רענון ההתאמות אחרי שליחה
    } catch (error) {
      toast.error("שליחת ההצעה נכשלה");
    }
  };

  // טעינת מועמדים שאישרו משרה
  const loadAcceptedCandidates = async (jobId: number) => {
    try {
      console.log(`📋 Loading accepted candidates for job ${jobId}`);
      const response = await api.get<Match[]>(`/Match/job/${jobId}/accepted-candidates`);
      const candidates = response.data;
      setAcceptedCandidates(prev => ({
        ...prev,
        [jobId]: candidates
      }));
      console.log(`✅ Loaded ${candidates.length} accepted candidates for job ${jobId}`);
    } catch (error) {
      console.error(`❌ Failed to load accepted candidates for job ${jobId}:`, error);
      setAcceptedCandidates(prev => ({
        ...prev,
        [jobId]: []
      }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("יצאת בהצלחה");
  };

  if (loading || matchesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  // חישוב מונים מדויקים מה-State של Redux
  const totalMatches = jobs.reduce((acc, job) => acc + findAllRelevantCandidates(job).length, 0);
  const openJobs = jobs.filter((j) => !j.status || j.status === "open").length;
  const allJobs = jobs.length; // כל המשרות כולל סגורות
  
  console.log('📊 Job Status Analysis:');
  console.log('📊 All jobs:', allJobs);
  console.log('📊 Open jobs:', openJobs);
  console.log('📊 Closed jobs:', allJobs - openJobs);
  console.log('📊 Jobs with details:', jobs.map(j => ({ id: j.id, title: j.title, status: j.status })));
  
  // לוגים לאיבחון המונים
  console.log('📊 Dashboard Statistics:');
  console.log('📊 Total matches from Redux:', matches.length);
  console.log('📊 Total relevant candidates:', totalMatches);
  console.log('📊 Open jobs:', openJobs);
  console.log('📊 Jobs:', jobs.map(j => ({ id: j.id, title: j.title, relevantCount: findAllRelevantCandidates(j).length })));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* כותרת עם כפתורים */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">לוח ניהול</h1>
            <p className="text-white/50">ניהול מערכת EasyJob</p>
          </div>

          <div className="flex items-center gap-3">
            {/* כפתור יציאה */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl font-medium transition-all"
            >
              <LogOut size={18} />
              יציאה
            </button>

            {/* כפתור הוספת משרה */}
            <button
              onClick={() => navigate("/employer/jobs")}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Plus size={20} />
              הוספת משרה
            </button>
          </div>
        </div>

        {/* כרטיסי סטטיסטיקה */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* התאמות */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="text-right">
                <p className="text-white/50 text-sm mb-1">התאמות</p>
                <p className="text-3xl font-bold text-white">{totalMatches}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </motion.div>

          {/* מועמדים */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="text-right">
                <p className="text-white/50 text-sm mb-1">מועמדים</p>
                <p className="text-3xl font-bold text-white">{candidates.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </motion.div>

          {/* משרות */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="text-right">
                <p className="text-white/50 text-sm mb-1">משרות פעילות</p>
                <p className="text-3xl font-bold text-white">{openJobs}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* טאבים */}
        <div className="flex items-center gap-2 mb-6 bg-slate-800/30 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("matches")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "matches"
                ? "bg-slate-700 text-white"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            <Zap size={16} />
            התאמות
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "jobs"
                ? "bg-slate-700 text-white"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            <Briefcase size={16} />
            משרות
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "offers"
                ? "bg-slate-700 text-white"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            <Send size={16} />
            הצעות
          </button>
        </div>

        {/* תוכן לפי טאב */}
        {activeTab === "matches" && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
                <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">אין משרות פתוחות להצגת התאמות</p>
              </div>
            ) : (
              jobs.map((job) => {
                const allRelevantCandidates = findAllRelevantCandidates(job);
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden"
                  >
                    <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-white">{job.title}</h3>
                        <div className="flex gap-4 text-sm text-white/50 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />₪
                            {job.payment}/שעה
                          </span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-sm text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full">
                        <Sparkles className="w-4 h-4" />
                        {allRelevantCandidates.length} מועמדים רלוונטיים
                      </span>
                    </div>

                    <div className="divide-y divide-slate-700/50">
                      {allRelevantCandidates.length === 0 ? (
                        <div className="p-8 text-center text-white/40 text-sm">
                          לא נמצאו מועמדים התואמים את דרישות המשרה
                        </div>
                      ) : (
                        allRelevantCandidates.map((c) => {
                          const candidateStatus = getCandidateStatusForJob(c.id!, job.id);
                          return (
                            <div
                              key={c.id}
                              className={`p-4 flex items-center gap-4 transition-colors group ${
                                candidateStatus === 'accepted' 
                                  ? 'bg-emerald-500/5 border-l-4 border-l-emerald-500' 
                                  : candidateStatus === 'rejected'
                                  ? 'bg-red-500/5 border-l-4 border-l-red-500'
                                  : 'hover:bg-slate-700/30'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                candidateStatus === 'accepted'
                                  ? 'bg-emerald-500/20'
                                  : candidateStatus === 'rejected'
                                  ? 'bg-red-500/20'
                                  : 'bg-gradient-to-br from-cyan-400/20 to-blue-500/20'
                              }`}>
                                {candidateStatus === 'accepted' ? (
                                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                                ) : candidateStatus === 'rejected' ? (
                                  <XCircle className="w-5 h-5 text-red-400" />
                                ) : (
                                  <UserIcon className="w-5 h-5 text-cyan-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-white text-sm">
                                  מועמד מ{c.city}
                                </div>
                                <div className="flex gap-3 text-xs text-white/50 mt-0.5">
                                  <span>₪{c.min_hourly_rate}/שעה</span>
                                  <span>רמה: {LEVEL_LABELS[c.level]}</span>
                                  {c.is_remote_only && (
                                    <span className="text-cyan-400/70 border border-cyan-400/30 px-1.5 rounded text-[10px]">
                                      מרחוק בלבד
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {candidateStatus === 'accepted' && (
                                  <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                                    אישר הצעה
                                  </span>
                                )}
                                {candidateStatus === 'rejected' && (
                                  <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
                                    דחה הצעה
                                  </span>
                                )}
                                {!candidateStatus && (
                                  <button
                                    onClick={() => handleSendOffer(job, c)}
                                    className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all"
                                  >
                                    <Send className="w-3.5 h-3.5" /> שלח הצעה
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
                <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50 mb-4">אין משרות פתוחות</p>
                <button
                  onClick={() => navigate("/employer/jobs")}
                  className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-lg text-sm"
                >
                  הוסף משרה חדשה
                </button>
              </div>
            ) : (
              jobs.map((job) => {
                // ספירה ישירה מ-State של Redux - מאצ'ים בסטטוס accepted למשרה ספציפית
                const jobAcceptedCandidates = matches.filter(m => 
                  m.jobId === job.id && m.status === 'accepted'
                );
                console.log(`📊 Job ${job.id} (${job.title}):`, {
                  acceptedCount: jobAcceptedCandidates.length,
                  allMatches: matches.filter(m => m.jobId === job.id),
                  acceptedMatches: jobAcceptedCandidates
                });
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden"
                  >
                    <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{job.title}</h3>
                          <div className="flex gap-4 text-sm text-white/50 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                            <span>₪{job.payment}/שעה</span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                job.status === "open"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-slate-700 text-white/50"
                              }`}
                            >
                              {job.status === "open" ? "פתוחה" : "סגורה"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                          <Users className="w-4 h-4" />
                          {jobAcceptedCandidates.length} מועמדים שאישרו
                        </span>
                        <button className="text-white/50 hover:text-white transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* תצוגת מועמדים שאישרו */}
                    {jobAcceptedCandidates.length > 0 && (
                      <div className="p-4 bg-emerald-500/5 border-t border-emerald-500/10">
                        <div className="text-sm font-medium text-emerald-400 mb-3">מועמדים שאישרו הצעה:</div>
                        <div className="space-y-2">
                          {jobAcceptedCandidates.map((match) => (
                            <div key={match.id} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <UserIcon className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-white">
                                  מועמד #{match.candidateId}
                                </div>
                                <div className="text-xs text-white/50">
                                  ציון התאמה: {match.matchScore} | אישר בתאריך: {new Date(match.matchDate || "").toLocaleDateString('he-IL')}
                                </div>
                              </div>
                              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                                אישר
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "offers" && (
          <div className="space-y-3">
            {matches.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
                <Send className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">לא נשלחו הצעות עדיין</p>
              </div>
            ) : (
              matches.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">התאמה #{m.id}</div>
                    <div className="text-sm text-white/50">
                      מועמד: {m.candidateId} | משרה: {m.jobId}
                    </div>
                    <div className="text-sm text-white/50">
                      סטטוס: {m.status || 'לא ידוע'} | ציון: {m.matchScore}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}