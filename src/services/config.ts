import { API_URL } from '@/config';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// export const uploadInstance = axios.create({
//     baseURL: API_URL,
//     headers: {
//         'Content-Type': 'multipart/form-data',
//     },
//     withCredentials: true,
// });

export default axiosInstance;
