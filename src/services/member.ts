import axiosInstance from './config';
import { PaginationResponse } from '@/types/pagination';
import { Member } from '@/types/member';

export const getMemberListByPagination = (query: string) => {
    return axiosInstance.get<PaginationResponse<Member>>(`/api/staff/member?${query}`);
};

export const createMember = (body: Member) => {
    return axiosInstance.post<Member>('/api/staff/member', body);
};

export const createMemberPoint = (body: Member) => {
    return axiosInstance.post<Member>('/api/staff/member/point', body);
};

export const createMemberCoupon = (body: Member) => {
    return axiosInstance.post<Member>('/api/staff/member/coupon', body);
};

export const getSingleMember = (memberId: string) => {
    return axiosInstance.get<Member>(`/api/staff/member/${memberId}`);
};

export const updateMember = (memberId: string, body: Member) => {
    return axiosInstance.post<Member>(`/api/staff/member/${memberId}`, body);
};

export const updateMemberPassword = (memberId: string, body: { password: string; reason: string }) => {
    return axiosInstance.put<Member>(`/api/staff/member/${memberId}`, body);
};

export const deleteMember = (memberId: string, body: { reason: string }) => {
    return axiosInstance.post<Member>(`/api/staff/member/${memberId}/delete`, {
        data: body,
    });
};

export const restoreMember = (memberId: string) => {
    return axiosInstance.put<Member>(`/api/staff/member`, { memberId });
};

export const updateMemberStatus = (memberId: string, body: { status: boolean; reason: string }) => {
    return axiosInstance.post<Member>(`/api/staff/member/${memberId}/status`, body);
};
