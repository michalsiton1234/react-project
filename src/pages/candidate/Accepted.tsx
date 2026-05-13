// @ts-nocheck
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "@/api/apiClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, MapPin, CheckCircle, Briefcase, Star, ArrowLeft, Zap, Bell, ClipboardCheck, LayoutGrid, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { getUserName } from "@/lib/auth";
import { getMyMatches } from "@/api/matchApi";
import type { RootState } from "@/store";

import type { CandidateProfile } from "@/models/CandidateProfile";
import type { Match } from "@/models/Match";

type TabType = "algorithm" | "applied";

export default function Accepted() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [algorithmMatches, setAlgorithmMatches] = useState<any[]>([]);
  const [appliedMatches, setAppliedMatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("algorithm");
  const navigate = useNavigate();

  // טעינת התאמות של המועמד
  const loadMyMatches = async () => {
    try {
      setLoading(true);
      console.log('🚀 Accepted - Loading my matches...');
      
      const data = await getMyMatches();
      console.log('📋 Accepted - My matches loaded:', data);
      
      setAlgorithmMatches(data.algorithmMatches || []);
      setAppliedMatches(data.appliedMatches || []);
    } catch (error) {
      console.error("❌ Accepted - Error loading matches:", error);
      toast.error("שגיאה בטעינת התאמות");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyMatches();
  }, []);

  // פונקצייה לקבוע סטטוס
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "ממתין לאישור", color: "text-yellow-600", bgColor: "bg-yellow-100" };
      case "accepted":
        return { text: "התקבלת! 🎉", color: "text-green-600", bgColor: "bg-green-100" };
      case "rejected":
        return { text: "נדחה", color: "text-red-600", bgColor: "bg-red-100" };
      default:
        return { text: status, color: "text-gray-600", bgColor: "bg-gray-100" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-200 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-200" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => navigate("/candidate/my-area")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-cyan-50 hover:border-cyan-200 transition-colors shadow-sm"
          >
            <span className="text-sm font-medium">חזרה לאזור אישי</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-800">
                התאמות שלי, {getUserName() || user?.full_name || "משתמש"}
              </h1>
              <p className="text-gray-500 text-sm">כל ההתאמה שעברו אלגוריתם</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-2xl">
              🎯
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => setActiveTab("algorithm")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "algorithm" 
                ? "bg-white shadow-sm border border-gray-200 text-gray-800" 
                : "text-gray-500 hover:bg-white/50"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>הצעות מהמערכת</span>
          </button>
          
          <button
            onClick={() => setActiveTab("applied")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "applied" 
                ? "bg-white shadow-sm border border-gray-200 text-gray-800" 
                : "text-gray-500 hover:bg-white/50"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>הגשות שלי</span>
          </button>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === "algorithm" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">הצעות מהמערכת</h2>
              {algorithmMatches.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">אין התאמה אוטומטיות</h3>
                  <p className="text-gray-500 text-sm">האלגוריתם ירוץ כל יום ויצור התאמות אוטומטיות עבורך.</p>
                </div>
              ) : (
                algorithmMatches.map((match) => (
                  <div key={match.MatchId} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{match.Job.Title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          {match.Job.Payment && <span>₪{match.Job.Payment}/שעה</span>}
                          {match.Job.Location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {match.Job.Location}</span>}
                          <span className="flex items-center gap-1">
                            <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs">
                              {match.Job.LevelLabel}
                            </span>
                            <span className="text-xs text-gray-400">ציון: {Math.round(match.MatchScore)}%</span>
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">{match.Job.Description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusText(match.Status).bgColor}`}>
                          {getStatusText(match.Status).text}
                        </div>
                        <div className="text-xs text-gray-500">
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3" />
                            {new Date(match.MatchDate).toLocaleDateString('he-IL')}
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>נבחר על ידי האלגוריתם</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "applied" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">הגשות שלי</h2>
              {appliedMatches.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">לא הגשת לאף משרה</h3>
                  <p className="text-gray-500 text-sm">עדיין להגיש למשרות המתאימות לך בלחיצה על "הגש מועמדות".</p>
                </div>
              ) : (
                appliedMatches.map((match) => (
                  <div key={match.MatchId} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{match.Job.Title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          {match.Job.Payment && <span>₪{match.Job.Payment}/שעה</span>}
                          {match.Job.Location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {match.Job.Location}</span>}
                          <span className="flex items-center gap-1">
                            <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs">
                              {match.Job.LevelLabel}
                            </span>
                            <span className="text-xs text-gray-400">ציון: {Math.round(match.MatchScore)}%</span>
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">{match.Job.Description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusText(match.Status).bgColor}`}>
                          {getStatusText(match.Status).text}
                        </div>
                        <div className="text-xs text-gray-500">
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3" />
                            {new Date(match.MatchDate).toLocaleDateString('he-IL')}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">הוגשת על ידי</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
