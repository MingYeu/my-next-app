import { ActivityLog } from './activityLog';
import { Member_Package } from './member';
import { Role } from './role';

export interface CouponSeries {
    id: string;
    name: string;
    remarks: string;
    active: boolean;
}

export interface Coupon {
    id: string;
    code: string;
    cost: number;
    type: string;
    description: string;
    startDate: string | null;
    endDate: string;
    active: boolean;
    // member_package: Member_Package[];
}
