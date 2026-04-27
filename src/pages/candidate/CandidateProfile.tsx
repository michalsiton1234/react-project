// @ts-nocheck
import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    city: "",
    max_distance: 10,
    min_hourly_rate: 30,
    activity: true,
    level: "easy",
    is_remote_only: false,
    with_people: true,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // בסישארפ שלך - נתיב שמביא את הפרופיל של המשתמש המחובר
      const response = await api.get('/Candidate/my-profile');
      if (response.data) {
        const p = response.data;
        setForm({
          city: p.city || "",
          max_distance: p.max_distance || 10,
          min_hourly_rate: p.min_hourly_rate || 30,
          activity: p.activity !== false,
          level: p.level || "easy",
          is_remote_only: p.is_remote_only || false,
          with_people: p.with_people !== false
        });
      }
    } catch (error) {
      console.error("שגיאה בטעינת פרופיל:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.city) return;
    setSaving(true);
    try {
      // בסישארפ שלך - POST או PUT לעדכון הפרופיל
      await api.post('/Candidate/profile', form);
      toast({ title: "הפרופיל נשמר! ✅" });
      loadData();
    } catch (error) {
      toast({ title: "שגיאה בשמירה", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };
  return (
    <div>
      {/* כאן את מדביקה את כל ה-JSX של העמוד */}
    </div>
  );
}
// ... (ה-JSX של ה-Return נשאר זהה למה ששלחת, הוא מעולה!)