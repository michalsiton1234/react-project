export const UserRole = {
    Candidate: 1,
    Employer: 2,
    Admin: 3
} as const;

// כדי שתוכלי להשתמש בזה גם כטיפוס (Type)
export type UserRole = typeof UserRole[keyof typeof UserRole];
// הגדרת ה-DTO בדיוק כפי שהוא חוזר מה-API
export interface UserDto {
    id: number;
    name: string;
    email: string;
    userType?: string; // ה-Enum מגיע מהשרת כמחרוזת (string)
    isEnable: boolean;
}