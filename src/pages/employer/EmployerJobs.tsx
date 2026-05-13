
import { useNavigate } from "react-router-dom";
import { Plus, LayoutDashboard } from "lucide-react";
import { useEmployerJobs } from "@/hooks/useEmployerJobs";
import JobCard from "@/components1/employer/JobCard";
import JobFormDialog from "@/components1/employer/JobFormDialog";
import "@/style/employer/EmployerJobs.css";

export default function EmployerJobs() {
  const navigate = useNavigate();

  const {
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
  } = useEmployerJobs();

  if (authLoading || (loading && !jobs.length && employer)) {
    return (
      <div className="loader-container">
        <div className="text-center">
          <div className="spinner" />
          <p className="text-white text-sm">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      <div className="header-section">
        <div>
          <h1 className="text-3xl font-bold text-white">ניהול משרות</h1>
          <p className="text-white/60">שלום, {user?.name || "מעסיק"}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/employer/matches")}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-lg text-white"
          >
            <LayoutDashboard size={18} /> לוח מנהל
          </button>
          <button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg text-white"
          >
            <Plus size={18} /> משרה חדשה
          </button>
        </div>
      </div>

      <div className="job-grid">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <JobFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        setForm={setForm}
        categories={categories}
        editingJob={editingJob}
        onSave={handleSave}
      />
    </div>
  );
}