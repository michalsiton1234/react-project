import { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useSelector } from "react-redux";
import { useAuth } from "@/lib/AuthContext";
import type { RootState } from "@/store";
import { toast } from "sonner";
import type { JobListing } from "@/models/JobListing";
import { employerAPI } from "@/api/EmployerApi";

export interface JobForm {
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

const defaultForm: JobForm = {
  title: "",
  description: "",
  location: "",
  payment: 35,
  level: "easy",
  is_remote: false,
  is_job_with_people: false,
  is_catch: false,
  categoryIds: [],
};

export function useEmployerJobs() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: number; name: string; icon: string }[]>([]);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employer, setEmployer] = useState<any>(null);
  const [form, setForm] = useState<JobForm>(defaultForm);

  const { isLoading: authLoading } = useAuth();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchEmployerData = async () => {
      const userId = user?.id ? parseInt(user.id) : null;
      if (userId && userId > 0) {
        try {
          const data = await employerAPI.getByUserId(userId);
          setEmployer(data);
        } catch (err) {
          console.error("שגיאה בשליפת מעסיק:", err);
        }
      }
    };

    if (!authLoading) {
      fetchEmployerData();
    }
  }, [user?.id, authLoading]);

  useEffect(() => {
    if (employer?.id) {
      loadJobs();
    }
  }, [employer?.id]);

  const loadCategories = async () => {
    try {
      const res = await api.get("/Category");
      const categoryIcons: { [key: string]: string } = {
        "ביביסיטר": "👶",
        "משלוחים": "📦",
        "ניקיון": "🧹",
        "קלדנות": "⌨️",
        "סטודנט": "📚",
        "מרחוק": "🏠",
        "אחר": "✨",
        "שירות": "🎧",
      };
      const mappedCategories = res.data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        icon: categoryIcons[cat.name] || "📋",
      }));
      setCategories(mappedCategories);
    } catch (err) {
      toast.error("שגיאה בטעינת קטגוריות");
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/JobListing/getByEmp/${employer.id}`);
      setJobs(res.data);
    } catch (err) {
      toast.error("שגיאה בטעינת משרות");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingJob(null);
  };

  const handleEdit = (job: JobListing) => {
    setEditingJob(job);
    const loadedCategoryIds =
      job.categoryIds || (job.categoryId ? [job.categoryId] : []);

    setForm({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      payment: job.payment || 35,
      level:
        job.leveJob === 0 ? "easy" : job.leveJob === 1 ? "medium" : "hard",
      categoryIds: Array.isArray(loadedCategoryIds)
        ? loadedCategoryIds
        : [loadedCategoryIds],
      is_remote: Boolean(job.isRemote),
      is_job_with_people: Boolean(job.isJobWithPepole),
      is_catch: Boolean(job.isCatch),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!employer?.id) {
        toast.error("מזהה מעסיק לא נמצא");
        return;
      }

      const firstCategoryId = form.categoryIds?.[0];
      if (!firstCategoryId) {
        toast.error("יש לבחור קטגוריה");
        return;
      }

      const levelValue =
        form.level === "easy" ? 0 : form.level === "medium" ? 1 : 2;
      debugger;

      const jobData = {
        Id: editingJob ? Number(editingJob.id) : 0,
        EmployerId: Number(employer.id),
        CategoryId: Number(firstCategoryId),
        Title: form.title,
        Description: form.description,
        Location: form.location,
        Payment: Number(form.payment),
        RequiredDate: editingJob?.requiredDate || new Date().toISOString(),
        IsCatch: Boolean(form.is_catch),
        IsRemote: Boolean(form.is_remote),
        IsJobWithPepole: Boolean(form.is_job_with_people),
        leveJob: levelValue,
      };

      console.log("Payload being sent:", jobData);

      if (editingJob) {
        const response = await api.put(`/JobListing/${editingJob.id}`, jobData);
        console.log("Server response:", response.data);
        toast.success("המשרה עודכנה בהצלחה");
      } else {
        await api.post("/JobListing", jobData);
        toast.success("המשרה פורסמה בהצלחה");
      }

      setDialogOpen(false);
      resetForm();
      await loadJobs();
    } catch (err: any) {
      console.error("FULL ERROR OBJECT:", err);
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors)
          .flat()
          .join(", ");
        toast.error(`שגיאת שרת: ${validationErrors}`);
      } else {
        toast.error(err.response?.data || "שגיאה בתקשורת עם השרת");
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

  return {
    jobs,
    loading,
    categories,
    editingJob,
    dialogOpen,
    setDialogOpen,
    employer,
    form,
    setForm,
    authLoading,
    user,
    resetForm,
    handleEdit,
    handleSave,
    handleDelete,
  };
}
