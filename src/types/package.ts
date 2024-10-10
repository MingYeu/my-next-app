import { ActivityLog } from './activityLog';
import { Member_Package } from './member';
import { Role } from './role';

export interface Package {
    id: string;
    name: string;
    cost: number;
    description: string;
    startDate: string | null;
    endDate: string;
    active: boolean;
    // member_package: Member_Package[];
}
