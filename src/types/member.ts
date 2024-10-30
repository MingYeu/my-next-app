import { ActivityLog } from './activityLog';
import { Coupon } from './coupon';
import { Package } from './package';
import { Role } from './role';

export interface Member {
    id: string;
    memberId: string;
    code: string;
    idNumber: string;
    englishName: string;
    chineseName: string | null;
    phoneNumber: string;
    email: string;
    gender: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    // password: string;
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
    member_package: Member_Package[];
    member_coupon: Member_Coupon[];
    member_point: Member_Point;
    member_referral: Member_Referral;
    // _count: { Notification_Status: number };
}

export interface Member_Package {
    id: string;
    packageId: string;
    memberId: string;
    startDate: string;
    endDate: string;
    active: boolean;
    member: Member;
    package: Pick<Package, 'id' | 'name'>;
}

export interface Member_Coupon {
    id: string;
    couponId: string;
    memberId: string;
    startDate: string;
    endDate: string;
    active: boolean;
    member: Member;
    coupon: Pick<Coupon, 'id' | 'code'>;
}

export interface Member_Point {
    id: string;
    point: number;
    memberId: string;
    invoiceNo: string;
    member: Member;
}

export interface Member_Referral {
    id: string;
    phoneNumber: string;
    name: string;
}
