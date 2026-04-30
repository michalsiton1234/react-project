// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { api } from '@/api/apiClient'; // ה-Axios שיצרנו בתמונה
import type { JobListing } from '@/models/JobListing'; // המודל הקצר שבנינו
const JobsPage = () => {
  // 1. ניהול הסטייט (מצב) של העמוד
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. שליפת נתונים מה-C# (בדיוק מה שהמורה ביקשה!)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // פנייה ל-Controller שלך בסישארפ
        const response = await api.get('/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error("שגיאה בטעינת המשרות:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <div>טוען משרות מהשרת...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">רשימת משרות מהסישארפ שלי</h1>

      {/* כאן את מדביקה את העיצוב של ה-Cards/Table שהעתקת מ-Base44 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div key={job.employer_id} className="border p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p>{job.description}</p>
            <p className="text-blue-600 font-bold">{job.payment} ₪ לשעה</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsPage;