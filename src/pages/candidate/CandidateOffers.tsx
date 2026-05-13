// @ts-nocheck
import { useState, useEffect } from "react";
import { api } from "@/api/apiClient"; 
import { matchApi } from '@/api/matchApi';
// import { getMyMatches } from "@/api/matchApi";
import type { Match } from "@/models/Match"; 
import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const statusConfig = {
  pending: { label: "ממתין", bg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock },
  accepted: { label: "התקבל!", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
  rejected: { label: "נדחה", bg: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
};

export default function CandidateOffers() {
  const [matches, setMatches] = useState<Match[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOffers(); }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data =  await matchApi.getMyMatches();
      // Combine both algorithm matches and applied matches
      const allMatches = [...(data.algorithmMatches || []), ...(data.appliedMatches || [])];
      setMatches(allMatches);
    } catch (error) {
      toast.error("שגיאה בטעינת הצעות");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (matchId: string, status: string) => {
    try {
      await api.put(`/Match/${matchId}/status`, { status });
      toast.success(status === "accepted" ? "🎉 קיבלת את ההצעה!" : "ההצעה נדחתה");
      loadOffers(); 
    } catch (error) {
      toast.error("העדכון נכשל");
    }
  };

  // 🔴 כאן הייתה הבעיה! חסר ה-return שסוגר את הפונקציה 🔴
  if (loading) return <div className="text-white p-10">טוען הצעות...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto text-right" dir="rtl">
      <h1 className="text-2xl font-bold text-white mb-6">הצעות העבודה שלי</h1>
      
      <div className="grid gap-4">
        {matches.length === 0 ? (
          <p className="text-white/50">אין הצעות חדשות כרגע.</p>
        ) : (
          matches.map((match) => (
            <motion.div 
              key={match.MatchId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 p-5 rounded-xl flex justify-between items-center"
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{match.Job?.Title || 'משרה'}</h3>
                <div className="text-white/60 text-sm mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {match.Job?.Location}
                  </span>
                  {match.Job?.Payment && <span className="mr-3">₪{match.Job.Payment}/שעה</span>}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    match.Status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    match.Status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                    match.Status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {statusConfig[match.Status as keyof typeof statusConfig]?.label || match.Status}
                  </span>
                  <span className="text-xs text-white/40">
                    ציון: {Math.round(match.MatchScore)}% | {new Date(match.MatchDate).toLocaleDateString('he-IL')}
                  </span>
                </div>
              </div>
              
              {match.Status === 'pending' && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleRespond(match.MatchId.toString(), 'accepted')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full transition-colors"
                  >
                    <CheckCircle size={24} />
                  </button>
                  <button 
                    onClick={() => handleRespond(match.MatchId.toString(), 'rejected')}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
} // סגירת פונקציה