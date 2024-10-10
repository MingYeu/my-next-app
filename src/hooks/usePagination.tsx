import { PaginationInit, PaginationParams } from '@/types/pagination';
import { useState } from 'react';

const usePagination = (init: PaginationInit) => {
    const paginationState = useState<PaginationParams>({
        page: 1,
        pageSize: 10,
        total: 0,
        fetch: true,
        ...init,
    });

    return paginationState;
};

export default usePagination;
