import Layout from '@/components/layout';
import { authentication } from '@/lib/authentication';
import conditionalReturn from '@/lib/conditionalReturn';
import { AxiosErrorResponse, StaffPortalProps } from '@/types';
import dayjs from 'dayjs';
import { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useContext, useState } from 'react';
import CouponStatus from '@/components/Status';
import { Button, Form, Table, TableColumnProps, TableProps } from 'antd';
import FilterDrawer from '@/components/coupon/modals/Filter';
import { PlusOutlined } from '@ant-design/icons';
import ColumnSelector from '@/components/modals/ColumnSelector';
import AddCouponModal from '@/components/coupon/modals/AddCoupon';
import Toast from '@/lib/Toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import usePagination from '@/hooks/usePagination';
import { SortOrder } from '@/types/pagination';
import { Coupon } from '@/types/coupon';
import { createCoupon, getCouponListByPagination } from '@/services/coupon';
import errorFormatter from '@/lib/errorFormatter';
import { PermissionContext } from '@/providers/RoleContext';

const Index: NextPage<StaffPortalProps> = ({ staff }) => {
    const { t } = useTranslation(['coupon']);
    const queryClient = useQueryClient();
    const { permissions } = useContext(PermissionContext);

    // Form Instances
    const [filterCouponForm] = Form.useForm();
    const [addCouponForm] = Form.useForm();

    // Messages
    const createCouponToast = new Toast('createCoupon');

    // States
    const [pagination, setPagination] = usePagination({
        sortField: 'code',
        sortOrder: SortOrder.ASC,
    });
    const [selectedColumn, setSelectedColumn] = useState<string[]>(['code', 'cost', 'startDate', 'endDate', 'memberName', 'useName', 'active']);
    const [addCouponModalOpen, setAddCouponModalOpen] = useState<boolean>(false);

    // Query
    const couponQuery = useQuery({
        queryKey: ['coupon', 'pagination', pagination],
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

            const res = await getCouponListByPagination(query);

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

    const createCouponMutation = useMutation({
        mutationFn: async (values: Coupon) => {
            createCouponToast.loading(t('messages:loading.creatingCoupon'));
            const res = await createCoupon(values);

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            createCouponToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            createCouponToast.update('success', t('messages:success.couponCreated'));
            setAddCouponModalOpen(false);
            addCouponForm.resetFields();
            setPagination((prev: any) => {
                return {
                    ...prev,
                    fetch: true,
                };
            });

            // Disabled Coupon Caching
            queryClient.invalidateQueries(['coupon'], { exact: true });
        },
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

    const onCreateCouponHandler = () => {
        addCouponForm.validateFields().then((values) => {
            createCouponMutation.mutate(values);
        });
    };

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

    // Data Configurations
    const breadCrumbItems = [
        {
            label: t('coupon'),
            path: '/coupon',
        },
    ];

    const seoConfig = {
        title: t('coupon'),
    };

    const columnOptions = [
        {
            label: t('code'),
            value: 'code',
        },
        {
            label: t('cost'),
            value: 'cost',
        },
        {
            label: t('startDate'),
            value: 'startDate',
        },
        {
            label: t('endDate'),
            value: 'endDate',
        },
        {
            label: t('memberName'),
            value: 'memberName',
        },
        {
            label: t('useName'),
            value: 'useName',
        },
        {
            label: t('active'),
            value: 'active',
        },
        {
            label: t('createdAt'),
            value: 'createdAt',
        },
        {
            label: t('updatedAt'),
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
        <Layout staff={staff} activeMenu={['coupon']} breadCrumbItems={breadCrumbItems} seoConfig={seoConfig}>
            <div className="flex justify-between">
                <div className="flex">
                    <div className="w-1/2">
                        <FilterDrawer
                            filterCouponForm={filterCouponForm}
                            onReset={onResetHandler}
                            onSearch={onSearchHandler}
                            loading={couponQuery.isFetching}
                        />
                    </div>
                    <div className="w-1/3">
                        <Button type="link" onClick={onResetHandler}>
                            {t('resetFilter')}
                        </Button>
                    </div>
                </div>
                {permissions.MEMBER_CREATE && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddCouponModalOpen(true)}>
                        {t('addCoupon')}
                    </Button>
                )}
            </div>
            <div className="table_container">
                <div className="flex justify-end config_container">
                    <ColumnSelector options={columnOptions} column={selectedColumn} setColumn={setSelectedColumn} />
                </div>
                <Table
                    columns={columns}
                    dataSource={couponQuery.data}
                    loading={couponQuery.isFetching}
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
            <AddCouponModal
                loading={createCouponMutation.isLoading}
                form={addCouponForm}
                open={addCouponModalOpen}
                setOpen={setAddCouponModalOpen}
                onCreate={onCreateCouponHandler}
            />
        </Layout>
    );
};

export default Index;

export const getServerSideProps: GetServerSideProps = async ({ locale, req, resolvedUrl }) => {
    try {
        const authResponse = await authentication(req, 'MEMBER_VIEW');

        if (authResponse.unauthorized) {
            return {
                redirect: {
                    destination: `${locale === 'en-GB' ? '/' : `/${locale}/`}unauthorized`,
                    permanent: false,
                },
            };
        }

        return {
            props: {
                staff: authResponse,
                ...(await serverSideTranslations(locale as string, ['coupon', 'APIMessage', 'layout', 'common', 'messages'])),
            },
        };
    } catch (error) {
        return {
            redirect: {
                destination: `${locale === 'en-GB' ? '/' : `/${locale}`}?redirect=${resolvedUrl}`,
                permanent: false,
            },
        };
    }
};
