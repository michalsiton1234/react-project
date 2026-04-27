// @ts-nocheck
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { api } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // שליחת נתוני הרשמה לשרת הסישארפ
      const res = await api.post("/auth/register", formData);
      localStorage.setItem("token", res.data.token); // הוסיפי שורה זו כאן

      // התחברות אוטומטית לאחר הרשמה הוספתי את זה .........
      login(res.data.token, res.data.user);
      
      toast({ title: "נרשמת בהצלחה!", description: "עכשיו נגדיר את סוג החשבון" });
      
      // אחרי הרשמה תמיד הולכים ל-Setup לבחור אם אני מועמד או מעסיק
      navigate("/setup");
    } catch (err) {
      toast({ 
        title: "שגיאה בהרשמה", 
        description: "ייתכן שהמייל כבר קיים במערכת", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-white flex items-center justify-center px-6 relative overflow-hidden" dir="rtl">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">יצירת חשבון חדש</h1>
          <p className="text-white/40 text-sm mt-1">הצטרפו לקהילת EasyJob היום</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/60 mr-1">שם מלא</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text" 
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pr-11 pl-4 focus:border-violet-500/50 outline-none transition-all"
                placeholder="ישראל ישראלי"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60 mr-1">אימייל</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pr-11 pl-4 focus:border-violet-500/50 outline-none transition-all"
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
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pr-11 pl-4 focus:border-violet-500/50 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button 
            disabled={loading}
            className="w-full bg-white text-black hover:bg-white/90 font-bold py-6 rounded-2xl mt-4 transition-all"
          >
            {loading ? "יוצר חשבון..." : "הרשמה למערכת"}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-white/40">
          כבר יש לכם חשבון?{" "}
          <Link to="/login" className="text-violet-400 hover:underline font-medium">התחברו כאן</Link>
        </p>
      </motion.div>
    </div>
  );
}