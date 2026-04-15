import { api } from "./apiClient";

// מומלץ להגדיר Interface לנתונים (בהתאם ל-CategoriesDto ב-C#)
export interface Category {
  id?: number;
  name: string;
  // הוסיפי כאן שדות נוספים אם קיימים ב-DTO שלך
}

export const categoryAPI = {
  // GET: api/Category - קבלת כל הקטגוריות
  getAll: () => 
    api.get<Category[]>("/Category"),

  // GET: api/Category/5 - קבלת קטגוריה לפי ID
  getById: (id: number) => 
    api.get<Category>(`/Category/${id}`),

  // POST: api/Category - יצירת קטגוריה חדשה
  create: (category: Category) => 
    api.post<Category>("/Category", category),

  // PUT: api/Category/5 - עדכון קטגוריה קיימת
  update: (id: number, category: Category) => 
    api.put(`/Category/${id}`, category),

  // DELETE: api/Category/5 - מחיקת קטגוריה
  delete: (id: number) => 
    api.delete(`/Category/${id}`),
};