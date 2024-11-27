import axiosInstance from './config';
import { PaginationResponse } from '@/types/pagination';
import { Member, MemberChildren } from '@/types/member';
import { Coupon } from '@/types/coupon';

export const getMemberListByPagination = (query: string) => {
    return axiosInstance.get<PaginationResponse<Member>>(`/api/staff/member?${query}`);
};

export const createMember = (body: Member) => {
    return axiosInstance.post<Member>('/api/staff/member', body);
};

export const createMemberPoint = (body: Member) => {
    return axiosInstance.post<Member>('/api/staff/member/point', body);
};

export const createMemberTransaction = (body: Member) => {
    return axiosInstance.post<Member>('/api/staff/member/coupon', body);
};

export const getSingleMember = (memberId: string) => {
    return axiosInstance.get<Member>(`/api/staff/member/${memberId}`);
};

export const updateMember = (memberId: string, body: Member) => {
    return axiosInstance.put<Member>(`/api/staff/member/${memberId}`, body);
};

export const deleteMember = (memberId: string, body: { reason: string }) => {
    return axiosInstance.delete<Member>(`/api/staff/member/${memberId}/delete`, {
        data: body,
    });
};

export const updateMemberStatus = (memberId: string, body: { status: boolean; reason: string }) => {
    return axiosInstance.put<Member>(`/api/staff/member/${memberId}/status`, body);
};

export const getMemberTreeStructure = (memberId: string) => {
    return axiosInstance.get<Member>(`/api/staff/member/${memberId}/tree-structure`);
};

export const getMemberChildren = (memberId: string) => {
    return axiosInstance.get<MemberChildren[]>(`/api/staff/member/${memberId}/children`);
};

export const updateMemberChildren = (memberId: string, body: MemberChildren[]) => {
    return axiosInstance.put<Member>(`/api/staff/member/${memberId}/children`, body);
};

export const getMemberCouponListByPagination = (query: string, memberId: string) => {
    return axiosInstance.get<PaginationResponse<Coupon>>(`/api/staff/member/${memberId}/coupon?${query}`);
};
