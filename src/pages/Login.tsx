// @ts-nocheck
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Mail, Lock, ArrowLeft } from "lucide-react";
import { api } from "@/api/apiClient";
import { getUserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // שימוש בקונטקסט לעדכון המצב
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    
    e.preventDefault();
    setLoading(true);
    console.log("1. התחלתי לוגין עם:", email);
    
    try {
      const res = await api.post(
        `/User/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      );

      console.log("2. תשובה מהשרת:", res.data);

      // לפעמים ב-C# הטוקן חוזר בתוך אובייקט, למשל res.data.token
      // ננסה לקחת אותו בכל מקרה:
      const token = typeof res.data === 'string' ? res.data : res.data.token;

      if (token) {
        console.log("3. נמצא טוקן! שומר ב-Storage...");
        localStorage.setItem('token', token);

        console.log("4. מעדכן קונטקסט...");
        login(token);

        toast.success("התחברת בהצלחה! ✨");

        // ניווט לפי תפקיד
        const role = getUserRole();
        if (role === "employer") {
          navigate("/employer/matches");
        } else if (role === "candidate") {
          navigate("/candidate/profile");
        } else {
          navigate("/");
        }
      } else {
        console.error("3. שגיאה: השרת לא החזיר טוקן בפורמט צפוי", res.data);
        toast.error("שגיאה בקבלת נתונים מהשרת");
      }

    } catch (err: any) {
      console.error("שגיאה בתקשורת עם השרת:", err);
      const errorMsg = err.response?.data || "מייל או סיסמה לא נכונים";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#080C14] text-white flex items-center justify-center px-6 relative overflow-hidden" dir="rtl">

      {/* אלמנטים עיצוביים ברקע */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-xl shadow-2xl"
      >
        {/* כפתור חזרה לדף הבית */}
        <Link to="/" className="inline-flex items-center text-white/40 hover:text-cyan-400 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          <span className="text-sm font-medium">חזרה לדף הבית</span>
        </Link>

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-cyan-500/20">
            <Briefcase className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">כניסה למערכת</h1>
          <p className="text-white/40 mt-2">הזן את פרטיך כדי להמשיך ל-EasyJob</p>
        </div>

        <form className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-white/60 mr-1 font-medium italic">כתובת אימייל</label>
            <div className="relative group">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-white/10 text-lg"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mr-1">
              <label className="text-sm text-white/60 font-medium italic">סיסמה</label>
              <Link to="/forgot-password" size="sm" className="text-xs text-cyan-500/60 hover:text-cyan-400 transition-colors">שכחתי סיסמה?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-white/10 text-lg"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-7 rounded-2xl mt-4 shadow-lg shadow-cyan-500/10 transition-all text-lg group"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                מתחבר למערכת...
              </div>
            ) : (
              <span className="flex items-center gap-2">
                כניסה לחשבון
              </span>
            )}
          </Button>
        </form>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-white/40">
            עדיין אין לכם חשבון?{" "}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-bold transition-colors">
              הצטרפו עכשיו
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}