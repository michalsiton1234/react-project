import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { Briefcase, Users, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner"; // שימוש ב-Sonner כפי שמופיע ב-Imports שלך
import { saveToken } from "@/lib/auth";

export default function Setup() {
  const [selectedType, setSelectedType] = useState<"Candidate" | "Employer" | null>(null);
  const [loading, setLoading] = useState(false);
  
  // משתנים חדשים שנוספו כדי לתמוך בפונקציית הרישום
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error("אנא בחר סוג חשבון");
      return;
    }
    
    setLoading(true);
    try {
      // 1. קביעת ה-Endpoint לפי הפורמט שביקשו ממך (lower case)
      const rolePath = selectedType.toLowerCase();
      const endpoint = `/User/register/${rolePath}`;

      // 2. ביצוע הקריאה לשרת - העברת סיסמה ב-URL ושאר הנתונים ב-Body
      // שימוש ב-api (Axios) במקום fetch כדי לשמור על עקביות
      const res = await api.post(`${endpoint}?password=${password}`, {
        email,
        fullName
      });

      // 3. שמירת הטוקן (השרת מחזיר string של הטוקן)
      const token = res.data;
      saveToken(token);

      toast.success("נרשמת בהצלחה! ✨");

      // 4. ניתוב לדף המתאים
      if (selectedType === "Candidate") {
        navigate("/candidate/profile");
      } else {
        navigate("/employer/jobs");
      }
    } catch (error: any) {
      console.error("שגיאה ברישום:", error);
      toast.error(error.response?.data || "ההרשמה נכשלה, נסה שנית");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-white flex items-center justify-center px-6 relative" dir="rtl">
      
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/3 right-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/3 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-md w-full"
      >
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/20"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">איך תרצו להשתמש ב-EasyJob?</h1>
          <p className="text-white/40 text-sm">הבחירה תעזור לנו להתאים עבורכם את החוויה</p>
        </div>

        {/* --- חדש: שדות קלט לרישום --- */}
        <div className="space-y-4 mb-8">
          <input 
            type="text" placeholder="שם מלא" value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none"
          />
          <input 
            type="email" placeholder="אימייל" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none"
          />
          <input 
            type="password" placeholder="סיסמה" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none"
          />
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { id: "Candidate", icon: Users, title: "מועמד/ת", desc: "חיפוש עבודה" },
            { id: "Employer", icon: Briefcase, title: "מעסיק/ה", desc: "פרסום משרה" },
          ].map(({ id, icon: Icon, title, desc }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedType(id as any)}
              className={`relative p-6 rounded-2xl border-2 text-center transition-all duration-300 overflow-hidden group ${
                selectedType === id
                  ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                  : "border-white/8 bg-white/3 hover:border-white/15"
              }`}
            >
              <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                selectedType === id ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white/30 group-hover:text-white/50"
              }`}>
                <Icon className="w-7 h-7" />
              </div>
              <h3 className={`relative font-bold text-lg mb-1 transition-colors ${selectedType === id ? "text-white" : "text-white/70"}`}>{title}</h3>
              <p className="relative text-[11px] text-white/40 leading-tight">{desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={selectedType ? { scale: 1.02 } : {}}
          whileTap={selectedType ? { scale: 0.98 } : {}}
          onClick={handleSubmit}
          disabled={!selectedType || loading || !email || !password}
          className={`w-full relative py-4 rounded-2xl text-base font-bold transition-all duration-300 ${
            selectedType && email && password
              ? "opacity-100 shadow-lg shadow-cyan-500/20 cursor-pointer" 
              : "opacity-30 cursor-not-allowed filter grayscale"
          }`}
        >
          <span className="absolute inset-0 bg-gradient-to-l from-cyan-400 to-blue-500" />
          <span className="relative flex items-center justify-center gap-2 text-black">
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                בואו נתחיל
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </span>
        </motion.button>

        <p className="text-center mt-6 text-[10px] text-white/20">
          שימו לב: לא ניתן לשנות את סוג החשבון לאחר הבחירה הראשונית.
        </p>
      </motion.div>
    </div>
  );
}