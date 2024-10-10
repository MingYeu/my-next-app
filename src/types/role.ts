import { PaginationResponse } from './pagination';

export interface Permissions {
    STAFF_VIEW: boolean;
    STAFF_CREATE: boolean;
    STAFF_UPDATE: boolean;
    STAFF_DELETE: boolean;
    ROLE_VIEW: boolean;
    ROLE_CREATE: boolean;
    ROLE_UPDATE: boolean;
    ROLE_DELETE: boolean;
    MEMBER_CREATE: boolean;
    MEMBER_VIEW: boolean;
    MEMBER_UPDATE: boolean;
    MEMBER_DELETE: boolean;
    PACKAGE_CREATE: boolean;
    PACKAGE_VIEW: boolean;
    PACKAGE_UPDATE: boolean;
    PACKAGE_DELETE: boolean;
    DATABASE_VIEW: Boolean;
    ACTIVITY_LOG: boolean;
    SITE_SETTING: Boolean;
}

export interface Role extends Permissions {
    id: string;
    name: string;
}

export type RolePaginationResponse = PaginationResponse<Role>;
