// @ts-nocheck

export interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  payment?: number;
  requiredDate: string;
  isCatch: boolean;
  isRemote: boolean;
  isJobWithPepole: boolean;
  categoryId: number;
  leveJob: 'Easy' | 'Medium' | 'Hard';
  employerId: number;
}

export interface Match {
  id?: number;
  candidateId: number;       // מזהה מועמד (חובה)
  jobId: number;            // מזהה משרה (חובה)
  job?: Job;                // פרטי המשרה המלאים
  matchScore: number;        // ציון התאמה
  matchDate?: string;        // תאריך התאמה
  status?: string;           // סטטוס: 'pending', 'accepted', 'rejected'
}

// ערכי ברירת מחדל
export const MatchDefaults: Partial<Match> = {
  status: 'pending',
};
