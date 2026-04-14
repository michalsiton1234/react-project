import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// פונקציה חיונית לעיצובים של Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// הפונקציה שלך ליצירת כתובות URL
export function createPageUrl(pageName: string): string {
  if (!pageName) return '/';

  return '/' + pageName
    .trim()
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]/g, '');
}