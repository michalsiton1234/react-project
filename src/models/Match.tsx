// @ts-nocheck

export interface Match {
  job_id: string;            // מזהה משרה (חובה)
  candidate_id: string;      // מזהה מועמד (חובה)
  candidate_user_id: string; // מזהה משתמש מועמד (חובה)
  employer_id: string;       // מזהה מעסיק (חובה)
  status: 'pending' | 'accepted' | 'rejected'; // סטטוס השידוך
  job_title: string;         // שם המשרה (חובה)
  job_city?: string;         // עיר המשרה (רשות)
  job_payment?: number;      // תשלום (רשות)
}

// ערכי ברירת מחדל
export const MatchDefaults: Partial<Match> = {
  status: 'pending',
};
