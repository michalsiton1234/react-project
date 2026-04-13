// @ts-nocheck
import { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, Sparkles, Send, CheckCircle, User as UserIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

// ייבוא מודלים
import { JobListing } from "@/models/JobListing";
import { CandidateProfile } from "@/models/CandidateProfile";
import { Match } from "@/models/Match";

const LEVEL_LABELS = { easy: "קלה", medium: "בינונית", hard: "קשה" };

export default function EmployerMatches() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // בסישארפ: מביאים את כל המידע הרלוונטי למעסיק המחובר
      const [jobsRes, candidatesRes, matchesRes] = await Promise.all([
        api.get('/employers/my-jobs'),
        api.get('/candidates/active'), // מביא רק מועמדים פעילים
        api.get('/matches/my-sent-offers') // הצעות שכבר נשלחו
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

  // לוגיקת התאמה (Matching Logic) בצד הלקוח
  const findMatching = (job: JobListing) => {
    return candidates.filter((c) => {
      // 1. בדיקת רמת קושי
      if (job.level !== c.level) return false;
      // 2. בדיקת עבודה מרחוק
      if (!job.is_remote && c.is_remote_only) return false;
      // 3. בדיקת שכר מינימום של המועמד
      if (job.payment < (c.min_hourly_rate || 0)) return false;
      // 4. בדיקה אם כבר נשלחה הצעה למועמד זה למשרה זו
      const alreadyMatched = matches.some(m => m.job_id === job.id && m.candidate_id === c.id);
      return !alreadyMatched;
    });
  };

  const handleSendOffer = async (job: JobListing, candidate: CandidateProfile) => {
    try {
      // יצירת התאמה חדשה ב-DB ושליחת מייל דרך ה-Backend
      await api.post('/matches/send-offer', {
        job_id: job.id,
        candidate_id: candidate.id
      });
      
      toast({ title: "ההצעה נשלחה בהצלחה! 📧" });
      loadData(); // רענון הנתונים
    } catch (error) {
      toast({ title: "שליחת ההצעה נכשלה", variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );

  const filteredJobs = selectedJobId === "all" 
    ? jobs.filter(j => j.status === "open") 
    : jobs.filter(j => j.id === selectedJobId);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      {/* כותרת וסינון */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">התאמות מועמדים</h1>
          <p className="text-white/40 text-sm">מצאו את המועמד המושלם עבורכם</p>
        </div>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-52 bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue placeholder="בחרו משרה" />
          </SelectTrigger>
          <SelectContent className="bg-[#0d1117] border-white/10 text-white">
            <SelectItem value="all">כל המשרות הפתוחות</SelectItem>
            {jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* רשימת משרות והמועמדים המתאימים להן */}
      <div className="space-y-6">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white/3 border border-white/8 rounded-3xl">
            <Briefcase className="w-10 h-10 text-white/15 mx-auto mb-4" />
            <p className="text-white/40">אין משרות פתוחות להצגת התאמות</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const matchingCandidates = findMatching(job);
            return (
              <div key={job.id} className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div>
                    <h3 className="font-bold text-lg">{job.title}</h3>
                    <div className="flex gap-3 text-xs text-white/40 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.city}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />₪{job.payment}/שעה</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" />{matchingCandidates.length} מועמדים מתאימים
                  </span>
                </div>

                <div className="divide-y divide-white/5">
                  {matchingCandidates.length === 0 ? (
                    <div className="p-8 text-center text-white/30 text-sm italic">לא נמצאו מועמדים חדשים שתואמים בדיוק את דרישות המשרה</div>
                  ) : (
                    matchingCandidates.map((c) => (
                      <div key={c.id} className="p-4 flex items-center gap-4 hover:bg-white/3 transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">מועמד מ{c.city}</div>
                          <div className="flex gap-3 text-xs text-white/40 mt-0.5">
                            <span>₪{c.min_hourly_rate}/שעה</span>
                            <span>רמה: {LEVEL_LABELS[c.level]}</span>
                            {c.is_remote_only && <span className="text-cyan-400/60 text-[10px] border border-cyan-400/20 px-1.5 rounded">מרחוק בלבד</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendOffer(job, c)}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" /> שלח הצעה
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* הצעות שכבר נשלחו - היסטוריה */}
      {matches.length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">הצעות שנשלחו לאחרונה</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {matches.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/2">
                <CheckCircle className={`w-4 h-4 ${m.status === 'accepted' ? 'text-emerald-400' : m.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{m.job_title}</div>
                  <div className="text-[10px] text-white/30">סטטוס: {m.status === 'accepted' ? 'התקבל' : m.status === 'rejected' ? 'נדחה' : 'ממתין'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}