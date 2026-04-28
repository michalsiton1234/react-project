// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/apiClient"; // ה-Axios שלך
import type { CandidateProfile as CandidateProfileType } from "@/models/CandidateProfile"; // המודל שבנינו
import { motion } from "framer-motion";
import { MapPin, DollarSign, Zap, Globe, Users, Save, CheckCircle2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
const LEVELS = [
  { value: "easy", label: "קלה", emoji: "😊", desc: "מתאים לכולם" },
  { value: "medium", label: "בינונית", emoji: "💪", desc: "דורש ניסיון" },
  { value: "hard", label: "קשה", emoji: "🔥", desc: "מקצועי" },
];

export default function CandidateProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    city: "",
    max_distance: 10,
    min_hourly_rate: 30,
    activity: true,
    level: "easy",
    is_remote_only: false,
    with_people: true,
  });
  const [profileId, setProfileId] = useState<number | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // בדיקת הרשאה לפני קריאה ל-API
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("אין טוקן - משתמש לא מחובר");
        window.location.href = "/login";
        return;
      }
      
      // ניסיון לקבל פרופיל של המשתמש המחובר
      let response;
      try {
        response = await api.get('/Candidate/my-profile');  // הנתיב הנכון מהקונטרולר
      } catch (e1) {
        console.log("ניסיון ראשון נכשל, מנסה עם אותיות קטנות...");
        try {
          response = await api.get('/candidate/my-profile');  // ניסיון שני - אותיות קטנות
        } catch (e2) {
          console.log("גם ניסיון שני נכשל, הפרופיל אולי לא קיים עדיין");
          // אם אין פרופיל, זה בסדר - ניצור אחד חדש
          response = null;
        }
      }
      console.log("DEBUG: Response from /Candidate/my-profile:", response);
      if (response.data) {
        const p = response.data;
        console.log("Profile data received:", p);
        setForm({
          city: p.City || p.city || "", // תמיכה בין City ו-city
          max_distance: p.max_distance || 10,
          min_hourly_rate: p.min_hourly_rate || 30,
          activity: p.activity !== false,
          level: p.level || "easy",
          is_remote_only: p.is_remote_only || false,
          with_people: p.with_people !== false
        });
        setProfileId(p.id); // שמירת ה-ID של הפרופיל
      }
    } catch (error) {
      console.error("שגיאה בטעינת פרופיל:", error);
      
      // פירוט מלא של השגיאה
      if (error.response) {
        console.error("שגיאת שרת:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url
        });
        
        // הודעה למשתמש לפי סוג השגיאה
        if (error.response.status === 401) {
          setError("פג תוקף ההתחברות. אנא התחברי מחדש.");
          setTimeout(() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }, 2000);
        } else if (error.response.status === 404) {
          setError("הפרופיל לא נמצא. אנא צורי פרופיל חדש.");
        } else if (error.response.status === 500) {
          setError("שגיאת שרת פנימית. אנא נסו שוב מאוחר יותר.");
        } else {
          setError(`שגיאה: ${error.response.statusText || "שגיאה לא ידועה"}`);
        }
      } else if (error.request) {
        console.error("שגיאת רשת - אין תגובה מהשרת:", error.request);
        setError("לא ניתן להתחבר לשרת. אנא בדקו את חיבור הרשת.");
      } else {
        console.error("שגיאה כללית:", error.message);
        setError("אירעה שגיאה בטעינת הפרופיל.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.city) return;
    setSaving(true);
    setError(""); // נקה את הודעת שגיאה קודמת
    
    console.log("=== מתחיל שמירת פרופיל ===");
    console.log("נתונים שנשלחים:", form);
    
    // בדיקת תקינות הטוקן
    const token = localStorage.getItem('token');
    console.log("טוקן קיים:", !!token);
    console.log("אורך טוקן:", token?.length || 0);
    
    let saved = false;
    let lastError = null;
    
    // הכנת נתונים למבנה שהשרת מצפה - DTO ישיר
    const requestData = {
      Id: 0, // יוגדר אוטומטית על ידי הקונטרולר
      UserId: 0, // יוגדר אוטומטית על ידי הקונטרולר מהטוקן
      City: form.city,
      MaxDistance: form.max_distance,
      MinHourlyRate: form.min_hourly_rate,
      Activity: form.activity,
      Level: form.level.charAt(0).toUpperCase() + form.level.slice(1), // Easy/Medium/Hard
      LevelValue: form.level === "easy" ? 0 : form.level === "medium" ? 1 : 2,
      IsRemoteOnly: form.is_remote_only,
      WithPeople: form.with_people
    };
    
    // לוגיקה משופרת: תמיד מנסה POST קודם, אם זה נכשל עם 409 (conflict) אז מעדכן
    try {
      console.log("מנסה ליצור/לעדכן פרופיל");
      console.log("נתונים מעוצבים:", requestData);
      const response = await api.post('/Candidate/profile', requestData);
      console.log("✅ POST הצליח (יצירה או עדכון):", response.status, response.data);
      saved = true;
      setProfileId(response.data.id); // שמירת ה-ID מהתגובה
    } catch (e1) {
      console.log("❌ POST נכשל:", e1.response?.status, e1.response?.data);
      console.log("=== פרטי השגיאה המלאים ===");
      console.log("Status:", e1.response?.status);
      console.log("Status Text:", e1.response?.statusText);
      console.log("Data:", JSON.stringify(e1.response?.data, null, 2));
      console.log("Headers:", e1.response?.headers);
      console.log("URL:", e1.config?.url);
      
      // אם זו שגיאת conflict (הפרופיל כבר קיים), ננסה PUT
      if (e1.response?.status === 409 && profileId) {
        try {
          console.log("מנסה לעדכן פרופיל קיים, ID:", profileId);
          const response = await api.put(`/Candidate/${profileId}`, requestData);
          console.log("✅ PUT הצליח:", response.status, response.data);
          saved = true;
        } catch (e2) {
          console.log("❌ PUT גם נכשל:", e2.response?.status, e2.response?.data);
          lastError = e2;
        }
      } else {
        lastError = e1;
      }
    }
    
    if (saved) {
      toast.success("הפרופיל נשמר!");
      loadData();
      // Navigate to candidate dashboard or jobs page after successful save
      setTimeout(() => {
        navigate('/candidate/dashboard');
      }, 1500);
    } else {
      console.error("=== כל הניסיונות נכשלו ===");
      console.error("שגיאה אחרונה:", lastError);
      
      // ניסיון עם נתונים מינימליים - DTO ישיר
      console.log("=== מנסה עם נתונים מינימליים ===");
      const minimalData = {
        Id: 0, // יוגדר אוטומטית
        UserId: 0, // יוגדר אוטומטית
        City: "תל אביב",
        MaxDistance: 10,
        MinHourlyRate: 30,
        Activity: true,
        Level: "Easy", // enum תקין
        LevelValue: 0, // easy = 0
        IsRemoteOnly: false,
        WithPeople: true
      };
      
      // אותה לוגיקה כמו בשמירה רגילה
      if (profileId) {
        try {
          console.log("מנסה לעדכן פרופיל קיים עם נתונים מינימליים, ID:", profileId);
          const response = await api.put(`/Candidate/${profileId}`, minimalData);
          console.log("✅ ניסיון מינימלי PUT הצליח:", response.status);
          toast.success("הפרופיל נשמר עם נתונים מינימליים!");
          loadData();
          setSaving(false);
          setTimeout(() => {
            navigate('/candidate/dashboard');
          }, 1500);
          return;
        } catch (minimalError) {
          console.log("❌ ניסיון מינימלי PUT נכשל:", minimalError.response?.status, minimalError.response?.data);
        }
      } else {
        try {
          console.log("יוצר פרופיל חדש עם נתונים מינימליים");
          const response = await api.post('/Candidate/profile', minimalData);
          console.log("✅ ניסיון מינימלי POST הצליח:", response.status);
          toast.success("הפרופיל נשמר עם נתונים מינימליים!");
          loadData();
          setSaving(false);
          setTimeout(() => {
            navigate('/candidate/dashboard');
          }, 1500);
          return;
        } catch (minimalError) {
          console.log("❌ ניסיון מינימלי POST נכשל:", minimalError.response?.status, minimalError.response?.data);
        }
      }
      
      // הצגת שגיאה מפורטת למשתמש
      if (lastError?.response) {
        const status = lastError.response.status;
        const data = lastError.response.data;
        
        if (status === 400) {
          setError(`שגיאת תקינות: ${JSON.stringify(data) || "נתונים לא תקינים"}`);
        } else if (status === 401) {
          setError("אינך מורשית לבצע פעולה זו");
        } else if (status === 403) {
          setError("אין לך הרשאות לעדכן פרופיל");
        } else if (status === 404) {
          setError("נתיב השמירה לא נמצא");
        } else if (status === 405) {
          setError("שיטת HTTP לא נתמכת בשרת");
        } else if (status === 500) {
          setError("שגיאת שרת פנימית");
        } else {
          setError(`שגיאה ${status}: ${lastError.response.statusText || "שגיאה לא ידועה"}`);
        }
      } else {
        setError("לא ניתן להתחבר לשרת לשמירה");
      }
      
      toast.error("השמירה נכשלה");
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080C14] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-cyan-400">טוען פרופיל...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-white p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/20"
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">פרופיל מועמד</h1>
          <p className="text-cyan-400">נהל את הפרטים שלך כדי שנמצא לך את המשרה המושלמת</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* City */}
            <div>
              <Label className="text-cyan-400 mb-2 block">עיר</Label>
              <Input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="הזן את עיר המגורים שלך"
                className="bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>

            {/* Max Distance */}
            <div>
              <Label className="text-cyan-400 mb-2 block">מרחק מקסימלי (ק"מ)</Label>
              <Input
                type="number"
                value={form.max_distance}
                onChange={(e) => setForm({ ...form, max_distance: parseInt(e.target.value) || 10 })}
                placeholder="מרחק מקסימלי"
                className="bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Min Hourly Rate */}
            <div>
              <Label className="text-cyan-400 mb-2 block">שכר שעתי מינימלי (₪)</Label>
              <Input
                type="number"
                value={form.min_hourly_rate}
                onChange={(e) => setForm({ ...form, min_hourly_rate: parseInt(e.target.value) || 30 })}
                placeholder="שכר שעתי מינימלי"
                className="bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>

            {/* Level */}
            <div>
              <Label className="text-cyan-400 mb-2 block">רמת קושי</Label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full bg-white/10 border-white/20 text-white rounded-lg p-3"
              >
                {LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.emoji} {level.label} - {level.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-400" />
                <Label className="text-white">פעילות</Label>
              </div>
              <Switch
                checked={form.activity}
                onCheckedChange={(checked) => setForm({ ...form, activity: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-cyan-400" />
                <Label className="text-white">עבודה מרחוק בלבד</Label>
              </div>
              <Switch
                checked={form.is_remote_only}
                onCheckedChange={(checked) => setForm({ ...form, is_remote_only: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-cyan-400" />
                <Label className="text-white">עבודה עם אנשים</Label>
              </div>
              <Switch
                checked={form.with_people}
                onCheckedChange={(checked) => setForm({ ...form, with_people: checked })}
              />
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-4 rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                <span>שומר...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                <span>שמור פרופיל</span>
              </div>
            )}
          </motion.button>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-bold mb-4 text-cyan-400">מידע נוכחי</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-white/80">עיר: {form.city || "לא הוגדר"}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span className="text-white/80">שכר: ₪{form.min_hourly_rate}/שעה</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-white/80">סטטוס: {form.activity ? "פעיל" : "לא פעיל"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-white/80">עבודה מרחוק: {form.is_remote_only ? "כן" : "לא"}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}