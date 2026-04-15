// @ts-nocheck
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Mail, Lock } from "lucide-react";
import { api } from "@/api/apiClient";
import { saveToken, getUserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. קריאה לשרת (מוודא שהנתיב תואם ל-Controller בסישארפ)
      const res = await api.post("/auth/login", { email, password });
      
      // 2. שמירת הטוקן שמגיע מהשרת
      const token = res.data.token || res.data; 
      saveToken(token);
      
      toast.success("התחברת בהצלחה! ✨");

      // 3. בדיקת תפקיד וניתוב אוטומטי
      const role = getUserRole(); // הפונקציה הזו מחזירה 'admin', 'employer' או 'candidate'

      if (!role) {
        navigate("/setup");
      } else if (role === "admin") {
        navigate("/admin");
      } else if (role === "employer") {
        navigate("/employer/jobs");
      } else {
        navigate("/candidate/profile");
      }
      
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.response?.data || "מייל או סיסמה לא נכונים");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-white flex items-center justify-center px-6 relative overflow-hidden" dir="rtl">
      
      {/* עיצוב הרקע */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
            <Briefcase className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">שמחים לראות אתכם שוב</h1>
          <p className="text-white/40 text-sm mt-1">הכנסו לחשבון שלכם ב-EasyJob</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/60 mr-1 font-medium">אימייל</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pr-11 pl-4 focus:border-cyan-500/50 outline-none transition-all placeholder:text-white/5"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60 mr-1 font-medium">סיסמה</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pr-11 pl-4 focus:border-cyan-500/50 outline-none transition-all placeholder:text-white/5"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-6 rounded-2xl mt-4 shadow-lg shadow-cyan-500/10 transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                מתחבר...
              </div>
            ) : "כניסה"}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-white/40">
          עדיין אין לכם חשבון?{" "}
          <Link to="/setup" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-medium transition-colors">הרשמו עכשיו</Link>
        </p>
      </motion.div>
    </div>
  );
}