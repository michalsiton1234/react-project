// @ts-nocheck
import { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { Shield, Users, Briefcase, Sparkles, User as UserIcon, MapPin, DollarSign, Trash2, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

// ייבוא מודלים

import { CandidateProfile } from "@/models/CandidateProfile";
import { JobListing } from "@/models/JobListing";
import { Match } from "@/models/Match";
const LEVEL_LABELS = { easy: "קלה", medium: "בינונית", hard: "קשה" };

export default function Admin() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // בסישארפ: ה-Controller של ה-Admin יחזיר את כל הנתונים במערכת
      const [candidatesRes, jobsRes, matchesRes] = await Promise.all([
        api.get('/admin/candidates'),
        api.get('/admin/jobs'),
        api.get('/admin/matches'),
      ]);
      setCandidates(candidatesRes.data);
      setJobs(jobsRes.data);
      setMatches(matchesRes.data);
    } catch (error) {
      toast({ title: "שגיאה בטעינת נתוני מנהל", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!confirm("האם למחוק את ההתאמה הזו?")) return;
    try {
      await api.delete(`/admin/matches/${id}`);
      toast({ title: "ההתאמה נמחקה" });
      loadData();
    } catch (error) {
      toast({ title: "המחיקה נכשלה", variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">לוח ניהול</h1>
          <p className="text-white/40 text-sm">ניהול ובקרת מערכת EasyJob</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "מועמדים", value: candidates.length, icon: Users, gradient: "from-cyan-400 to-blue-500" },
          { label: "משרות", value: jobs.length, icon: Briefcase, gradient: "from-violet-400 to-purple-500" },
          { label: "התאמות", value: matches.length, icon: Sparkles, gradient: "from-emerald-400 to-green-500" },
        ].map(({ label, value, icon: Icon, gradient }) => (
          <div key={label} className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:bg-white/5 transition-colors">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-black mb-0.5">{value}</div>
            <div className="text-xs text-white/40 font-medium">{label}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="candidates" className="w-full">
        <TabsList className="bg-white/5 border border-white/8 rounded-xl mb-6 p-1">
          <TabsTrigger value="candidates" className="rounded-lg gap-1.5"><Users className="w-3.5 h-3.5" />מועמדים</TabsTrigger>
          <TabsTrigger value="jobs" className="rounded-lg gap-1.5"><Briefcase className="w-3.5 h-3.5" />משרות</TabsTrigger>
          <TabsTrigger value="matches" className="rounded-lg gap-1.5"><Sparkles className="w-3.5 h-3.5" />התאמות</TabsTrigger>
        </TabsList>

        {/* Candidates List */}
        <TabsContent value="candidates">
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/5">
            {candidates.length === 0 ? (
              <div className="p-12 text-center text-white/20 italic">לא רשומים מועמדים במערכת</div>
            ) : candidates.map((c) => (
              <div key={c.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">מועמד מ{c.city}</div>
                  <div className="flex gap-3 text-xs text-white/40 mt-0.5">
                    <span>₪{c.min_hourly_rate}/שעה</span>
                    <span>{LEVEL_LABELS[c.level] || c.level}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.activity ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-white/20 border-white/10"}`}>
                    {c.activity ? "פעיל" : "לא פעיל"}
                  </span>
                  <button onClick={() => setSelectedCandidate(c)} className="p-2 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all">
                    <Eye className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Jobs List */}
        <TabsContent value="jobs">
          <div className="grid sm:grid-cols-2 gap-4">
            {jobs.length === 0 ? (
              <div className="col-span-2 p-12 text-center text-white/20 bg-white/3 rounded-2xl border border-white/8">אין משרות פעילות</div>
            ) : jobs.map((j) => (
              <div key={j.id} className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-base">{j.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${j.status === "open" ? "text-emerald-400 border-emerald-500/20" : "text-white/20 border-white/10"}`}>
                    {j.status === "open" ? "פתוחה" : "סגורה"}
                  </span>
                </div>
                <p className="text-xs text-white/40 line-clamp-2 mb-4 leading-relaxed">{j.description}</p>
                <div className="flex gap-4 text-[11px] text-white/30">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{j.city}</span>
                  <span className="flex items-center gap-1.5"><DollarSign className="w-3 h-3" />₪{j.payment}/שעה</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Matches List */}
        <TabsContent value="matches">
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/5">
            {matches.length === 0 ? (
              <div className="p-12 text-center text-white/20 italic">טרם נוצרו התאמות במערכת</div>
            ) : matches.map((m) => (
              <div key={m.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-colors group">
                <Sparkles className={`w-4 h-4 ${m.status === "accepted" ? "text-emerald-400" : m.status === "rejected" ? "text-red-400" : "text-yellow-400"}`} />
                <div className="flex-1">
                  <div className="font-medium text-sm">{m.job_title}</div>
                  <div className="text-[11px] text-white/30">{m.job_city} · {m.status === "accepted" ? "התקבל" : m.status === "rejected" ? "נדחה" : "ממתין"}</div>
                </div>
                <button 
                  onClick={() => handleDeleteMatch(m.id)} 
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Candidate Details Modal */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="bg-[#0d1117] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-cyan-400" />
              פרטי מועמד מלאים
            </DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-6 pt-4" dir="rtl">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "עיר", value: selectedCandidate.city },
                  { label: "רמה", value: LEVEL_LABELS[selectedCandidate.level] || selectedCandidate.level },
                  { label: "דרישת שכר", value: `₪${selectedCandidate.min_hourly_rate}/שעה` },
                  { label: "ניידות", value: `${selectedCandidate.max_distance} ק"מ` },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/30 mb-0.5">{label}</div>
                    <div className="font-bold text-sm">{value}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4">
                {selectedCandidate.is_remote_only && (
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-full">מרחוק בלבד</span>
                )}
                {selectedCandidate.with_people && (
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full">עבודה עם אנשים</span>
                )}
                <span className={`text-[10px] px-2.5 py-1 rounded-full border ${selectedCandidate.activity ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/20 border-white/10"}`}>
                  {selectedCandidate.activity ? "פעיל במערכת" : "לא פעיל"}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}