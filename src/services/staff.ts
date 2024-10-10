import { Staff } from '@/types/staff';
import axiosInstance from './config';
import { PaginationResponse } from '@/types/pagination';
import { APIResponse } from '@/types/api';

export const getStaffListByPagination = (query: string) => {
    return axiosInstance.get<PaginationResponse<Staff>>(`/api/staff/staff?${query}`);
};

export const createStaff = (body: Staff) => {
    return axiosInstance.post<Staff>('/api/staff/staff', body);
};

export const getSingleStaff = (staffId: string) => {
    return axiosInstance.get<Staff>(`/api/staff/staff/${staffId}`);
};

export const updateStaff = (staffId: string, body: Staff & { reason: string }) => {
    return axiosInstance.post<Staff>(`/api/staff/staff/${staffId}`, body);
};

export const updateStaffPassword = (staffId: string, body: { password: string; reason: string }) => {
    return axiosInstance.put<Staff>(`/api/staff/staff/${staffId}`, body);
};

export const deleteStaff = (staffId: string, body: { reason: string }) => {
    return axiosInstance.delete<Staff>(`/api/staff/staff/${staffId}/delete`, {
        data: body,
    });
};

export const restoreStaff = (staffId: string) => {
    return axiosInstance.put<Staff>(`/api/staff/staff`, { staffId });
};

export const updateStaffStatus = (staffId: string, body: { status: boolean; reason: string }) => {
    return axiosInstance.put<Staff>(`/api/staff/staff/${staffId}/status`, body);
};

// export const resendStaffVerificationEmail = (staffId: string, reason: string) => {
//     return axiosInstance.post<Staff>(`/api/staff/staff/${staffId}/resend-email-verification`, { reason });
// };

// export const updateStaffCredential = (staffId: string, body: { email: string; reason: string }) => {
//     return axiosInstance.put<Staff>(`/api/staff/staff/${staffId}/credential`, body);
// };

export const updateStaffRole = (staffId: string, values: { reason: string; roleId: string }) => {
    return axiosInstance.put<Staff>(`/api/staff/staff/${staffId}/role`, {
        roleId: values.roleId,
        reason: values.reason,
    });
};

// export const verifyTokenById = (staffId: string, token: string, body: Staff) => {
//     return axiosInstance.post<APIResponse>(`/api/staff/auth/reset-staff-password/${staffId}/${token}`, body);
// };

// export const tokenCheckerById = (staffId: string, token: string) => {
//     return axiosInstance.get<Staff>(`/api/staff/auth/verify-reset-token/${staffId}/${token}`);
// };
