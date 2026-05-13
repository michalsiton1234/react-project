
// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Zap, Globe, Users, Save, CheckCircle2, User, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const LEVELS = [
  { value: "easy", label: "קלה", emoji: "😊" },
  { value: "medium", label: "בינונית", emoji: "💪" },
  { value: "hard", label: "קשה", emoji: "🔥" },
];

export default function CandidateProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    city: "",
    max_distance: 10,
    min_hourly_rate: 30, // שדה קיים בסטייט שלך
    activity: true,
    level: "easy",       // שדה קיים בסטייט שלך
    IsRemoteOnly: false,
    WithPeople: true,
    categoryIds: [] as number[],
  });
  const [profileId, setProfileId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{id: number, name: string, icon: string}[]>([]);

  useEffect(() => { 
    loadData();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get("/Category");
      const categoryIcons: {[key: string]: string} = {
        "ביביסיטר": "👶", "משלוחים": "📦", "ניקיון": "🧹",
        "קלדנות": "⌨️", "סטודנט": "📚", "מרחוק": "🏠",
        "אחר": "✨", "שירות": "🎧"
      };
      const mappedCategories = res.data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        icon: categoryIcons[cat.name] || "📋"
      }));
      setCategories(mappedCategories);
    } catch (err) {
      console.error("שגיאה בטעינת קטגוריות:", err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError("אינך מחובר. אנא התחבר למערכת.");
        return;
      }

      let response;
      try {
        response = await api.get('/Candidate/my-profile');
      } catch (e1) {
        try {
          response = await api.get('/candidate/my-profile');
        } catch (e2) {
          response = null;
        }
      }

      if (response && response.data) {
        const p = response.data;
        debugger
        const loadedCategoryIds = p.categoryIds || p.categoryId || p.CategoryId || p.CategoryIds || [];
        
        // המרת רמה מ-Number ל-String בשביל ה-UI
        const levelMap = { 0: "easy", 1: "medium", 2: "hard" };
        const currentLevel = levelMap[p.level] || levelMap[p.Level] || "easy";

        setForm({
          city: p.City || p.city || "",
          max_distance: p.max_distance || p.MaxDistance || 10,
          min_hourly_rate: p.minHourlyRate|| 30,
          activity: p.activity !== false,
          level: currentLevel,
          IsRemoteOnly: !!(p.IsRemoteOnly || p.isRemoteOnly),
          WithPeople: p.WithPeople !== false,
          categoryIds: Array.isArray(loadedCategoryIds) ? loadedCategoryIds : [loadedCategoryIds]
        });
        setProfileId(p.id);
      }
    } catch (error) {
      console.error("שגיאה בטעינת פרופיל:", error);
      setError("אירעה שגיאה בטעינת הפרופיל.");
    } finally {
      setLoading(false);
    }
  };

 
  const handleSave = async () => {
  setSaving(true);
  setError("");

  // הכנת הנתונים בפורמט שהוכחנו שעובד
  const levelValue = form.level === "easy" ? 0 : form.level === "medium" ? 1 : 2;

  const data = {
    Id: profileId,
    City: form.city,
    MaxDistance: Number(form.max_distance),
    MinHourlyRate: Number(form.min_hourly_rate),
    Activity: Boolean(form.activity),
    Level: levelValue,
    IsRemoteOnly: Boolean(form.IsRemoteOnly),
    WithPeople: Boolean(form.WithPeople),
    CategoryId: form.categoryIds[0] || 1
  };

  try {
    if (profileId) {
      await api.put(`/Candidate/${profileId}`, data);
    } else {
      await api.post('/Candidate/profile', data);
    }

    toast.success("הפרופיל עודכן בהצלחה!");
    
    // מעבר לעמוד הבא לאחר הצלחה
    setTimeout(() => navigate('/candidate/my-area'), 500);
    
  } catch (e: any) {
    console.error("שגיאה בעדכון הפרופיל:", e);
    setError("נכשלה שמירת הנתונים. נסה שוב מאוחר יותר.");
    toast.error("שגיאה בשמירה");
  } finally {
    setSaving(false);
  }
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
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/20">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">פרופיל מועמד</h1>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="text-cyan-400 mb-2 block">עיר</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-cyan-400 mb-2 block">מרחק חיפוש (ק"מ)</Label>
              <Input
                type="number"
                value={form.max_distance}
                onChange={(e) => setForm({ ...form, max_distance: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          {/* שינוי 1: שכר שעתי */}
          <div className="mb-6">
            <Label className="text-cyan-400 mb-2 block">שכר שעתי מינימלי (₪)</Label>
            <Input
              type="number"
              value={form.min_hourly_rate}
              onChange={(e) => setForm({ ...form, min_hourly_rate: e.target.value })}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          {/* שינוי 2: רמת קושי */}
          <div className="mb-6">
            <Label className="text-cyan-400 mb-3 block">רמת קושי מועדפת</Label>
            <div className="grid grid-cols-3 gap-3">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => setForm({ ...form, level: lvl.value })}
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center ${
                    form.level === lvl.value ? 'bg-cyan-500 text-black border-cyan-400 font-bold' : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <span className="text-xl">{lvl.emoji}</span>
                  <span className="text-xs">{lvl.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-cyan-400 mb-2 block">תחומי עניין</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    const currentIds = form.categoryIds || [];
                    const newIds = currentIds.includes(cat.id) 
                        ? currentIds.filter(id => id !== cat.id) 
                        : [...currentIds, cat.id];
                    setForm({ ...form, categoryIds: newIds });
                  }}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    form.categoryIds.includes(cat.id) ? 'bg-cyan-500/20 border-cyan-400' : 'bg-white/5 border-white/10'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <Label>פעיל - מחפש עבודה</Label>
              <Switch checked={form.activity} onCheckedChange={(v) => setForm({ ...form, activity: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>עבודה מרחוק בלבד</Label>
              <Switch checked={form.IsRemoteOnly} onCheckedChange={(v) => setForm({ ...form, IsRemoteOnly: v })} />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-4 rounded-xl disabled:opacity-50"
          >
            {saving ? "שומר..." : "שמור פרופיל"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}