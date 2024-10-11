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

export const getRoleData = () => {
    return axiosInstance.get<Role[]>('/api/staff/data/role');
};

export const getPackageData = () => {
    return axiosInstance.get<Role[]>('/api/staff/data/package');
};

export const getDashboardInfo = () => {
    return axiosInstance.get<Dashboard>(`/api/staff/data/dashboard`);
};

export const exportData = (table: string) => {
    return axiosInstance.get<any>(`/api/staff/data/export/${table}`);
};
