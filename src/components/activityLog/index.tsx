import { useInfiniteQuery } from '@tanstack/react-query';
import Container from './Container';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import { useState } from 'react';
import queryString from 'query-string';
import { fetchActivityLog } from '@/services/activityLog';

interface ActivityLogProps {
    target: string;
}

interface ActivityLogMeta {
    nextCursor: string;
    count: number;
}

const ActivityLogComponent: React.FC<ActivityLogProps> = ({ target }) => {
    const { t } = useTranslation(['activityLog', 'common']);

    const [nextCursor, setNextCursor] = useState<string | null>(null);

    const fetchLog = async ({ pageParam = 1 }) => {
        const query = queryString.stringify({
            targetId: target,
            page: pageParam,
            cursor: !nextCursor ? undefined : nextCursor,
        });
        const res = await fetchActivityLog(query);

        setNextCursor(res.data.nextCursor);

        const hasNext = pageParam * 10 < res.data.count;
        return {
            nextPage: hasNext ? pageParam + 1 : undefined,
            data: res.data,
        };
    };

    const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ['activityLog', target],
        queryFn: fetchLog,
        getNextPageParam: (prevPage) => prevPage.nextPage,
        onError: (error: Error) => {
            toast.error(t(error.message));
        },
    });

    return <Container dataSource={data?.pages} isFetchingNextPage={isFetchingNextPage} fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} />;
};

export default ActivityLogComponent;
