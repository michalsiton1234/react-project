// @ts-nocheck

export interface Employer {
  user_id: string;        // מזהה משתמש (חובה)
  company_name: string;   // שם חברה (חובה)
  status: 'active' | 'inactive'; // סטטוס (יכול להיות רק אחד משני אלה)
}

// ערכי ברירת מחדל במידת הצורך
export const EmployerDefaults: Partial<Employer> = {
  status: 'active',
};