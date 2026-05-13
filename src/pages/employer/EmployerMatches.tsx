import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users, Zap, Send, User as UserIcon,
  Sparkles, LayoutDashboard, X, Check, Loader2, Mail, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { fetchMatches } from "@/store/matchSlice";
import { GetMatchsByEmpID, GetMatchByJobID, GetRejecteds } from "@/api/matchApi";

import type { RootState } from "@/store";
import type { JobListing } from "@/models/JobListing";
import type { Match } from "@/models/Match";

import "./EmployerMatches.css";

export default function EmployerMatches() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items: allMatches } = useSelector((state: RootState) => state.matches);
  
  const [activeTab, setActiveTab] = useState<'smart' | 'offers'>('smart');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [offers, setOffers] = useState<Match[]>([]);
  const [isRunningAlg, setIsRunningAlg] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  const [algorithmResults, setAlgorithmResults] = useState<Match[]>([]);
  const [isViewSpecific, setIsViewSpecific] = useState(false);
  const [isFetchingSpecific, setIsFetchingSpecific] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const userId = parseInt(user.id);
      dispatch(fetchMatches(userId) as any);
      loadOffers(userId);
      fetchLatestAlgorithmResults(userId);
    }
  }, [user?.id, dispatch]);

  const fetchLatestAlgorithmResults = async (userId: number) => {
    try {
      setIsFetchingSpecific(true);
      const empRes = await api.get(`/Employer/byUser/${userId}`);
      const results = await GetRejecteds(empRes.data.id);
      
      if (results && results.length > 0) {
        setAlgorithmResults(results);
        setIsViewSpecific(true);
      }
    } catch (err) {
      console.error("Error fetching specific results:", err);
    } finally {
      setIsFetchingSpecific(false);
    }
  };

  const loadJobsForSelection = async () => {
    if (!user?.id) return;
    try {
      setIsLoadingJobs(true);
      const empRes = await api.get(`/Employer/byUser/${user.id}`);
      const employerId = empRes.data.id;
      const res = await api.get(`/JobListing/getByEmp/${employerId}`);
      setJobs(res.data);
    } catch (err) {
      toast.error("נכשל בטעינת רשימת המשרות");
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const loadOffers = async (userId: number) => {
    try {
      const empRes = await api.get(`/Employer/byUser/${userId}`);
      const data = await GetMatchsByEmpID(empRes.data.id);
      setOffers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunAlgorithm = async () => {
    if (!user?.id || !selectedJobId) {
      toast.error("אנא בחר משרה");
      return;
    }
    
    try {
      setIsRunningAlg(true);
      await GetMatchByJobID(selectedJobId); 
      
      const userId = parseInt(user.id);
      await fetchLatestAlgorithmResults(userId);
      
      toast.success("התאמות חכמות עודכנו בהצלחה!");
      dispatch(fetchMatches(userId) as any);
      setIsModalOpen(false);
    } catch (err) {
      toast.error("שגיאה בהפעלת האלגוריתם");
    } finally {
      setIsRunningAlg(false);
    }
  };

  const displayList = isViewSpecific ? algorithmResults : allMatches;

  return (
    <div className="matches-container">
      <div className="matches-content-wrapper">
        
        <header className="matches-header">
          <div className="header-title">
            <h1>ניהול התאמות חכמות</h1>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* כפתור לוח מנהל המנווט ל- /employer/jobs כפי שמופיע ב- image_8dee9b.png */}
            <button 
              onClick={() => navigate('/employer/jobs')} 
              className="btn-action"
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
              }}
            >
              <LayoutDashboard size={18} />
              לוח מנהל
            </button>

            <button 
              onClick={() => {
                setIsModalOpen(true);
                loadJobsForSelection();
              }} 
              className="btn-action btn-primary"
            >
              <Sparkles size={18} />
              עדכן התאמות חכמות
            </button>
          </div>
        </header>

        <nav className="matches-tabs">
          <button 
            onClick={() => {
              setActiveTab('smart');
              if (algorithmResults.length > 0) setIsViewSpecific(true);
            }}
            className={`tab-item ${activeTab === 'smart' ? 'active' : ''}`}
          >
            <Zap size={16} /> התאמות חכמות
          </button>
          <button 
            onClick={() => {
              setActiveTab('offers');
              setIsViewSpecific(false);
            }}
            className={`tab-item ${activeTab === 'offers' ? 'active' : ''}`}
          >
            <Send size={16} /> הצעות שנשלחו לי ממועמדים
          </button>
        </nav>

        <div className="matches-grid">
          {activeTab === 'smart' ? (
            <>
              {isFetchingSpecific && (
                <div className="col-span-full text-center py-4 text-cyan-400 flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-sm">מעדכן נתונים...</span>
                </div>
              )}

              {displayList.length > 0 ? (
                displayList.map(match => (
                  <div key={match.id} className="match-card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                          <Mail className="text-cyan-400" size={20} />
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-sm truncate" title={match.candidateEmail}>
                            {match.candidateEmail || `מועמד #${match.candidateId}`}
                          </h3>
                          <p className="text-xs text-white/40">משרה: #{match.jobId}</p>
                        </div>
                      </div>
                      <div className="score-badge shrink-0">{match.matchScore}% התאמה</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                   <p className="text-white/40">לא נמצאו התאמות.</p>
                </div>
              )}
            </>
          ) : (
            offers.map(offer => (
              <div key={offer.id} className="match-card p-6 border-emerald-500/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Send className="text-emerald-400" size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-sm truncate">
                        {offer.candidateEmail || `מועמד #${offer.candidateId}`}
                      </h3>
                      <p className="text-xs text-white/40 italic">משרה #{offer.jobId}</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate(`/employer/candidate/${offer.candidateId}`)}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs rounded-lg transition-colors border border-emerald-500/20"
                >
                  <ExternalLink size={14} />
                  צפה בפרופיל המועמד
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="job-selection-modal"
            >
              <div className="modal-header">
                <h3>בחר משרה לעדכון</h3>
                <button onClick={() => setIsModalOpen(false)}><X /></button>
              </div>
              <div className="job-list-container">
                {isLoadingJobs ? <Loader2 className="animate-spin mx-auto" /> : 
                  jobs.map(job => (
                    <div 
                      key={job.id} 
                      onClick={() => setSelectedJobId(job.id)}
                      className={`job-option ${selectedJobId === job.id ? 'selected' : ''}`}
                    >
                      {job.title} (ID: {job.id})
                    </div>
                  ))
                }
              </div>
              <div className="modal-footer">
                <button 
                  onClick={handleRunAlgorithm} 
                  disabled={isRunningAlg || !selectedJobId}
                  className="run-alg-btn"
                >
                  {isRunningAlg ? "מעבד..." : "הפעל אלגוריתם"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}