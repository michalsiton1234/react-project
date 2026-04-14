// @ts-nocheck
import { useState, useEffect } from "react";
import { api } from "@/api/apiClient"; // החלפנו את base44 ב-Axios שלך
import type { Match } from "@/models/Match"; // המודל שבנינו
import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const statusConfig = {
  pending: { label: "ממתין", bg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock },
  accepted: { label: "התקבל!", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
  rejected: { label: "נדחה", bg: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
};

export default function CandidateOffers() {
  const [matches, setMatches] = useState<Match[]>([]); // הגדרת סוג הנתונים
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOffers(); }, []);

  const loadOffers = async () => {
    try {
      // בסישארפ שלך - ה-API צריך להחזיר רק את ההצעות של המשתמש המחובר
      const response = await api.get('/matches/my-offers');
      setMatches(response.data);
    } catch (error) {
      toast({ title: "שגיאה בטעינת הצעות", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (matchId: string, status: string) => {
    try {
      // עדכון הסטטוס ב-C# (למשל נתיב: api/matches/123/status)
      await api.patch(`/matches/${matchId}/status`, { status });

      toast({
        title: status === "accepted" ? "🎉 קיבלת את ההצעה!" : "ההצעה נדחתה"
      });
      loadOffers(); // רענון הרשימה
    } catch (error) {
      toast({ title: "העדכון נכשל", variant: "destructive" });
    }

  };
}

// ... (כל שאר ה-JSX של ה-Return נשאר בדיוק אותו דבר!)