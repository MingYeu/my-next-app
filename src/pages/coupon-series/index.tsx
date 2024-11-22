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
import AddCouponSeriesModalProps from '@/components/coupon/modals/AddCouponSeries';
import Toast from '@/lib/Toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import usePagination from '@/hooks/usePagination';
import { SortOrder } from '@/types/pagination';
import { Coupon, CouponSeries } from '@/types/coupon';
import { createCoupon, createCouponSeries, getCouponListByPagination, getCouponSeriesListByPagination } from '@/services/coupon';
import errorFormatter from '@/lib/errorFormatter';
import { PermissionContext } from '@/providers/RoleContext';
import CouponSeriesFilterDrawer from '@/components/coupon/modals/FilterCouponSeries';

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
        sortField: 'name',
        sortOrder: SortOrder.ASC,
    });
    const [selectedColumn, setSelectedColumn] = useState<string[]>(['name', 'cost', 'count', 'alreadyUsed', 'remarks', 'active']);
    const [addCouponModalOpen, setAddCouponModalOpen] = useState<boolean>(false);

    // Query
    const couponSeriesQuery = useQuery({
        queryKey: ['couponSeries', 'pagination', pagination],
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

            const res = await getCouponSeriesListByPagination(query);

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

    const createCouponSeriesMutation = useMutation({
        mutationFn: async (values: Coupon) => {
            createCouponToast.loading(t('messages:loading.creatingCouponSeries'));
            const res = await createCouponSeries(values);

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            createCouponToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            createCouponToast.update('success', t('messages:success.couponSeriesCreated'));
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
    const paginationOnChange: TableProps<CouponSeries>['onChange'] = (tablePagination, filter, sorter) => {
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
            createCouponSeriesMutation.mutate(values);
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
            label: t('coupon-series'),
            path: '/coupon-series',
        },
    ];

    const seoConfig = {
        title: t('coupon'),
    };

    const columnOptions = [
        {
            label: t('name'),
            value: 'name',
        },
        {
            label: t('cost'),
            value: 'cost',
        },
        {
            label: t('remarks'),
            value: 'remarks',
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
            dataIndex: 'name',
            title: t('Name'),
            render: (name: string, couponsSeries: CouponSeries) => {
                return (
                    <Link href={`/coupon-series/${couponsSeries.id}`} className="font-bold">
                        {name}
                    </Link>
                );
            },
        },
        ...conditionalReturn(selectedColumn.includes('cost'), [
            {
                dataIndex: 'cost',
                title: t('Cost'),
                render: (cost: number) => {
                    return `RM ${cost}`;
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('count'), [
            {
                dataIndex: 'count',
                title: t('Publish (Number)'),
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('alreadyUsed'), [
            {
                dataIndex: 'alreadyUsed',
                title: t('Already Used'),
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('remarks'), [
            {
                dataIndex: 'remarks',
                title: t('Remarks'),
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
    ] as TableColumnProps<CouponSeries>[];

    return (
        <Layout staff={staff} activeMenu={['couponSeries']} breadCrumbItems={breadCrumbItems} seoConfig={seoConfig}>
            <div className="flex justify-between">
                <div className="flex">
                    <div className="w-1/2">
                        <CouponSeriesFilterDrawer
                            filterCouponForm={filterCouponForm}
                            onReset={onResetHandler}
                            onSearch={onSearchHandler}
                            loading={couponSeriesQuery.isFetching}
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
                        {t('addCouponSeries')}
                    </Button>
                )}
            </div>
            <div className="table_container">
                <div className="flex justify-end config_container">
                    <ColumnSelector options={columnOptions} column={selectedColumn} setColumn={setSelectedColumn} />
                </div>
                <Table
                    columns={columns}
                    dataSource={couponSeriesQuery.data}
                    loading={couponSeriesQuery.isFetching}
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
            <AddCouponSeriesModalProps
                loading={createCouponSeriesMutation.isLoading}
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
