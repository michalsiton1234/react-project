import { useState, useEffect } from "react";
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
  CheckCircle,
  User as UserIcon,
  MapPin,
  DollarSign,
  Sparkles,
  LogOut,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getEmployerId } from "@/lib/auth";
import { toast } from "sonner";
import type { JobListing } from "@/models/JobListing";
import type { CandidateProfile } from "@/models/CandidateProfile";
import type { Match } from "@/models/Match";

const LEVEL_LABELS = { easy: "קלה", medium: "בינונית", hard: "קשה" };

export default function EmployerMatches() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<"matches" | "jobs" | "offers">("matches");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const employerId = await getEmployerId();
      if (!employerId) {
        toast.error("לא נמצא EmployerId תקין");
        return;
      }
      const [jobsRes, candidatesRes, matchesRes] = await Promise.all([
        api.get(`/JobListing/getByEmp/${employerId}`),
        api.get("/candidates/active"),
        api.get("/matches/my-sent-offers"),
      ]);
      setJobs(jobsRes.data);
      setCandidates(candidatesRes.data);
      setMatches(matchesRes.data);
    } catch (error) {
      console.error("טעינת נתונים נכשלה", error);
    } finally {
      setLoading(false);
    }
  };

  const findMatching = (job: JobListing) => {
    return candidates.filter((c) => {
      if (job.level !== c.level) return false;
      if (!job.is_remote && c.is_remote_only) return false;
      if (job.payment < (c.min_hourly_rate || 0)) return false;
      const alreadyMatched = matches.some(
        (m) => m.job_id === job.id && m.candidate_id === c.id
      );
      return !alreadyMatched;
    });
  };

  const handleSendOffer = async (job: JobListing, candidate: CandidateProfile) => {
    try {
      await api.post("/matches/send-offer", {
        job_id: job.id,
        candidate_id: candidate.id,
      });
      toast.success("ההצעה נשלחה בהצלחה! 📧");
      loadData();
    } catch (error) {
      toast.error("שליחת ההצעה נכשלה");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("יצאת בהצלחה");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  const totalMatches = jobs.reduce((acc, job) => acc + findMatching(job).length, 0);
  const openJobs = jobs.filter((j) => !j.status || j.status === "open").length;

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
                const matchingCandidates = findMatching(job);
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
                            {job.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />₪
                            {job.payment}/שעה
                          </span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-sm text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full">
                        <Sparkles className="w-4 h-4" />
                        {matchingCandidates.length} מועמדים מתאימים
                      </span>
                    </div>

                    <div className="divide-y divide-slate-700/50">
                      {matchingCandidates.length === 0 ? (
                        <div className="p-8 text-center text-white/40 text-sm">
                          לא נמצאו מועמדים חדשים שתואמים בדיוק את דרישות המשרה
                        </div>
                      ) : (
                        matchingCandidates.map((c) => (
                          <div
                            key={c.id}
                            className="p-4 flex items-center gap-4 hover:bg-slate-700/30 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-cyan-400" />
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
                            <button
                              onClick={() => handleSendOffer(job, c)}
                              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all"
                            >
                              <Send className="w-3.5 h-3.5" /> שלח הצעה
                            </button>
                          </div>
                        ))
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
              jobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{job.title}</h3>
                      <div className="flex gap-4 text-sm text-white/50 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.city}
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
                  <button className="text-white/50 hover:text-white transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                </motion.div>
              ))
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
                  <CheckCircle
                    className={`w-5 h-5 ${
                      m.status === "accepted"
                        ? "text-emerald-400"
                        : m.status === "rejected"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white">{m.job_title}</div>
                    <div className="text-sm text-white/50">
                      סטטוס:{" "}
                      {m.status === "accepted"
                        ? "התקבל"
                        : m.status === "rejected"
                        ? "נדחה"
                        : "ממתין"}
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