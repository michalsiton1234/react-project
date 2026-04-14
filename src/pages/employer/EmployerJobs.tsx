// @ts-nocheck
import { useState, useEffect } from "react";
import { api } from "@/api/apiClient"; // ה-Axios שלך
import { motion } from "framer-motion";
import { Plus, Briefcase, MapPin, DollarSign, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
// ייבוא המודלים (ודא שיצרת אותם בתיקיית models)
import { JobListing } from "@/models/JobListing";

const LEVEL_LABELS = { easy: "קלה", medium: "בינונית", hard: "קשה" };
const STATUS_LABELS = { open: "פתוחה", closed: "סגורה", filled: "אוישה" };
const STATUS_COLORS = { 
  open: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", 
  closed: "text-white/40 bg-white/5 border-white/10", 
  filled: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" 
};

export default function EmployerJobs() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  
  const [form, setForm] = useState({ 
    title: "", description: "", city: "", payment: 35, 
    level: "easy", is_remote: false, with_people: false, status: "open" 
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // בסישארפ: נתיב שמחזיר את כל המשרות של המעסיק המחובר
      const response = await api.get('/employers/my-jobs');
      setJobs(response.data);
    } catch (error) {
      console.error("שגיאה בטעינת משרות:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => { 
    setForm({ title: "", description: "", city: "", payment: 35, level: "easy", is_remote: false, with_people: false, status: "open" }); 
    setEditingJob(null); 
  };

  const handleSave = async () => {
    try {
      if (editingJob) {
        // עדכון משרה קיימת
        await api.put(`/jobs/${editingJob.id}`, form);
        toast({ title: "המשרה עודכנה בהצלחה" });
      } else {
        // יצירת משרה חדשה
        await api.post('/jobs', form);
        toast({ title: "המשרה נוספה! ✅" });
      }
      setDialogOpen(false); 
      resetForm(); 
      loadData();
    } catch (error) {
      toast({ title: "השמירה נכשלה", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("בטוח שברצונך למחוק את המשרה?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      toast({ title: "המשרה נמחקה" });
      loadData();
    } catch (error) {
      toast({ title: "המחיקה נכשלה", variant: "destructive" });
    }
  };

  const handleEdit = (job: JobListing) => {
    setEditingJob(job);
    setForm({ 
      title: job.title, 
      description: job.description || "", 
      city: job.city || "", 
      payment: job.payment || 35, 
      level: job.level || "easy", 
      is_remote: job.is_remote || false, 
      with_people: job.with_people || false, 
      status: job.status || "open" 
    });
    setDialogOpen(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );

  return (
  <> {/* הוספת Fragment עוטף */}
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
    >
      {/* כאן נכנס כל ה-JSX של הדף ששלחת קודם */}
      <h1>המשרות שלי</h1>
      {/* ... שאר הקוד ... */}
    </motion.div>

    {/* הערות צריכות להיות בתוך הסוגריים של ה-Fragment או בתוך ה-div */}
    {/* בכפתור המחיקה - נשאר זהה למה ששלחת, רק עם הקריאה ל-handleDelete */}
  </>
)};