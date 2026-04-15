// @ts-nocheck

export interface JobListing {
  employer_id: string;      // מזהה מעסיק (חובה)
  title: string;            // כותרת משרה (חובה)
  description: string;      // תיאור (חובה)
  category_id?: string;     // קטגוריה (רשות)
  city: string;             // עיר (חובה)
  payment: number;          // תשלום (₪ לשעה) (חובה)
  level: 'easy' | 'medium' | 'hard'; // רמת קושי (חובה)
  is_remote: boolean;       // עבודה מרחוק (ברירת מחדל: false)
  with_people: boolean;     // עבודה עם אנשים (ברירת מחדל: false)
  status: 'open' | 'closed' | 'filled'; // סטטוס המשרה
}

// ערכי ברירת מחדל לשימוש בקוד
export const JobListingDefaults: Partial<JobListing> = {
  is_remote: false,
  with_people: false,
  status: 'open',
};
