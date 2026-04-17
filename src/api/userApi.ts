import { api } from './apiClient'; 
import {  type UserDto } from '../models/user';

export const userApi = {
    
    // הרשמה כמתמודד
    // ה-userDto נשלח ב-Body, והסיסמה ב-URL
    registerCandidate: async (userDto: UserDto, password: string): Promise<string> => {
        const response = await api.post<string>(`/User/register/candidate?password=${encodeURIComponent(password)}`, userDto);
        return response.data;
    },

    // הרשמה כמעסיק
    registerEmployer: async (userDto: UserDto, password: string): Promise<string> => {
        const response = await api.post<string>(`/User/register/employer?password=${encodeURIComponent(password)}`, userDto);
        return response.data;
    },

    // התחברות
    // כאן שני הפרמטרים נשלחים ב-URL כפי שמופיע ב-Controller שלך
    login: async (email: string, password: string): Promise<string> => {
        const response = await api.post<string>(
            `/User/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        );
        return response.data;
    },

    // קבלת כל המשתמשים
    getAll: async (): Promise<UserDto[]> => {
        const response = await api.get<UserDto[]>('/User');
        return response.data;
    },

    // קבלת משתמש לפי ID
    getById: async (id: number): Promise<UserDto> => {
        const response = await api.get<UserDto>(`/User/${id}`);
        return response.data;
    },

    // מחיקת משתמש
    delete: async (id: number): Promise<void> => {
        await api.delete(`/User/${id}`);
    }
};