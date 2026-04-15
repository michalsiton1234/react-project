import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, ArrowLeft, Sparkles, Clock, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getUser, getUserRole } from "@/lib/auth"; // ייבוא הפונקציות החדשות

const jobTypes = [
  { icon: "👶", label: "בייביסיטר", color: "from-pink-400 to-rose-500" },
  { icon: "🧹", label: "ניקיון", color: "from-blue-400 to-cyan-500" },
  { icon: "🚗", label: "משלוחים", color: "from-orange-400 to-amber-500" },
  { icon: "📚", label: "שיעורים פרטיים", color: "from-violet-400 to-purple-500" },
  { icon: "🍕", label: "מלצרות", color: "from-red-400 to-pink-500" },
  { icon: "💻", label: "עבודה מהבית", color: "from-emerald-400 to-green-500" },
  { icon: "🎨", label: "עיצוב", color: "from-yellow-400 to-orange-500" },
  { icon: "📦", label: "סידורים", color: "from-teal-400 to-cyan-500" },
];

const features = [
  { icon: Sparkles, title: "התאמה חכמה", desc: "אלגוריתם חכם שמתאים בין מועמדים למשרות לפי העדפות, מיקום ושכר", gradient: "from-violet-500 to-purple-600" },
  { icon: Clock, title: "גמישות מלאה", desc: "בחרו את השעות שמתאימות לכם - בוקר, צהריים, ערב, סוף שבוע", gradient: "from-blue-500 to-cyan-600" },
  { icon: Shield, title: "בטוח ואמין", desc: "מעסיקים מאומתים, תשלום בטוח וסביבת עבודה מוגנת", gradient: "from-emerald-500 to-green-600" },
];

export default function Landing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // בדיקה מהירה של ה-Auth מקומית דרך הטוקן
    const user = getUser();
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  const getDashboardLink = () => {
    const role = getUserRole(); // שימוש בטיפוסים שהגדרנו ב-auth.ts
    
    if (role === "admin") return "/admin";
    if (role === "employer") return "/employer/jobs";
    if (role === "candidate") return "/candidate/profile";
    
    return "/login";
  };

  const handleCTA = () => {
    if (isLoggedIn) navigate(getDashboardLink());
    else navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-white overflow-hidden" dir="rtl">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#080C14]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Easy<span className="text-cyan-400">Job</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link to={getDashboardLink()}>
                <Button className="rounded-full px-5 h-9 text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-semibold gap-1.5 transition-all duration-300">
                  ללוח הבקרה שלי <ArrowLeft className="w-3.5 h-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5">
                  התחברות
                </Link>
                <Link to="/setup" className="text-sm bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-full px-4 py-1.5 transition-all">
                  הרשמה
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-6 text-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            הדרך הקלה לעבודה הבאה שלך
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black leading-[1.1] mb-8">
            מצאו עבודה
            <span className="block bg-gradient-to-l from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              בלי כאב ראש
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            הפלטפורמה החכמה לחיבור בין מעסיקים למועמדים לעבודות מזדמנות.
            <span className="text-white/80 block mt-2">בייביסיטר, ניקיון, משלוחים וכל מה שביניהם.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCTA}
              className="px-10 py-4 rounded-full bg-gradient-to-l from-cyan-400 to-blue-500 text-black font-bold text-lg shadow-lg shadow-cyan-500/20"
            >
              התחילו עכשיו - בחינם
            </motion.button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all text-white/70"
            >
              איך זה עובד?
            </button>
          </div>
        </motion.div>
      </section>

      {/* JOB TYPES GRID */}
      <section className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {jobTypes.map((job, i) => (
              <motion.div
                key={job.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center hover:bg-white/[0.08] transition-all cursor-default group"
              >
                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{job.icon}</span>
                <span className="text-sm font-semibold text-white/80">{job.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <div key={feat.title} className="p-8 rounded-3xl bg-white/3 border border-white/5 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feat.gradient} blur-[60px] opacity-20`} />
                <feat.icon className="w-10 h-10 text-cyan-400 mb-6" />
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-white/40 leading-relaxed text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center p-16 rounded-[40px] bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/10 relative overflow-hidden">
          <div className="relative z-10">
            <Star className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl font-black mb-6">מוכנים למצוא את העבודה הבאה?</h2>
            <p className="text-white/40 mb-10 text-lg">הצטרפו לקהילת EasyJob והתחילו לקבל הצעות עוד היום.</p>
            <Button onClick={handleCTA} className="bg-white text-black hover:bg-white/90 rounded-full px-12 py-7 text-lg font-bold">
              יאללה, בואו נתחיל!
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-white/20 text-sm">
        © 2026 EasyJob Platform. נבנה עבורכם באהבה.
      </footer>
    </div>
  );
}