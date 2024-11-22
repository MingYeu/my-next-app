export interface Package {
    id: string;
    name: string;
    cost: number;
    description: string;
    period: number;
    active?: boolean;
    // member_package: Member_Package[];
}
