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
import StaffStatus from '@/components/Status';
import { Button, Form, Table, TableColumnProps, TableProps } from 'antd';
import FilterDrawer from '@/components/staff/modals/Filter';
import { PlusOutlined } from '@ant-design/icons';
import ColumnSelector from '@/components/modals/ColumnSelector';
// import AddStaffModal from '@/components/staff/modals/AddStaff';
import Toast from '@/lib/Toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import usePagination from '@/hooks/usePagination';
import { SortOrder } from '@/types/pagination';
import { Staff } from '@/types/staff';
import { createStaff, getStaffListByPagination } from '@/services/staff';
import errorFormatter from '@/lib/errorFormatter';
import { PermissionContext } from '@/providers/RoleContext';
import { pad } from '@/lib/helperFunctions';

const Index: NextPage<StaffPortalProps> = ({ staff }) => {
    const { t } = useTranslation(['staff']);
    const queryClient = useQueryClient();
    const { permissions } = useContext(PermissionContext);
    // Form Instances
    const [filterStaffForm] = Form.useForm();
    const [addStaffForm] = Form.useForm();

    // Messages
    const createStaffToast = new Toast('createStaff');

    // States
    const [pagination, setPagination] = usePagination({
        sortField: 'email',
        sortOrder: SortOrder.ASC,
    });
    const [selectedColumn, setSelectedColumn] = useState<string[]>(['email', 'active', 'lastActive']);
    // const [addStaffModalOpen, setAddStaffModalOpen] = useState<boolean>(false);

    // Query
    const staffQuery = useQuery({
        queryKey: ['staff', 'pagination', pagination],
        enabled: pagination.fetch,
        keepPreviousData: true,
        queryFn: async () => {
            let searchedValue = filterStaffForm.getFieldsValue();

            const query = queryString.stringify({
                ...searchedValue,
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                sortField: pagination.sortField,
                sortOrder: pagination.sortOrder,
            });

            const res = await getStaffListByPagination(query);

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

    // const createStaffMutation = useMutation({
    //     mutationFn: async (values: Staff) => {
    //         createStaffToast.loading(t('messages:loading.creatingStaff'));
    //         const res = await createStaff(values);

    //         return res.data;
    //     },
    //     onError: (err: AxiosErrorResponse & Error) => {
    //         createStaffToast.update('error', t(errorFormatter(err)));
    //     },
    //     onSuccess: () => {
    //         createStaffToast.update('success', t('messages:success.staffCreated'));
    //         setAddStaffModalOpen(false);
    //         addStaffForm.resetFields();
    //         setPagination((prev: any) => {
    //             return {
    //                 ...prev,
    //                 fetch: true,
    //             };
    //         });

    //         // Disabled Staff Caching
    //         queryClient.invalidateQueries(['staff'], { exact: true });
    //     },
    // });

    // Functions
    const paginationOnChange: TableProps<Staff>['onChange'] = (tablePagination, filter, sorter) => {
        const sorting: any = sorter;
        setPagination((prev: any) => {
            return {
                ...prev,
                page: tablePagination.current,
                pageSize: tablePagination.pageSize,
                sortField: sorting?.field ?? pagination?.sortField,
                sortOrder: sorting.order == 'ascend' ? SortOrder.ASC : !sorting.order ? prev.sortOrder : SortOrder.DESC,
                fetch: true,
            };
        });
    };

    // const onCreateStaffHandler = () => {
    //     addStaffForm.validateFields().then((values) => {
    //         createStaffMutation.mutate(values);
    //     });
    // };

    const onResetHandler = () => {
        filterStaffForm.resetFields();
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
            label: t('staff'),
            path: '/staff',
        },
    ];

    const seoConfig = {
        title: t('staff'),
    };

    const columnOptions = [
        {
            label: t('englishName'),
            value: 'englishName',
        },
        {
            label: t('chineseName'),
            value: 'chineseName',
        },
        {
            label: t('dateOfBirth'),
            value: 'dateOfBirth',
        },
        {
            label: t('nationality'),
            value: 'nationality',
        },
        {
            label: t('joinDate'),
            value: 'joinDate',
        },
        {
            label: t('position'),
            value: 'position',
        },
        {
            label: t('designation'),
            value: 'designation',
        },
        {
            label: t('directLine'),
            value: 'directLine',
        },
        {
            label: t('phoneNumber'),
            value: 'phoneNumber',
        },
        {
            label: t('email'),
            value: 'email',
        },
        {
            label: t('address'),
            value: 'address',
        },
        {
            label: t('active'),
            value: 'active',
        },
        {
            label: t('lastActive'),
            value: 'lastActive',
        },
        {
            label: t('common:createdAt'),
            value: 'createdAt',
        },
        {
            label: t('common:updatedAt'),
            value: 'updatedAt',
        },
    ];

    const columns = [
        {
            dataIndex: 'code',
            title: t('code'),
            render: (code: string, staff: Staff) => {
                return (
                    <Link href={`/staff/${staff.id}`} className="font-bold">
                        {code}
                    </Link>
                );
            },
        },
        ...conditionalReturn(selectedColumn.includes('englishName'), [
            {
                dataIndex: 'englishName',
                title: t('englishName'),
                render: (englishName: string) => englishName ?? '-',
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('chineseName'), [
            {
                dataIndex: 'chineseName',
                title: t('chineseName'),
                render: (chineseName: string) => chineseName ?? '-',
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('dateOfBirth'), [
            {
                dataIndex: 'dateOfBirth',
                title: t('dateOfBirth'),
                render: (dateOfBirth: string) => {
                    return dayjs(dateOfBirth).format('D MMM YYYY');
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('nationality'), [
            {
                dataIndex: 'nationality',
                title: t('nationality'),
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('joinDate'), [
            {
                dataIndex: 'joinDate',
                title: t('joinDate'),
                render: (joinDate: string) => {
                    return dayjs(joinDate).format('D MMM YYYY');
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('designation'), [
            {
                dataIndex: 'designation',
                title: t('designation'),
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('directLine'), [
            {
                dataIndex: 'directLine',
                title: t('directLine'),
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('phoneNumber'), [
            {
                dataIndex: 'phoneNumber',
                title: t('phoneNumber'),
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('email'), [
            {
                dataIndex: 'email',
                title: t('email'),
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('address'), [
            {
                dataIndex: 'address',
                title: t('address'),
                render: (_: unknown, staff: Staff) => {
                    return staff.address1 + ' ' + staff.address2 + ' ' + staff.address3;
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('active'), [
            {
                dataIndex: 'active',
                title: t('active'),
                render: (active: boolean, staff: Staff) => {
                    return <StaffStatus user={staff} />;
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('lastActive'), [
            {
                title: t('lastActive'),
                dataIndex: 'lastActive',
                width: 150,
                sorter: true,
                render: (lastActive: string) => {
                    return lastActive !== null ? dayjs(lastActive).format('D MMM YYYY, hh:mm a') : '';
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
                    return createdAt !== null ? dayjs(createdAt).format('D MMM YYYY, hh:mm a') : '';
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
                    return updatedAt !== null ? dayjs(updatedAt).format('D MMM YYYY, hh:mm a') : '';
                },
            },
        ]),
    ] as TableColumnProps<Staff>[];

    return (
        <Layout staff={staff} activeMenu={['staff']} activeDropdown={['userManagement']} breadCrumbItems={breadCrumbItems} seoConfig={seoConfig}>
            <div className="flex justify-between">
                <div className="flex">
                    <div className="w-1/2">
                        <FilterDrawer
                            filterStaffForm={filterStaffForm}
                            onReset={onResetHandler}
                            onSearch={onSearchHandler}
                            loading={staffQuery.isFetching}
                        />
                    </div>
                    <div className="w-1/3">
                        <Button type="link" onClick={onResetHandler}>
                            {t('resetFilter')}
                        </Button>
                    </div>
                </div>
                {/* {permissions.STAFF_CREATE && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddStaffModalOpen(true)}>
                        {t('addStaff')}
                    </Button>
                )} */}
            </div>
            <div className="table_container">
                <div className="flex justify-end config_container">
                    <ColumnSelector options={columnOptions} column={selectedColumn} setColumn={setSelectedColumn} />
                </div>
                <Table
                    columns={columns}
                    dataSource={staffQuery.data}
                    loading={staffQuery.isFetching}
                    rowKey={(record) => record.id}
                    scroll={{ x: 1000 }}
                    onChange={paginationOnChange}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.pageSize,
                        defaultPageSize: 1,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 25, 50, 100],
                        showTotal: (total, range) => t('common:pagination', { range0: range[0], range1: range[1], total: total }),
                        total: pagination.total,
                    }}
                />
            </div>
            {/* <AddStaffModal
                loading={createStaffMutation.isLoading}
                form={addStaffForm}
                open={addStaffModalOpen}
                setOpen={setAddStaffModalOpen}
                onCreate={onCreateStaffHandler}
            /> */}
        </Layout>
    );
};

export default Index;

export const getServerSideProps: GetServerSideProps = async ({ locale, req, resolvedUrl }) => {
    try {
        const authResponse = await authentication(req, 'STAFF_VIEW');

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
                ...(await serverSideTranslations(locale as string, ['staff', 'APIMessage', 'layout', 'common', 'messages'])),
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
