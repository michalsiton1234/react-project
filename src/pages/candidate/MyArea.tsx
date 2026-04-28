// @ts-nocheck
import { useState, useEffect } from "react";
import { api } from "@/api/apiClient"; // ה-Axios שלך
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, MapPin, CheckCircle, Briefcase, Star, ArrowLeft, Zap } from "lucide-react";

// ייבוא הטיפוסים שבנינו
import type{ CandidateProfile } from "@/models/CandidateProfile";
import type { Match } from "@/models/Match";

// טיפוס למשתמש (אפשר להוסיף לקובץ המודלים בהמשך)
interface UserData {
  full_name: string;
  email: string;
}

export default function MyArea() {
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [acceptedMatches, setAcceptedMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // ב-C# שלך: מומלץ ליצור Endpoint אחד שמחזיר את כל נתוני ה"אזור האישי" 
      // או לבצע כמה קריאות במקביל:
      const [userRes, profileRes, matchesRes] = await Promise.all([
        api.get('/auth/me'),               // פרטי משתמש
        api.get('/Candidate/my-profile'),  // פרופיל המועמד
        api.get('/matches/accepted')       // רק התאמות סטטוס accepted
      ]);

      setUser(userRes.data);
      setProfile(profileRes.data);
      setAcceptedMatches(matchesRes.data);
    } catch (error) {
      console.error("שגיאה בטעינת הנתונים:", error);
    } finally {
      setLoading(false);
    }
  };

  const levelLabel: Record<string, string> = { 
    easy: "קלה", 
    medium: "בינונית", 
    hard: "קשה" 
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-right">האזור האישי שלי</h1>

      {/* User card */}
      <div className="bg-white/3 border border-white/8 rounded-3xl p-6 mb-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 text-right">
            <h2 className="text-lg font-bold">{user?.full_name || "משתמש"}</h2>
            <p className="text-sm text-white/40 flex items-center justify-end gap-1.5">
              {user?.email}<Mail className="w-3.5 h-3.5" />
            </p>
          </div>
          {profile && (
            <span className={`text-xs px-3 py-1 rounded-full border ${profile.activity ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/30 border-white/10"}`}>
              {profile.activity ? "פעיל" : "לא פעיל"}
            </span>
          )}
        </div>

        {profile && (
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { icon: MapPin, label: "עיר", value: profile.city },
              { icon: Zap, label: "רמה", value: levelLabel[profile.level || "easy"] },
              { icon: Star, label: "שכר מינ'", value: `₪${profile.min_hourly_rate}` },
              { icon: MapPin, label: "מרחק", value: `${profile.max_distance} ק"מ` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center p-3 rounded-xl bg-white/3 border border-white/5">
                <Icon className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1.5" />
                <div className="text-sm font-semibold">{value}</div>
                <div className="text-xs text-white/30">{label}</div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate("/candidate/profile")}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-cyan-400 transition-colors mr-auto"
        >
          ערוך פרופיל <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Accepted jobs */}
      <h2 className="text-base font-semibold text-white/60 mb-3 uppercase tracking-wider text-right">עבודות שהתקבלת</h2>
      {acceptedMatches.length === 0 ? (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
          <Briefcase className="w-8 h-8 text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">עדיין לא התקבלת לעבודות</p>
        </div>
      ) : (
        <div className="space-y-3">
          {acceptedMatches.map((match) => (
            <div key={match.id} className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4 flex items-center justify-between gap-4">
              <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full">התקבלת!</span>
              <div className="flex-1 text-right">
                <h3 className="font-semibold">{match.job_title}</h3>
                <div className="flex gap-3 justify-end text-xs text-white/40 mt-0.5">
                  {match.job_payment && <span>₪{match.job_payment}/שעה</span>}
                  {match.job_city && <span className="flex items-center gap-1">{match.job_city}<MapPin className="w-3 h-3" /></span>}
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}