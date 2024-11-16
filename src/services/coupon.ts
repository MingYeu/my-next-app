import axiosInstance from './config';
import { PaginationResponse } from '@/types/pagination';
import { Coupon, CouponSeries } from '@/types/coupon';

// coupon series
export const getCouponSeriesListByPagination = (query: string) => {
    return axiosInstance.get<PaginationResponse<CouponSeries>>(`/api/staff/coupon/series?${query}`);
};

export const createCouponSeries = (body: Coupon) => {
    return axiosInstance.post<CouponSeries>('/api/staff/coupon/series', body);
};

export const getSingleCouponSeries = (couponId: string) => {
    return axiosInstance.get<CouponSeries>(`/api/staff/coupon/series/${couponId}`);
};

export const updateCouponSeries = (couponSeriesId: string, body: CouponSeries) => {
    return axiosInstance.put<CouponSeries>(`/api/staff/coupon/series/${couponSeriesId}`, body);
};

export const updateCouponSeriesStatus = (couponSeriesId: string, body: { status: boolean; reason: string }) => {
    return axiosInstance.put<CouponSeries>(`/api/staff/coupon/series/${couponSeriesId}/status`, body);
};

export const deleteCouponSeries = (couponSeriesId: string, body: { reason: string }) => {
    return axiosInstance.delete<CouponSeries>(`/api/staff/coupon/series/${couponSeriesId}/delete`, {
        data: body,
    });
};

// coupon
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
