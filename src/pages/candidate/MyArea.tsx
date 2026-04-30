// @ts-nocheck
import { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, MapPin, CheckCircle, Briefcase, Star, ArrowLeft, Zap, Bell, ClipboardCheck, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { getUserName } from "@/lib/auth";

import type { CandidateProfile } from "@/models/CandidateProfile";
import type { Match } from "@/models/Match";

interface UserData {
  full_name: string;
  email: string;
}

type TabType = "offers" | "accepted" | "all";

export default function MyArea() {
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [offers, setOffers] = useState<Match[]>([]);
  const [acceptedMatches, setAcceptedMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("offers");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // טעינת פרופיל
      let profileRes;
      try {
        profileRes = await api.get('/Candidate/my-profile');
      } catch (e1) {
        try {
          profileRes = await api.get('/candidate/my-profile');
        } catch (e2) {
          profileRes = { data: null };
        }
      }

      // טעינת הצעות והתקבלות
      let offersRes = { data: [] };
      let acceptedRes = { data: [] };
      try {
        [offersRes, acceptedRes] = await Promise.all([
          api.get('/matches/my-offers'),
          api.get('/matches/accepted')
        ]);
      } catch (e) {
        console.log("לא ניתן לטעון הצעות/התקבלות");
      }

      setUser({ full_name: "משתמש", email: "" }); // TODO: לטעון מהטוקן או API
      setProfile(profileRes.data);
      setOffers(offersRes.data || []);
      setAcceptedMatches(acceptedRes.data || []);
    } catch (error) {
      console.error("שגיאה בטעינת הנתונים:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (matchId: number) => {
    try {
      await api.post(`/matches/${matchId}/accept`);
      toast.success("הצעה התקבלה!");
      loadData();
    } catch (error) {
      toast.error("שגיאה בקבלת ההצעה");
    }
  };

  const handleRejectOffer = async (matchId: number) => {
    try {
      await api.post(`/matches/${matchId}/reject`);
      toast.success("הצעה נדחתה");
      loadData();
    } catch (error) {
      toast.error("שגיאה בדחיית ההצעה");
    }
  };

  const levelLabel: Record<string, string> = { 
    easy: "קלה", 
    medium: "בינונית", 
    hard: "קשה" 
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-200 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-200" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Header - שלום [שם] + כפתורי ניווט */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          {/* כפתור חזרה לדף הבית בצד ימין */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-cyan-50 hover:border-cyan-200 transition-colors shadow-sm"
          >
            <span className="text-sm font-medium">דף הבית</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          {/* שלום + שם משתמש בצד ימין */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-800">
                שלום, {getUserName() || profile?.full_name || user?.full_name || "משתמש"}
              </h1>
              <p className="text-gray-500 text-sm">האזור האישי שלך</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-2xl">
              👋
            </div>
          </div>
        </motion.div>

        {/* כפתור עדכון פרופיל מתחת ל-header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex justify-end mb-4"
        >
          <button
            onClick={() => navigate("/candidate/profile")}
            className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-cyan-500 transition-colors"
          >
            <span className="text-sm font-medium">עדכן פרופיל</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Profile Card */}
        {profile && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl shadow-lg p-6 mb-6 text-white"
          >
            <div className="flex items-center gap-6">
              {/* רמת קושי */}
              <div className="flex flex-col items-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  profile.level === 'easy' ? 'bg-white/20 text-white' :
                  profile.level === 'medium' ? 'bg-white/20 text-white' :
                  'bg-white/20 text-white'
                }`}>
                  {levelLabel[profile.level || "easy"]}
                </span>
                <span className="text-xs text-white/70">רמה</span>
              </div>

              {/* מרחק */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1 text-white">
                  <span className="text-lg font-semibold">{profile.max_distance || 0}</span>
                  <Briefcase className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-xs text-white/70">הצעות</span>
              </div>

              {/* שכר */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1 text-white">
                  <span className="text-lg font-semibold">₪{profile.min_hourly_rate || 30}</span>
                  <span className="text-xs text-white/70">/שעה</span>
                </div>
                <span className="text-xs text-white/70">שכר מינימלי</span>
              </div>

              {/* עיר */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1 text-white">
                  <span className="text-lg font-semibold">{profile.city || "לא צוין"}</span>
                  <MapPin className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-xs text-white/70">עיר</span>
              </div>

              {/* סטטוס פעיל */}
              <div className="mr-auto flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${profile.activity ? 'bg-white' : 'bg-white/50'}`}></span>
                <span className="text-sm text-white/90">{profile.activity ? "פעיל" : "לא פעיל"}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => setActiveTab("offers")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "offers" 
                ? "bg-white shadow-sm border border-gray-200 text-gray-800" 
                : "text-gray-500 hover:bg-white/50"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>הצעות</span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">({offers.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab("accepted")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "accepted" 
                ? "bg-white shadow-sm border border-gray-200 text-gray-800" 
                : "text-gray-500 hover:bg-white/50"
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>התקבלתי</span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">({acceptedMatches.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "all" 
                ? "bg-white shadow-sm border border-gray-200 text-gray-800" 
                : "text-gray-500 hover:bg-white/50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>הכל</span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">({offers.length + acceptedMatches.length})</span>
          </button>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {activeTab === "offers" && (
            <div className="space-y-4">
              {offers.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">אין הצעות חדשות כרגע</h3>
                  <p className="text-gray-500 text-sm">נעדכן אותך כשיתחדשו הצעות משרה מתאימות עבורך!</p>
                </div>
              ) : (
                offers.map((offer) => (
                  <div key={offer.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{offer.job_title || "משרה"}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {offer.job_payment && <span>₪{offer.job_payment}/שעה</span>}
                          {offer.job_city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {offer.job_city}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectOffer(offer.id)}
                          className="px-4 py-2 text-gray-500 hover:text-red-500 transition-colors"
                        >
                          דחה
                        </button>
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                        >
                          קבל הצעה
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "accepted" && (
            <div className="space-y-4">
              {acceptedMatches.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">עדיין לא התקבלת לעבודות</h3>
                  <p className="text-gray-500 text-sm">כאן יופיעו העבודות שהתקבלת אליהם</p>
                </div>
              ) : (
                acceptedMatches.map((match) => (
                  <div key={match.id} className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{match.job_title || "משרה"}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          {match.job_payment && <span>₪{match.job_payment}/שעה</span>}
                          {match.job_city && <span>{match.job_city}</span>}
                        </div>
                      </div>
                      <span className="text-emerald-600 font-medium">התקבלת!</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "all" && (
            <div className="space-y-4">
              {[...offers, ...acceptedMatches].length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">אין משרות להצגה</h3>
                  <p className="text-gray-500 text-sm">עדיין אין לך הצעות או התקבלויות</p>
                </div>
              ) : (
                <>
                  {offers.map((offer) => (
                    <div key={`offer-${offer.id}`} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{offer.job_title || "משרה"}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            {offer.job_payment && <span>₪{offer.job_payment}/שעה</span>}
                            {offer.job_city && <span>{offer.job_city}</span>}
                          </div>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">ממתין</span>
                      </div>
                    </div>
                  ))}
                  {acceptedMatches.map((match) => (
                    <div key={`accepted-${match.id}`} className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{match.job_title || "משרה"}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            {match.job_payment && <span>₪{match.job_payment}/שעה</span>}
                            {match.job_city && <span>{match.job_city}</span>}
                          </div>
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">התקבלת</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}