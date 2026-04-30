import { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Briefcase,
  MapPin,
  DollarSign,
  Pencil,
  Trash2,
  LayoutDashboard,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { getUserId, getUser, getEmployerId } from "@/lib/auth";
import type { JobListing } from "@/models/JobListing";

export default function EmployerJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{id: number, name: string, icon: string}[]>([]);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    payment: 35,
    level: "easy",
    is_remote: false,
    is_job_with_people: false,
    is_catch: false,
    categoryIds: [] as number[],
  });

  // טעינת קטגוריות מהשרת
  useEffect(() => {
    loadCategories();
    loadJobs();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get("/Category");
      // מיפוי הקטגוריות מהשרת עם אייקונים
      const categoryIcons: {[key: string]: string} = {
        "ביביסיטר": "👶",
        "משלוחים": "📦", 
        "ניקיון": "🧹",
        "קלדנות": "⌨️",
        "סטודנט": "📚",
        "מרחוק": "🏠",
        "אחר": "✨",
        "שירות": "🎧"
      };
      
      const mappedCategories = res.data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        icon: categoryIcons[cat.name] || "📋"
      }));
      
      setCategories(mappedCategories);
    } catch (err) {
      console.error("שגיאה בטעינת קטגוריות:", err);
      toast.error("שגיאה בטעינת קטגוריות");
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);

      const employerId = await getEmployerId();
      if (!employerId) {
        toast.error("לא נמצא EmployerId תקין");
        return;
      }

      console.log("DEBUG: Loading jobs with EmployerId:", employerId);
      const res = await api.get(`/JobListing/getByEmp/${employerId}`);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בטעינת משרות");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      location: "",
      payment: 35,
      level: "easy",
      categoryIds: [],
      is_remote: false,
      is_job_with_people: false,
      is_catch: false,
    });
    setEditingJob(null);
  };

  const handleEdit = (job: JobListing) => {
    setEditingJob(job);

    const loadedCategoryIds = job.categoryIds || job.categoryId || [];
    setForm({
      title: job.title,
      description: job.description,
      location: job.location,
      payment: job.payment,
      level: job.level || "easy",
      categoryIds: Array.isArray(loadedCategoryIds) ? loadedCategoryIds : [loadedCategoryIds],
      is_remote: job.isRemote,
      is_job_with_people: job.isJobWithPepole,
      is_catch: job.isCatch,
    });

    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;
      
      const employerId = await getEmployerId();
      if (!employerId) {
        toast.error("לא נמצא EmployerId תקין");
        return;
      }
      
      console.log("DEBUG: Full user token data:", getUser());
      console.log("DEBUG: User ID from token:", userId);
      console.log("DEBUG: EmployerId to send:", employerId);

      // נשלח רק את הקטגוריה הראשונה כי הבקאנד תומך רק בקטגוריה אחת
      const firstCategoryId = form.categoryIds?.[0];
      
      // Debug - הדפסת מידע על הקטגוריה
      console.log("Category IDs selected:", form.categoryIds);
      console.log("First category ID:", firstCategoryId);
      console.log("Available categories:", categories);
      
      // בדיקה שקטגוריות נטענו
      if (categories.length === 0) {
        toast.error("קטגוריות לא נטענו. נסה לרענן את הדף");
        return;
      }
      
      // בדיקה שבחרת קטגוריה
      if (!firstCategoryId) {
        toast.error("יש לבחור לפחות קטגוריה אחת");
        return;
      }
      
      // בדיקה שהקטגוריה קיימת ברשימה
      const categoryExists = categories.some(c => c.id === firstCategoryId);
      if (!categoryExists) {
        toast.error("הקטגוריה שנבחרה לא קיימת במערכת");
        return;
      }
      
      // המרת level למספר לבקאנד
      const levelValue = form.level === "easy" ? 0 : form.level === "medium" ? 1 : 2;
      
      if (editingJob) {
        await api.put(`/JobListing/${editingJob.id}`, {
          id: editingJob.id,
          employerId: employerId,
          categoryId: firstCategoryId, // קטגוריה אחת בלבד

          title: form.title,
          description: form.description,
          location: form.location,
          payment: form.payment,
          leveJob: levelValue,

          isCatch: form.is_catch,
          isRemote: form.is_remote,
          isJobWithPepole: form.is_job_with_people,

          requiredDate: editingJob.requiredDate,
        });

        toast.success("המשרה עודכנה");
      } else {
        await api.post("/JobListing", {
          id: 0,
          employerId: employerId,
          categoryId: firstCategoryId, // קטגוריה אחת בלבד

          title: form.title,
          description: form.description,
          location: form.location,
          payment: form.payment,
          leveJob: levelValue,

          isCatch: form.is_catch,
          isRemote: form.is_remote,
          isJobWithPepole: form.is_job_with_people,

          requiredDate: new Date().toISOString(),
        });

        toast.success("המשרה נוצרה בהצלחה");
      }

      setDialogOpen(false);
      resetForm();
      loadJobs();
    } catch (err: any) {
      console.error("Full error details:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        console.error("Response headers:", err.response.headers);
        toast.error(`שגיאה בשמירה: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        console.error("Request error:", err.request);
        toast.error("שגיאה בשמירה - בעיית רשת");
      } else {
        console.error("Error message:", err.message);
        toast.error(`שגיאה בשמירה: ${err.message}`);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("למחוק את המשרה?")) return;

    try {
      await api.delete(`/JobListing/${id}`);
      toast.success("נמחק בהצלחה");
      loadJobs();
    } catch {
      toast.error("שגיאה במחיקה");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto text-right text-white" dir="rtl">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">ניהול משרות</h1>
          <p className="text-white/60">ניהול משרות של המעסיק</p>
        </div>

        <div className="flex items-center gap-3">
          {/* כפתור לוח מנהל - בסגנון דשבורד */}
          <button
            onClick={() => navigate('/employer/matches')}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 rounded-lg text-white shadow-lg shadow-purple-500/20 transition-all"
          >
            <LayoutDashboard size={18} />
            לוח מנהל
          </button>

          <button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg text-white"
          >
            <Plus size={18} />
            משרה חדשה
          </button>
        </div>
      </div>

      {/* JOBS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <motion.div
            key={job.id}
            className="bg-[#111827] border border-white/10 rounded-xl p-5"
            layout
          >
            <div className="flex justify-between mb-3">
              <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/60">
                פתוחה
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(job)}
                  className="text-white/60 hover:text-cyan-400"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="text-white/60 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white">{job.title}</h3>
            <p className="text-white/60 text-sm mt-2 line-clamp-2">
              {job.description}
            </p>

            <div className="mt-4 space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <MapPin size={14} /> {job.location}
              </div>

              <div className="flex items-center gap-2">
                <DollarSign size={14} /> {job.payment} ₪
              </div>

              <div className="flex items-center gap-2">
                <Briefcase size={14} />
                {job.isRemote ? "עבודה מרחוק" : "מיקום פיזי"}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0F172A] text-white border-white/10 max-w-md max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingJob ? "עריכת משרה" : "משרה חדשה"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 pb-2">
            {/* כותרת */}
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-300">כותרת המשרה</Label>
              <Input
                placeholder="בייביסיטר, עיקון..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 h-10"
              />
            </div>

            {/* תיאור */}
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-300">תיאור</Label>
              <Textarea
                placeholder=""
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 min-h-[80px] resize-none"
              />
            </div>

            {/* שורה: מיקום + שכר */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-300">עיר</Label>
                <Input
                  placeholder="תל אביב"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-300">תשלום (₪/שעה)</Label>
                <Input
                  type="number"
                  placeholder="35"
                  value={form.payment}
                  onChange={(e) => setForm({ ...form, payment: Number(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 h-10"
                />
              </div>
            </div>

            {/* רמת קושי - סלקט */}
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-300">רמת קושי</Label>
              <select
                value={form.level || 'easy'}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-md h-10 px-3 focus:border-cyan-500 focus:outline-none"
              >
                <option value="easy" className="bg-[#0F172A]">קלה</option>
                <option value="medium" className="bg-[#0F172A]">בינונית</option>
                <option value="hard" className="bg-[#0F172A]">קשה</option>
              </select>
            </div>

            {/* סוויצ'ים */}
            <div className="space-y-1">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-gray-300">עבודה מרחוק</span>
                <Switch
                  checked={form.is_remote}
                  onCheckedChange={(v) => setForm({ ...form, is_remote: v })}
                  className="data-[state=checked]:bg-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-gray-300">עבודה עם אנשים</span>
                <Switch
                  checked={form.is_job_with_people}
                  onCheckedChange={(v) => setForm({ ...form, is_job_with_people: v })}
                  className="data-[state=checked]:bg-cyan-500"
                />
              </div>
            </div>

            {/* קטגוריות - מולטי סלקט - בסוף הטופס */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-200 font-medium">קטגוריות</Label>
                <span className="text-xs text-gray-400">
                  נבחר {form.categoryIds?.length || 0}/3
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const isSelected = form.categoryIds?.includes(cat.id) || false;
                  const canSelect = isSelected || (form.categoryIds?.length || 0) < 3;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={!canSelect && !isSelected}
                      onClick={() => {
                        const currentIds = form.categoryIds || [];
                        if (isSelected) {
                          if (currentIds.length > 1) {
                            setForm({ ...form, categoryIds: currentIds.filter(id => id !== cat.id) });
                          }
                        } else {
                          setForm({ ...form, categoryIds: [...currentIds, cat.id] });
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all ${
                        isSelected
                          ? 'bg-cyan-600/30 border-cyan-500 text-white'
                          : canSelect
                            ? 'bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-600/50'
                            : 'bg-slate-800/30 border-slate-700/50 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-base">{cat.icon}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* כפתור שמירה */}
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-2.5 px-4 rounded-lg transition-all mt-4"
            >
              {editingJob ? "שמור שינויים" : "פרסם משרה"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
