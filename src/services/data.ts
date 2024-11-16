import { Role } from '@/types/role';
import axiosInstance from './config';
import { PaginationResponse } from '@/types/pagination';
// import { Subject } from '@/types/subject';
// import { Course } from '@/types/course';
// import { Assignment } from '@/types/assignment';
// import { Assignment_Tutor, Tutor } from '@/types/tutor';
// import { Student } from '@/types/student';
// import { ApplicationInfo } from '@/types/siteSetting';
import { Dashboard } from '@/types';
import { Member } from '@/types/member';
import { Package } from '@/types/package';
import { Coupon, CouponSeries } from '@/types/coupon';

export const getRoleData = () => {
    return axiosInstance.get<Role[]>('/api/staff/data/role');
};

export const getPackageData = () => {
    return axiosInstance.get<Package[]>('/api/staff/data/package');
};

export const getMembersList = (debouncedKeyword: string) => {
    return axiosInstance.get<Member[]>(`/api/staff/data/member?keyword=${debouncedKeyword}&perPage=10`);
};

export const getCouponSeriesList = (debouncedKeyword: string) => {
    return axiosInstance.get<CouponSeries[]>(`/api/staff/data/coupon-series?keyword=${debouncedKeyword}&perPage=10`);
};

export const getCouponsList = (debouncedKeyword: string) => {
    return axiosInstance.get<Coupon[]>(`/api/staff/data/coupon?keyword=${debouncedKeyword}&perPage=10`);
};

export const getDashboardInfo = () => {
    return axiosInstance.get<Dashboard>(`/api/staff/data/dashboard`);
};

export const exportData = (table: string) => {
    return axiosInstance.get<any>(`/api/staff/data/export/${table}`);
};
