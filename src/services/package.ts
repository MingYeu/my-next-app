import axiosInstance from './config';
import { PaginationResponse } from '@/types/pagination';
import { Package } from '@/types/package';

export const getPackageListByPagination = (query: string) => {
    return axiosInstance.get<PaginationResponse<Package>>(`/api/staff/package?${query}`);
};

export const createPackage = (body: Package) => {
    return axiosInstance.post<Package>('/api/staff/package', body);
};

export const getSinglePackage = (packageId: string) => {
    return axiosInstance.get<Package>(`/api/staff/package/${packageId}`);
};

export const updatePackage = (packageId: string, body: Package) => {
    return axiosInstance.post<Package>(`/api/staff/package/${packageId}`, body);
};

export const updatePackagePassword = (packageId: string, body: { password: string; reason: string }) => {
    return axiosInstance.put<Package>(`/api/staff/package/${packageId}`, body);
};

export const deletePackage = (packageId: string, body: { reason: string }) => {
    return axiosInstance.post<Package>(`/api/staff/package/${packageId}/delete`, {
        data: body,
    });
};

export const restorePackage = (packageId: string) => {
    return axiosInstance.put<Package>(`/api/staff/package`, { packageId });
};

export const updatePackageStatus = (packageId: string, body: { status: boolean; reason: string }) => {
    return axiosInstance.post<Package>(`/api/staff/package/${packageId}/status`, body);
};
