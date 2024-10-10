export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export interface PaginationParams {
    page: number;
    pageSize: number;
    total: number;
    sortField: string;
    sortOrder: SortOrder;
    fetch: boolean;
}

export interface PaginationResponse<T> {
    current: number;
    page: number;
    total: number;
    rows: T[];
}

// Create a type with 'sortField' and 'sortOrder' as required
export type RequiredSortParams = Required<Pick<PaginationParams, 'sortField' | 'sortOrder'>>;

// Create a type where the rest of the properties are optional
export type OptionalParams = Partial<Omit<PaginationParams, 'sortField' | 'sortOrder'>>;

// Combine the required sort parameters and optional parameters
export type PaginationInit = RequiredSortParams & OptionalParams;
