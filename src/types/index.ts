import { AxiosError } from 'axios';
import { Staff } from './staff';

export type Locale = 'en-GB' | 'zh-HK' | 'zh-CN';

export interface BreadCrumbItem {
    label: string;
    path: string;
}

export interface StaffPortalProps {
    staff: Staff;
}

export type AxiosErrorResponse = AxiosError<{
    message: string;
    status: number;
}>;

export enum Gender {
    'Male',
    'Female',
}

// export type MediaResponse = {
//     mediaId: string;
//     name: string;
//     new?: boolean;
//     url: string;
//     status: string;
// };

// export type UploadMediaResponse = {
//     uid: string;
//     name: string;
//     url: string;
//     status: string;
//     response?: any;
// };

// export type MediaAPIResponse = {
//     id: string;
//     name: string;
//     key: string;
//     type: 'staff' | 'tutor' | 'student';
// };

export type LoginBody = {
    code: string;
    password: string;
};

export type Dashboard = {
    // courseManagement: {
    //     course: number;
    //     subject: number;
    //     assignment: number;
    //     assignmentApply: number;
    // };
    userManagement: {
        staff: number;
        member: number;
        // student: number;
    };
    // paymentInfo: PaymentInfo;
};

// export type PaymentInfo = {
//     paymentPending: {
//         count: number;
//         amount: number;
//     };
//     invoicePending: {
//         count: number;
//         amount: number;
//     };
// };
