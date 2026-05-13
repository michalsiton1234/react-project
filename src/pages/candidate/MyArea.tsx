
import { jobAPI } from "@/api/jobsApi";
// הוסיפי את useDispatch
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { useState, useEffect } from "react";
// הוסיפי את הפעולה לעדכון סטטוס (בהנחה שקיימת ב-matchSlice)
import { applyToJobThunk } from "@/store/matchSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Briefcase, Send, Loader2, MapPin,
  Banknote, ArrowLeft, Zap, AlignRight
} from "lucide-react";
import { getUserName } from "@/lib/auth";
import { candidateAPI } from "@/api/candidateApi"; // וודא שיש לך את ה-API הזה אם את צריכה אותו
export default function TopMatchesTest() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>(); // הגדרת הדיספאץ'

  const fetchJobs = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const can = await candidateAPI.getByUserId(user.id)
      debugger
      const data = await jobAPI.GetTopMatchesForCandidate(can.id||0);

      debugger
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      toast.error("שגיאה בטעינת הנתונים מהשרת");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchJobs();
  }, [user?.id]);

  // פונקציית הגשת מועמדות אמיתית
  const handleApplyClick = async (jobId: number, jobTitle: string) => {
    try {
      // הוספת .unwrap() בסוף הדיספאץ'
      await dispatch(applyToJobThunk(jobId)).unwrap();

      toast.success(`הגשת מועמדות ל"${jobTitle}" נשלחה בהצלחה!`);
      fetchJobs();
    } catch (error) {
      // עכשיו זה ייכנס לכאן אם השרת החזיר שגיאה!
      console.error("Apply error:", error);
      // אפשר להציג את השגיאה הספציפית מהשרת אם העברת אותה ב-rejectWithValue
      toast.error(typeof error === 'string' ? error : "אירעה שגיאה בהגשת המועמדות");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-200" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-gray-600 hover:bg-gray-50 transition-all"
          >
            <span>דף הבית</span> <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-right flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">שלום, {getUserName() || "אורח"}</h1>
              <p className="text-gray-500 text-sm">התאמות חכמות עבורך</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-2xl shadow-lg">
              👋
            </div>
          </div>
        </div>

        {/* Banner Card */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl shadow-lg p-6 mb-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">התאמות אלגוריתם</h2>
              <p className="text-white/80 text-sm">מצאנו {suggestions.length} משרות שתואמות בדיוק לפרופיל שלך</p>
            </div>
          </div>
          <button
            onClick={fetchJobs}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mx-auto mb-4" />
              <p className="text-gray-500">מנתח משרות בשרת...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-20 text-center border-2 border-dashed border-gray-300">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">לא נמצאו התאמות כרגע, נסה שוב מאוחר יותר.</p>
            </div>
          ) : (
            suggestions.map((job, index) => {
              const title = job.Title || job.title || "משרה ללא שם";
              const score = job.MatchScore || job.matchScore || 0;
              const id = job.JobId || job.jobId || job.id; // וודאי שיש מפתח מזהה
              const location = job.Location || job.location || "לא צוין";
              const salary = job.Salary || job.salary || job.Payment || job.payment || "לא צוין";
              const description = job.Description || job.description || "";

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={id || index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex gap-4 items-start flex-1">
                        <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 shrink-0">
                          <Briefcase className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-800 text-xl">{title}</h3>
                            <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded uppercase">ID: {id}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                              <MapPin className="w-4 h-4 text-cyan-500" />
                              <span>{location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                              <Banknote className="w-4 h-4 text-cyan-500" />
                              <span>₪{salary} / שעה</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                              <Zap className="w-3 h-3 fill-emerald-600" />
                              <span>{Math.round(score)}% התאמה</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleApplyClick(id, title)} // העברת ה-ID והכותרת
                        className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-100 active:scale-95"
                      >
                        <Send className="w-4 h-4 text-white" />
                        הגש מועמדות
                      </button>
                    </div>

                    {description && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-700 font-bold text-sm">
                          <AlignRight className="w-4 h-4 text-cyan-500" />
                          <h4>תיאור המשרה:</h4>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                          {description}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}