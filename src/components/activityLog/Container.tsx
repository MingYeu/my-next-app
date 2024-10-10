import { ActivityLogView } from '@/types/activityLog';
import { Button, Divider, Empty, Tag } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ActivityProps {
    dataSource: { nextPage: number | undefined; data: ActivityLogView[] }[] | undefined;
    fetchNextPage: any;
    hasNextPage: boolean | undefined;
    isFetchingNextPage: boolean;
}

const Activity: React.FC<ActivityProps> = ({ dataSource, hasNextPage, isFetchingNextPage, fetchNextPage }) => {
    const { t } = useTranslation(['APIMessage', 'common']);
    const ItemRendering = (item: ActivityLogView) => {
        dayjs.extend(relativeTime);
        let tagColor;

        if (item.action === 'UPDATE') {
            tagColor = 'blue';
        } else if (item.action === 'DELETE') {
            tagColor = 'red';
        } else if (item.action === 'CREATE') {
            tagColor = 'green';
        } else if (item.action === 'RESTORE') {
            tagColor = 'orange';
        } else {
            tagColor = 'default';
        }
        {
            item.description;
        }

        const matches = item.description.match(/\[(.*?)\]/);

        // Create an array to store the extracted values
        const list: string[] = [];
        let title = '';

        if (matches && matches[1]) {
            // Split the matched string using a comma
            const extractedText = matches[1];
            const splitValues = extractedText.split(',');

            title = item.description.replace(matches[0], '').trim();
            // Populate the 'list' array with the split values
            splitValues.forEach((item) => {
                list.push(item.trim()); // Trim to remove extra whitespace
            });
        }

        return (
            <div key={item.id}>
                <div className="flex flex-col w-full">
                    <div className="flex items-center justify-start w-full mb-3 fle-col">
                        <Tag color={tagColor}>{item.action}</Tag>
                        <h2 className="my-auto text-sm font-semibold">{item.executorName}</h2>
                    </div>
                    <div className="mb-2">
                        {list.length === 0 ? (
                            t(item.description)
                        ) : (
                            <>
                                {title}
                                <ul className="ml-4">
                                    {list.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                    {item.reason && (
                        <div className="p-3 mb-2 italic bg-gray-100 rounded-lg">
                            <p className="m-0">{t(item.reason)}</p>
                        </div>
                    )}
                    <div className="flex justify-end group">
                        <span className="text-xs text-gray-400 group-hover:hidden">{dayjs(item.createdAt).fromNow()}</span>
                        <span className="hidden text-xs text-gray-400 group-hover:block">{dayjs(item.createdAt).format('D MMM YYYY, HH:mm a')}</span>
                    </div>
                </div>
                <Divider />
            </div>
        );
    };

    const LoadMore =
        !hasNextPage && !isFetchingNextPage ? null : (
            <div
                style={{
                    textAlign: 'center',
                    marginTop: 12,
                    height: 32,
                    lineHeight: '32px',
                }}
            >
                <Button loading={isFetchingNextPage} disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                    {isFetchingNextPage ? 'Loading more' : 'Load more'}
                </Button>
            </div>
        );

    return dataSource ? (
        <div>
            {dataSource.map((item: any) => {
                return (item?.data.data ?? []).map((item: any) => {
                    return ItemRendering(item);
                });
            })}
            {LoadMore}
        </div>
    ) : (
        <Empty />
    );
};

export default Activity;
