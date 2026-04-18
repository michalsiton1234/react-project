// @ts-nocheck
import { useState, useEffect } from "react";
import { api } from "@/api/apiClient"; 
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
      const response = await api.get('/matches/my-offers');
      setMatches(response.data);
    } catch (error) {
      toast.error("שגיאה בטעינת הצעות");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (matchId: string, status: string) => {
    try {
      await api.patch(`/matches/${matchId}/status`, { status });
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
              key={match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 p-5 rounded-xl flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-bold text-white">{match.jobTitle}</h3>
                <p className="text-white/60">{match.employerName}</p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => handleRespond(match.id, 'accepted')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full transition-colors"
                >
                  <CheckCircle size={24} />
                </button>
                <button 
                  onClick={() => handleRespond(match.id, 'rejected')}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
} // סגירת פונקציה