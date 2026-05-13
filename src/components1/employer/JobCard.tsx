import { motion } from "framer-motion";
import { MapPin, DollarSign, Briefcase, Pencil, Trash2 } from "lucide-react";
import type { JobListing } from "@/models/JobListing";

interface JobCardProps {
  job: JobListing;
  onEdit: (job: JobListing) => void;
  onDelete: (id: number) => void;
}

export default function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  return (
    <motion.div key={job.id} className="job-card" layout>
      <div className="flex justify-between mb-3">
        <span className="status-badge">פתוחה</span>
        <div className="flex gap-2">
          <button onClick={() => onEdit(job)} className="text-white/60 hover:text-cyan-400">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(job.id)} className="text-white/60 hover:text-red-400">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <h3 className="text-lg font-bold text-white">{job.title}</h3>
      <p className="text-white/60 text-sm mt-2 line-clamp-2">{job.description}</p>
      <div className="mt-4 space-y-2 text-sm text-white/70">
        <div className="flex items-center gap-2"><MapPin size={14} /> {job.location}</div>
        <div className="flex items-center gap-2"><DollarSign size={14} /> {job.payment} ₪</div>
        <div className="flex items-center gap-2"><Briefcase size={14} /> {job.isRemote ? "עבודה מרחוק" : "מיקום פיזי"}</div>
      </div>
    </motion.div>
  );
}
