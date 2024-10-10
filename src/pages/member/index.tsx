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
import MemberStatus from '@/components/Status';
import { Button, Form, Table, TableColumnProps, TableProps } from 'antd';
import FilterDrawer from '@/components/member/modals/Filter';
import { PlusOutlined } from '@ant-design/icons';
import ColumnSelector from '@/components/modals/ColumnSelector';
import AddTutorModal from '@/components/member/modals/AddMember';
import Toast from '@/lib/Toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import usePagination from '@/hooks/usePagination';
import { SortOrder } from '@/types/pagination';
import { Member } from '@/types/member';
import { createMember, getMemberListByPagination } from '@/services/member';
import errorFormatter from '@/lib/errorFormatter';
import { PermissionContext } from '@/providers/RoleContext';

const Index: NextPage<StaffPortalProps> = ({ staff }) => {
    const { t } = useTranslation(['member']);
    const queryClient = useQueryClient();
    const { permissions } = useContext(PermissionContext);

    // Form Instances
    const [filterTutorForm] = Form.useForm();
    const [addTutorForm] = Form.useForm();

    // Messages
    const createMemberToast = new Toast('createMember');

    // States
    const [pagination, setPagination] = usePagination({
        sortField: 'code',
        sortOrder: SortOrder.ASC,
    });
    const [selectedColumn, setSelectedColumn] = useState<string[]>(['code', 'englishName', 'email', 'active', 'lastActive']);
    const [addTutorModalOpen, setAddTutorModalOpen] = useState<boolean>(false);

    // Query
    const memberQuery = useQuery({
        queryKey: ['member', 'pagination', pagination],
        enabled: pagination.fetch,
        keepPreviousData: true,
        queryFn: async () => {
            let searchedValue = filterTutorForm.getFieldsValue();

            const query = queryString.stringify({
                ...searchedValue,
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                sortField: pagination.sortField,
                sortOrder: pagination.sortOrder,
            });

            const res = await getMemberListByPagination(query);

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

    const createMemberMutation = useMutation({
        mutationFn: async (values: Member) => {
            createMemberToast.loading(t('messages:loading.creatingTutor'));
            const res = await createMember(values);

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            createMemberToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            createMemberToast.update('success', t('messages:success.memberCreated'));
            setAddTutorModalOpen(false);
            addTutorForm.resetFields();
            setPagination((prev: any) => {
                return {
                    ...prev,
                    fetch: true,
                };
            });

            // Disabled Member Caching
            queryClient.invalidateQueries(['member'], { exact: true });
        },
    });

    // Functions
    const paginationOnChange: TableProps<Member>['onChange'] = (tablePagination, filter, sorter) => {
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

    const onCreateTutorHandler = () => {
        addTutorForm.validateFields().then((values) => {
            createMemberMutation.mutate(values);
        });
    };

    const onResetHandler = () => {
        filterTutorForm.resetFields();
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
            label: t('member'),
            path: '/member',
        },
    ];

    const seoConfig = {
        title: t('member'),
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
            label: t('phoneNumber1'),
            value: 'phoneNumber1',
        },
        {
            label: t('phoneNumber2'),
            value: 'phoneNumber2',
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
            render: (code: string, member: Member) => {
                return (
                    <Link href={`/member/${member.id}`} className="font-bold">
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
        ...conditionalReturn(selectedColumn.includes('phoneNumber1'), [
            {
                dataIndex: 'phoneNumber1',
                title: t('phoneNumber1'),
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('phoneNumber2'), [
            {
                dataIndex: 'phoneNumber2',
                title: t('phoneNumber2'),
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
                render: (_: unknown, member: Member) => {
                    return member.address1 + ' ' + member.address2 + ' ' + member.address3;
                },
            },
        ]),
        ...conditionalReturn(selectedColumn.includes('active'), [
            {
                dataIndex: 'active',
                title: t('active'),
                render: (_: unknown, member: Member) => {
                    return <MemberStatus user={member} />;
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
    ] as TableColumnProps<Member>[];

    return (
        <Layout staff={staff} activeMenu={['member']} activeDropdown={['userManagement']} breadCrumbItems={breadCrumbItems} seoConfig={seoConfig}>
            <div className="flex justify-between">
                <div className="flex">
                    <div className="w-1/2">
                        <FilterDrawer
                            filterTutorForm={filterTutorForm}
                            onReset={onResetHandler}
                            onSearch={onSearchHandler}
                            loading={memberQuery.isFetching}
                        />
                    </div>
                    <div className="w-1/3">
                        <Button type="link" onClick={onResetHandler}>
                            {t('resetFilter')}
                        </Button>
                    </div>
                </div>
                {permissions.MEMBER_CREATE && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddTutorModalOpen(true)}>
                        {t('addMember')}
                    </Button>
                )}
            </div>
            <div className="table_container">
                <div className="flex justify-end config_container">
                    <ColumnSelector options={columnOptions} column={selectedColumn} setColumn={setSelectedColumn} />
                </div>
                <Table
                    columns={columns}
                    dataSource={memberQuery.data}
                    loading={memberQuery.isFetching}
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
            <AddTutorModal
                loading={createMemberMutation.isLoading}
                form={addTutorForm}
                open={addTutorModalOpen}
                setOpen={setAddTutorModalOpen}
                onCreate={onCreateTutorHandler}
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
                ...(await serverSideTranslations(locale as string, ['member', 'APIMessage', 'layout', 'common', 'messages'])),
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
