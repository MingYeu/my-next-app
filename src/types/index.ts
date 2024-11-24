import { AxiosError } from 'axios';
import { Staff } from './staff';

export type Locale = 'en-GB' | 'zh-HK' | 'zh-CN';

export interface BreadCrumbItem {
    label: string;
    path: string;
}

export interface StaffPortalProps {
    staff: Staff;
}

export type AxiosErrorResponse = AxiosError<{
    message: string;
    status: number;
}>;

export enum Gender {
    'Male',
    'Female',
}

export type LoginBody = {
    code: string;
    password: string;
};

export type Dashboard = {
    userManagement: {
        membersByPackage: {
            packageName: string;
            total: number;
        }[];
        couponBySeries: {
            seriesName: string;
            total: number;
        }[];
    };
};
