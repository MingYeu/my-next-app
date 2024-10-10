import axiosInstance from './config';

interface ActivityLogMeta {
    nextCursor: string;
    count: number;
}

export const fetchActivityLog = (query: any) => {
    return axiosInstance.get<any>(`/api/staff/log?${query}`);
};
