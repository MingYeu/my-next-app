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
import { Button, Form, Table, TableColumnProps, TableProps } from 'antd';
import FilterDrawer from '@/components/children/modals/Filter';
import ColumnSelector from '@/components/modals/ColumnSelector';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import usePagination from '@/hooks/usePagination';
import { SortOrder } from '@/types/pagination';
import errorFormatter from '@/lib/errorFormatter';
import { Children } from '@/types/children';
import { getChildrenListByPagination } from '@/services/children';

const Index: NextPage<StaffPortalProps> = ({ staff }) => {
    const { t } = useTranslation(['children']);
    // Form Instances
    const [filterChildrenForm] = Form.useForm();

    // States
    const [pagination, setPagination] = usePagination({
        sortField: 'code',
        sortOrder: SortOrder.ASC,
    });
    const [selectedColumn, setSelectedColumn] = useState<string[]>(['name', 'gender', 'dateOfBirth', 'memberId', 'memberName']);

    // Query
    const childrenQuery = useQuery({
        queryKey: ['children', 'pagination', pagination],
        enabled: pagination.fetch,
        keepPreviousData: true,
        queryFn: async () => {
            let searchedValue = filterChildrenForm.getFieldsValue();

            const query = queryString.stringify({
                ...searchedValue,
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                sortField: pagination.sortField,
                sortOrder: pagination.sortOrder,
            });

            const res = await getChildrenListByPagination(query);

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

    // Functions
    const paginationOnChange: TableProps<Children>['onChange'] = (tablePagination, filter, sorter) => {
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

    const onResetHandler = () => {
        filterChildrenForm.resetFields();
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
            label: t('children'),
            path: '/children',
        },
    ];

    const seoConfig = {
        title: t('children'),
    };

    const columnOptions = [
        {
            label: t('Name'),
            value: 'name',
        },
        {
            label: t('Gender'),
            value: 'gender',
        },
        {
            label: t('Date Of Birth'),
            value: 'dateOfBirth',
        },
        {
            label: t('Member Id'),
            value: 'memberId',
        },
        {
            label: t('Member Name'),
            value: 'memberName',
        },
    ];

    const columns = [
        {
            dataIndex: 'name',
            title: t('Name'),
        },
        {
            dataIndex: 'gender',
            title: t('Gender'),
        },
        ...conditionalReturn(selectedColumn.includes('dateOfBirth'), [
            {
                dataIndex: 'dateOfBirth',
                title: t('dateOfBirth'),
                sorter: true,
                render: (dateOfBirth: string) => {
                    return dayjs(dateOfBirth).format('D MMM YYYY');
                },
            },
        ]),
        {
            dataIndex: 'memberId',
            title: t('memberId'),
            render: (_: unknown, children: Children) => {
                return (
                    <Link href={`/member/${children.memberId}`} className="font-bold">
                        {children.memberName}
                    </Link>
                );
            },
        },
    ] as TableColumnProps<Children>[];

    return (
        <Layout staff={staff} activeMenu={['children']} activeDropdown={['userManagement']} breadCrumbItems={breadCrumbItems} seoConfig={seoConfig}>
            <div className="flex justify-between">
                <div className="flex">
                    <div className="w-1/2">
                        <FilterDrawer
                            filterChildrenForm={filterChildrenForm}
                            onReset={onResetHandler}
                            onSearch={onSearchHandler}
                            loading={childrenQuery.isFetching}
                        />
                    </div>
                    <div className="w-1/3">
                        <Button type="link" onClick={onResetHandler}>
                            {t('Reset Filter')}
                        </Button>
                    </div>
                </div>
            </div>
            <div className="table_container">
                <div className="flex justify-end config_container">
                    <ColumnSelector options={columnOptions} column={selectedColumn} setColumn={setSelectedColumn} />
                </div>
                <Table
                    columns={columns}
                    dataSource={childrenQuery.data}
                    loading={childrenQuery.isFetching}
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
                ...(await serverSideTranslations(locale as string, ['children', 'APIMessage', 'layout', 'common', 'messages'])),
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
