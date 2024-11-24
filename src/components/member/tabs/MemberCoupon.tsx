import { useQuery } from '@tanstack/react-query';
import { Button, Form, Spin, Table, TableColumnProps, TableProps, Tree } from 'antd';
import { useTranslation } from 'next-i18next';
import 'react-phone-input-2/lib/style.css';
import { AxiosErrorResponse } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import { toast } from 'react-toastify';
import { getMemberCouponListByPagination } from '@/services/member';
import usePagination from '@/hooks/usePagination';
import { SortOrder } from '@/types/pagination';
import queryString from 'query-string';
import { useContext, useState } from 'react';
import { PermissionContext } from '@/providers/RoleContext';
import FilterDrawer from '@/components/coupon/modals/Filter';
import ColumnSelector from '@/components/modals/ColumnSelector';
import conditionalReturn from '@/lib/conditionalReturn';
import Link from 'next/link';
import { Coupon } from '@/types/coupon';
import dayjs from 'dayjs';
import CouponStatus from '@/components/Status';

interface MemberCouponProps {
    memberId: string;
}

const MemberCoupon: React.FC<MemberCouponProps> = ({ memberId }) => {
    const { t } = useTranslation(['member', 'common']);
    const { permissions } = useContext(PermissionContext);

    const [selectedColumn, setSelectedColumn] = useState<string[]>(['code', 'cost', 'startDate', 'endDate', 'memberName', 'useName', 'active']);

    // Form Instances
    const [filterCouponForm] = Form.useForm();

    // States
    const [pagination, setPagination] = usePagination({
        sortField: 'code',
        sortOrder: SortOrder.ASC,
    });

    // Functions
    const paginationOnChange: TableProps<Coupon>['onChange'] = (tablePagination, filter, sorter) => {
        const sorting: any = sorter;
        setPagination((prev: any) => {
            return {
                ...prev,
                page: tablePagination.current,
                pageSize: tablePagination.pageSize,
                fetch: true,
            };
        });
    };

    // Query
    const memberCouponQuery = useQuery({
        queryKey: ['member', 'coupon', 'pagination', pagination],
        enabled: pagination.fetch,
        keepPreviousData: true,
        queryFn: async () => {
            let searchedValue = filterCouponForm.getFieldsValue();

            const query = queryString.stringify({
                ...searchedValue,
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                sortField: pagination.sortField,
                sortOrder: pagination.sortOrder,
            });

            const res = await getMemberCouponListByPagination(query, memberId);

            setPagination((prevValue) => {
                return {
                    ...prevValue,
                    page: res.data?.page,
                    total: res.data?.total,
                    fetch: false,
                };
            });

            return res.data?.rows;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const onResetHandler = () => {
        filterCouponForm.resetFields();
        setPagination((prev) => {
            return {
                ...prev,
                fetch: true,
            };
        });
    };

    const onSearchHandler = () => {
        setPagination((prev) => {
            return {
                ...prev,
                fetch: true,
            };
        });
    };

    const columnOptions = [
        {
            label: t('Code'),
            value: 'code',
        },
        {
            label: t('Cost'),
            value: 'cost',
        },
        {
            label: t('Start Date'),
            value: 'startDate',
        },
        {
            label: t('End Date'),
            value: 'endDate',
        },
        {
            label: t('Member Name'),
            value: 'memberName',
        },
        {
            label: t('Use Name'),
            value: 'useName',
        },
        {
            label: t('Active'),
            value: 'active',
        },
        {
            label: t('Created At'),
            value: 'createdAt',
        },
        {
            label: t('Updated At'),
            value: 'updatedAt',
        },
    ];

    const columns = [
        {
            dataIndex: 'code',
            title: t('Code'),
            render: (code: string, coupons: Coupon) => {
                return (
                    <Link href={`/coupon/${coupons.id}`} className="font-bold">
                        {code}
                    </Link>
                );
            },
        },
        ...conditionalReturn(selectedColumn.includes('cost'), [
            {
                dataIndex: 'cost',
                title: t('Cost'),
                render: (cost: number) => {
                    return cost ? `RM ${cost}` : 0;
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('startDate'), [
            {
                dataIndex: 'startDate',
                title: t('Start Date'),
                render: (startDate: string) => {
                    return startDate ? dayjs(startDate).format('D MMM YYYY') : '-';
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('endDate'), [
            {
                dataIndex: 'endDate',
                title: t('End Date'),
                render: (endDate: string) => {
                    return endDate ? dayjs(endDate).format('D MMM YYYY') : '-';
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('memberName'), [
            {
                dataIndex: 'memberName',
                title: t('Owner'),
                render: (memberName: string) => {
                    return memberName;
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('useName'), [
            {
                dataIndex: 'useName',
                title: t('Use By'),
                render: (useName: string) => {
                    return useName;
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('active'), [
            {
                dataIndex: 'active',
                title: t('Active'),
                render: (_: unknown, coupons: Coupon) => {
                    return <CouponStatus coupons={coupons} />;
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('createdAt'), [
            {
                title: t('common:createdAt'),
                dataIndex: 'createdAt',
                width: 150,
                sorter: true,
                render: (createdAt: string) => {
                    return createdAt !== null ? dayjs(createdAt).format('D MMM YYYY, hh:mm a') : '-';
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('updatedAt'), [
            {
                title: t('common:updatedAt'),
                dataIndex: 'updatedAt',
                width: 150,
                sorter: true,
                render: (updatedAt: string) => {
                    return updatedAt !== null ? dayjs(updatedAt).format('D MMM YYYY, hh:mm a') : '-';
                },
            },
        ]),
    ] as TableColumnProps<Coupon>[];

    return (
        <Spin spinning={memberCouponQuery.isLoading}>
            <div className="flex justify-between">
                <div className="flex">
                    <div className="w-1/2">
                        <FilterDrawer
                            filterCouponForm={filterCouponForm}
                            onReset={onResetHandler}
                            onSearch={onSearchHandler}
                            loading={memberCouponQuery.isFetching}
                        />
                    </div>
                    <div className="w-1/3">
                        <Button type="link" onClick={onResetHandler}>
                            {t('Reset Filter')}
                        </Button>
                    </div>
                </div>
                {/* {permissions.MEMBER_CREATE && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddCouponModalOpen(true)}>
                        {t('Add Coupon')}
                    </Button>
                )} */}
            </div>
            <div className="table_container">
                <div className="flex justify-end config_container">
                    <ColumnSelector options={columnOptions} column={selectedColumn} setColumn={setSelectedColumn} />
                </div>
                <Table
                    columns={columns}
                    dataSource={memberCouponQuery.data}
                    loading={memberCouponQuery.isFetching}
                    rowKey={(record) => record.id}
                    scroll={{ x: 1000 }}
                    onChange={paginationOnChange}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.pageSize,
                        defaultPageSize: 1,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 25, 50, 100],
                        showTotal: (total, range) =>
                            t('common:pagination', {
                                range0: range[0],
                                range1: range[1],
                                total: total,
                            }),
                        total: pagination.total,
                    }}
                />
            </div>
        </Spin>
    );
};

export default MemberCoupon;
