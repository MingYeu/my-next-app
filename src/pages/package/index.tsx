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
import PackageStatus from '@/components/Status';
import { Button, Form, Table, TableColumnProps, TableProps } from 'antd';
import FilterDrawer from '@/components/package/modals/Filter';
import { PlusOutlined } from '@ant-design/icons';
import ColumnSelector from '@/components/modals/ColumnSelector';
import AddPackageModal from '@/components/package/modals/AddPackage';
import Toast from '@/lib/Toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import usePagination from '@/hooks/usePagination';
import { SortOrder } from '@/types/pagination';
import { Package } from '@/types/package';
import { createPackage, getPackageListByPagination } from '@/services/package';
import errorFormatter from '@/lib/errorFormatter';
import { PermissionContext } from '@/providers/RoleContext';

const Index: NextPage<StaffPortalProps> = ({ staff }) => {
    const { t } = useTranslation(['package']);
    const queryClient = useQueryClient();
    const { permissions } = useContext(PermissionContext);

    // Form Instances
    const [filterPackageForm] = Form.useForm();
    const [addPackageForm] = Form.useForm();

    // Messages
    const createPackageToast = new Toast('createPackage');

    // States
    const [pagination, setPagination] = usePagination({
        sortField: 'name',
        sortOrder: SortOrder.ASC,
    });
    const [selectedColumn, setSelectedColumn] = useState<string[]>(['name', 'cost', 'point', 'period', 'active']);
    const [addPackageModalOpen, setAddPackageModalOpen] = useState<boolean>(false);

    // Query
    const packageQuery = useQuery({
        queryKey: ['package', 'pagination', pagination],
        enabled: pagination.fetch,
        keepPreviousData: true,
        queryFn: async () => {
            let searchedValue = filterPackageForm.getFieldsValue();

            const query = queryString.stringify({
                ...searchedValue,
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                sortField: pagination.sortField,
                sortOrder: pagination.sortOrder,
            });

            const res = await getPackageListByPagination(query);

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

    const createPackageMutation = useMutation({
        mutationFn: async (values: Package) => {
            createPackageToast.loading(t('messages:loading.creatingPackage'));
            const res = await createPackage(values);

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            createPackageToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            createPackageToast.update('success', t('messages:success.packageCreated'));
            setAddPackageModalOpen(false);
            addPackageForm.resetFields();
            setPagination((prev: any) => {
                return {
                    ...prev,
                    fetch: true,
                };
            });

            // Disabled Package Caching
            queryClient.invalidateQueries(['package'], { exact: true });
        },
    });

    // Functions
    const paginationOnChange: TableProps<Package>['onChange'] = (tablePagination, filter, sorter) => {
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

    const onCreatePackageHandler = () => {
        addPackageForm.validateFields().then((values) => {
            createPackageMutation.mutate(values);
        });
    };

    const onResetHandler = () => {
        filterPackageForm.resetFields();
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
            label: t('package'),
            path: '/package',
        },
    ];

    const seoConfig = {
        title: t('package'),
    };

    const columnOptions = [
        {
            label: t('Name'),
            value: 'name',
        },
        {
            label: t('Cost'),
            value: 'cost',
        },
        {
            label: t('Point'),
            value: 'point',
        },
        {
            label: t('Period'),
            value: 'period',
        },
        {
            label: t('active'),
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
            dataIndex: 'name',
            title: t('name'),
            render: (name: string, packages: Package) => {
                return (
                    <Link href={`/package/${packages.id}`} className="font-bold">
                        {name}
                    </Link>
                );
            },
        },
        ...conditionalReturn(selectedColumn.includes('cost'), [
            {
                dataIndex: 'cost',
                title: t('cost'),
                render: (cost: number) => {
                    return cost ? `RM ${cost}` : 0;
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('point'), [
            {
                dataIndex: 'point',
                title: t('Point'),
                render: (point: number) => {
                    return point ? `${point}` : 0;
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('period'), [
            {
                dataIndex: 'period',
                title: t('Period'),
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('active'), [
            {
                dataIndex: 'active',
                title: t('Active'),
                render: (_: unknown, packages: Package) => {
                    return <PackageStatus packages={packages} />;
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
    ] as TableColumnProps<Package>[];

    return (
        <Layout staff={staff} activeMenu={['package']} activeDropdown={['promoteManagement']} breadCrumbItems={breadCrumbItems} seoConfig={seoConfig}>
            <div className="flex justify-between">
                <div className="flex">
                    <div className="w-1/2">
                        <FilterDrawer
                            filterPackageForm={filterPackageForm}
                            onReset={onResetHandler}
                            onSearch={onSearchHandler}
                            loading={packageQuery.isFetching}
                        />
                    </div>
                    <div className="w-1/3">
                        <Button type="link" onClick={onResetHandler}>
                            {t('Reset Filter')}
                        </Button>
                    </div>
                </div>
                {permissions.MEMBER_CREATE && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddPackageModalOpen(true)}>
                        {t('addPackage')}
                    </Button>
                )}
            </div>
            <div className="table_container">
                <div className="flex justify-end config_container">
                    <ColumnSelector options={columnOptions} column={selectedColumn} setColumn={setSelectedColumn} />
                </div>
                <Table
                    columns={columns}
                    dataSource={packageQuery.data}
                    loading={packageQuery.isFetching}
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
            <AddPackageModal
                loading={createPackageMutation.isLoading}
                form={addPackageForm}
                open={addPackageModalOpen}
                setOpen={setAddPackageModalOpen}
                onCreate={onCreatePackageHandler}
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
                ...(await serverSideTranslations(locale as string, ['package', 'APIMessage', 'layout', 'common', 'messages'])),
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
