import axiosInstance from './config';
import { PaginationResponse } from '@/types/pagination';
import { Coupon } from '@/types/coupon';

export const getCouponListByPagination = (query: string) => {
    return axiosInstance.get<PaginationResponse<Coupon>>(`/api/staff/coupon?${query}`);
};

export const createCoupon = (body: Coupon) => {
    return axiosInstance.post<Coupon>('/api/staff/coupon', body);
};

export const getSingleCoupon = (couponId: string) => {
    return axiosInstance.get<Coupon>(`/api/staff/coupon/${couponId}`);
};

export const updateCoupon = (couponId: string, body: Coupon) => {
    return axiosInstance.put<Coupon>(`/api/staff/coupon/${couponId}`, body);
};

export const deleteCoupon = (couponId: string, body: { reason: string }) => {
    return axiosInstance.delete<Coupon>(`/api/staff/coupon/${couponId}/delete`, {
        data: body,
    });
};

export const updateCouponStatus = (couponId: string, body: { status: boolean; reason: string }) => {
    return axiosInstance.put<Coupon>(`/api/staff/coupon/${couponId}/status`, body);
};
