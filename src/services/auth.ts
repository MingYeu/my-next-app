import axiosInstance from './config';
import { Staff } from '@/types/staff';

export const login = (body: { code: string; password: string }) => {
    return axiosInstance.post<string>('/api/staff/auth/login', body);
};

export const logout = () => {
    return axiosInstance.post<string>('/api/staff/auth/logout');
};

export const authenticationStaff = (body: { token: string; permission: string }) => {
    return axiosInstance.post<Staff>('/api/staff/auth/authenticate', body);
};

export const tokenChecking = (staffId: string, token: string) => {
    return axiosInstance.get<string>(`/api/staff/auth/tokenVerifier/${staffId}/${token}`);
};

export const verifyStaff = (staffId: string, token: string, body: { password: string }) => {
    return axiosInstance.post<string>(`/api/staff/auth/verify/${staffId}/${token}`, body);
};

export const requestResetPassword = (body: { email: string }) => {
    return axiosInstance.post<string>('/api/staff/auth/request-reset-password', body);
};
