// @ts-nocheck
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Mail, Lock, ArrowLeft } from "lucide-react";
import { api } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // קריאה לשרת הסישארפ שלך
      const res = await api.post("/auth/login", { email, password });
      
      // שמירת הנתונים ב-Context
      login(res.data.token, res.data.user);
      
      toast({ title: "התחברת בהצלחה!" });

      // בדיקה אם המשתמש צריך לעבור ל-Setup או לדשבורד
      if (!res.data.user.role) {
        navigate("/setup");
      } else {
        navigate(res.data.user.role === "Employer" ? "/employer/jobs" : "/candidate/profile");
      }
    } catch (err) {
      toast({ 
        title: "שגיאה בהתחברות", 
        description: "מייל או סיסמה לא נכונים", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-white flex items-center justify-center px-6 relative overflow-hidden" dir="rtl">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold">שמחים לראות אתכם שוב</h1>
          <p className="text-white/40 text-sm mt-1">הכנסו לחשבון שלכם ב-EasyJob</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/60 mr-1">אימייל</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pr-11 pl-4 focus:border-cyan-500/50 outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60 mr-1">סיסמה</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pr-11 pl-4 focus:border-cyan-500/50 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button 
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-6 rounded-2xl mt-4"
          >
            {loading ? "מתחבר..." : "כניסה"}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-white/40">
          עדיין אין לכם חשבון?{" "}
          <Link to="/register" className="text-cyan-400 hover:underline font-medium">הרשמו עכשיו</Link>
        </p>
      </motion.div>
    </div>
  );
}