import { Children } from '@/types/children';
import axiosInstance from './config';
import { PaginationResponse } from '@/types/pagination';

export const getChildrenListByPagination = (query: string) => {
    return axiosInstance.get<PaginationResponse<Children>>(`/api/staff/children?${query}`);
};
