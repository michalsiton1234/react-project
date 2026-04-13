import { QueryClient } from "@tanstack/react-query";

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // הנתונים נחשבים "טריים" ל-5 דקות
      retry: 1, // אם בקשה נכשלת, לנסות רק פעם אחת נוספת
      refetchOnWindowFocus: false, // לא לרענן נתונים בכל פעם שעוברים חלונית
    },
  },
});