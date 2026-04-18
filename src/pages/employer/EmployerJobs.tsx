// @ts-nocheck
import { useState, useEffect } from "react";
import { api } from "@/api/apiClient"; 
import { motion } from "framer-motion";
import { Plus, Briefcase, MapPin, DollarSign, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getUserId } from "@/lib/auth"; // וודאי שהפונקציה הזו קיימת ב-auth.ts כפי שסיכמנו
import type { JobListing } from "@/models/JobListing";

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

  useEffect(() => { 
    loadData(); 
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const id = getUserId(); // מחלץ את ה-nameid מהטוקן
      
      if (!id) {
        toast.error("לא נמצא מזהה משתמש, אנא התחברי מחדש");
        return;
      }

      // הניתוב המדויק ל-C#: api/Employer/{id}/jobs
      const response = await api.get(`/Employer/${id}/jobs`);
      setJobs(response.data);
    } catch (error) {
      console.error("שגיאה בטעינת משרות:", error);
      toast.error("נכשלה טעינת המשרות מהשרת");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const id = getUserId();
      if (editingJob) {
        // עדכון: api/Employer/{id}
        await api.put(`/Employer/${editingJob.id}`, form);
        toast.success("המשרה עודכנה בהצלחה");
      } else {
        // יצירה: שולחים פוסט לקונטרולר הכללי עם הנתונים
        // שימי לב: וודאי שה-DTO בסישארפ כולל שדה של EmployerId
        await api.post('/Employer', { ...form, employerId: id });
        toast.success("המשרה נוספה בהצלחה! ✅");
      }
      setDialogOpen(false); 
      resetForm(); 
      loadData();
    } catch (error) {
      toast.error("השמירה נכשלה - בדקי את נתוני הטופס");
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm("בטוח שברצונך למחוק את המשרה?")) return;
    try {
      // מחיקה: api/Employer/{id}
      await api.delete(`/Employer/${jobId}`);
      toast.success("המשרה נמחקה");
      loadData();
    } catch (error) {
      toast.error("המחיקה נכשלה");
    }
  };

  const resetForm = () => { 
    setForm({ title: "", description: "", city: "", payment: 35, level: "easy", is_remote: false, with_people: false, status: "open" }); 
    setEditingJob(null); 
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
    <div className="p-6 max-w-6xl mx-auto text-right" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">ניהול משרות</h1>
          <p className="text-white/60">נהל את המשרות הפעילות שלך והצעות עבודה</p>
        </div>
        <button 
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          משרה חדשה
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <motion.div 
            key={job.id}
            className="bg-[#111827] border border-white/10 rounded-xl p-5 hover:border-cyan-500/50 transition-all shadow-xl"
            layout
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[job.status]}`}>
                {STATUS_LABELS[job.status]}
              </span>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(job)} className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-cyan-400 transition-colors">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(job.id)} className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-red-400 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
            <p className="text-white/60 text-sm mb-4 line-clamp-2">{job.description}</p>

            <div className="space-y-3 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <MapPin size={16} className="text-cyan-400" />
                {job.city} {job.is_remote && "(מרחוק)"}
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <DollarSign size={16} className="text-emerald-400" />
                {job.payment} ₪ לשעה
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Briefcase size={16} className="text-purple-400" />
                רמה: {LEVEL_LABELS[job.level]}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0F172A] border-white/10 text-white max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingJob ? "עריכת משרה" : "הוספת משרה חדשה"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>כותרת המשרה</Label>
              <Input 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})}
                className="bg-white/5 border-white/10 focus:border-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <Label>תיאור</Label>
              <Textarea 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})}
                className="bg-white/5 border-white/10 focus:border-cyan-500 h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>עיר</Label>
                <Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>שכר לשעה</Label>
                <Input type="number" value={form.payment} onChange={e => setForm({...form, payment: Number(e.target.value)})} className="bg-white/5 border-white/10" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <Label>עבודה מרחוק?</Label>
              <Switch checked={form.is_remote} onCheckedChange={val => setForm({...form, is_remote: val})} />
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              {editingJob ? "עדכן משרה" : "פרסם משרה"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}