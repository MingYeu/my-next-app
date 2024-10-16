import { ActivityLog } from './activityLog';
import { Role } from './role';

export interface Staff {
    id: string;
    staffId: string;
    code: string;
    idNumber: string;
    designation: string;
    englishName: string;
    chineseName: string | null;
    phoneNumber: string;
    email: string;
    gender: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    password: string;
    remarks: string | null;
    lastActive: string;
    active: boolean;
    token: string | null;
    tokenExpiredAt: string | null;
    resetToken: string | null;
    resetTokenExpiredAt: string | null;
    joinDate: string;
    roleId: string;
    role: Role & Permissions;
    activityLogs: ActivityLog[];
    unauthorized: boolean;
    oldPassword: string;
    confirmPassword: string;
    _count: { Notification_Status: number };
}
