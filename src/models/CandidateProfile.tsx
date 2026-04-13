// @ts-nocheck

export interface CandidateProfile {
  user_id: string;          // מזהה משתמש
  city: string;             // עיר
  max_distance?: number;    // מרחק מקסימלי (ק"מ) - סימן שאלה אומר שזה רשות
  min_hourly_rate?: number; // שכר שעתי מינימלי (₪)
  activity: boolean;        // פעיל
  level: 'easy' | 'medium' | 'hard'; // רמת קושי מבוקשת
  is_remote_only: boolean;  // עבודה מרחוק בלבד
  with_people: boolean;     // מעוניין בעבודה עם אנשים
}

// הגדרת ערכי ברירת מחדל (אופציונלי, אם תרצי להשתמש בהם ביצירת פרופיל חדש)
export const CandidateProfileDefaults: Partial<CandidateProfile> = {
  activity: true,
  is_remote_only: false,
  with_people: true,
};