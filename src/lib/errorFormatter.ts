import { AxiosErrorResponse } from '../types';
const errorFormatter = (error: AxiosErrorResponse & Error) => {
    return error.response?.data?.message || error.message;
};

export default errorFormatter;
