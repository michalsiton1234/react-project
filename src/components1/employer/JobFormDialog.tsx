
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { JobListing } from "@/models/JobListing";

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface JobForm {
  title: string;
  description: string;
  location: string;
  payment: number;
  level: string;
  is_remote: boolean;
  is_job_with_people: boolean;
  is_catch: boolean;
  categoryIds: number[];
}

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: JobForm;
  setForm: (form: JobForm) => void;
  categories: Category[];
  editingJob: JobListing | null;
  onSave: () => void;
}

export default function JobFormDialog({
  open,
  onOpenChange,
  form,
  setForm,
  categories,
  editingJob,
  onSave,
}: JobFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#0F172A] text-white border-white/10 max-w-md max-h-[85vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editingJob ? "עריכת משרה" : "משרה חדשה"}
          </DialogTitle>
          <DialogDescription>מלאו את פרטי המשרה שתוצג למחפשי עבודה</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-300">כותרת המשרה</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-gray-300">תיאור</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-white/5 border-white/10 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-300">עיר</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-300">שכר לשעה</Label>
              <Input
                type="number"
                value={form.payment}
                onChange={(e) => setForm({ ...form, payment: Number(e.target.value) })}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-gray-300">רמת קושי</Label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full bg-[#1e293b] border border-white/10 rounded-md h-10 px-3"
            >
              <option value="easy">קלה</option>
              <option value="medium">בינונית</option>
              <option value="hard">קשה</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-gray-300">עבודה מרחוק</span>
            <Switch
              checked={form.is_remote}
              onCheckedChange={(v) => setForm({ ...form, is_remote: v })}
            />
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-gray-300">עבודה עם אנשים</span>
            <Switch
              checked={form.is_job_with_people}
              onCheckedChange={(v) => setForm({ ...form, is_job_with_people: v })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-200">בחר קטגוריה</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm({ ...form, categoryIds: [cat.id] })}
                  className={`category-button flex items-center justify-between p-2 rounded-md border ${
                    form.categoryIds.includes(cat.id)
                      ? "bg-cyan-600/30 border-cyan-500"
                      : "bg-slate-700/50 border-slate-600"
                  }`}
                >
                  <span>{cat.name}</span> <span>{cat.icon}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onSave}
            className="w-full bg-cyan-600 hover:bg-cyan-500 py-2.5 rounded-lg font-medium transition-all"
          >
            {editingJob ? "עדכן משרה" : "פרסם עכשיו"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
