import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import { Loader2, ArrowRight, User, Mail, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function CandidateProfile() {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidateData = async () => {
      console.log("ID from URL:", id); // בדוק ב-F12 אם המספר מופיע כאן
      if (!id) return;

      try {
        setLoading(true);
        // וודא שהנתיב בשרת הוא אכן /Candidate/toemp/{id}
        const res = await api.get(`/Candidate/toemp/${id}`);
        console.log("Data from Server:", res.data);
        setCandidate(res.data);
      } catch (err) {
        console.error("Error fetching candidate profile:", err);
        toast.error("שגיאה בשליפת הנתונים מהשרת");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0c]">
      <Loader2 className="animate-spin text-cyan-400" size={40} />
    </div>
  );

  if (!candidate) return (
    <div className="text-white text-center p-10">
      <p>לא נמצאו נתונים עבור מועמד מספר {id}</p>
      <button onClick={() => navigate(-1)} className="text-cyan-400 underline">חזור</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-8" dir="rtl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white mb-8">
        <ArrowRight size={20} /> חזור לרשימה
      </button>

      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-8">
          <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <User size={48} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{candidate.firstName} {candidate.lastName}</h1>
            <p className="text-white/60 flex items-center gap-2"><Mail size={16} /> {candidate.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h3 className="text-cyan-400 font-bold mb-4">סיכום מקצועי</h3>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              {candidate.professionalSummary || "אין מידע זמין"}
            </div>
          </section>
          <section>
            <h3 className="text-cyan-400 font-bold mb-4">ניסיון תעסוקתי</h3>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              {candidate.experienceDescription || "אין מידע זמין"}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}