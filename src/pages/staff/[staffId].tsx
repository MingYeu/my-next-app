import Layout from '@/components/layout';
import { authentication } from '@/lib/authentication';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Empty, Form, Input, Modal, Skeleton, Spin, Tabs } from 'antd';
import { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import ActivityLog from '@/components/activityLog';
import ProfileTab from '@/components/staff/tabs/Profile';
import PasswordTab from '@/components/staff/tabs/Password';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
// import CredentialTab from '@/components/staff/tabs/Credential';
import { PermissionContext } from '@/providers/RoleContext';
import conditionalReturn from '@/lib/conditionalReturn';
import { AxiosErrorResponse, StaffPortalProps } from '@/types';
import { getSingleStaff } from '@/services/staff';
import errorFormatter from '@/lib/errorFormatter';

const StaffId: NextPage<StaffPortalProps> = ({ staff }) => {
    const { t } = useTranslation(['staff', 'common']);
    const [staffForm] = Form.useForm();
    const { permissions } = useContext(PermissionContext);
    const router = useRouter();
    const { staffId } = router.query;

    const staffQuery = useQuery({
        queryKey: ['staff', staffId],
        keepPreviousData: true,
        queryFn: async () => {
            const res = await getSingleStaff(staffId as string);

            staffForm.setFieldsValue(res.data);
            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const staffData = staffQuery.data;

    const breadCrumbItems = [
        {
            label: t('staff'),
            path: '/staff',
        },
        {
            label: staffQuery.data ? staffQuery.data.code : t('common:loading'),
            path: `/staff/${staffId}`,
        },
    ];

    const seoConfig = {
        title: t('staff'),
    };

    const tabItems = [
        {
            label: t('profile'),
            key: 'profile',
            children: <ProfileTab staffId={staffId as string} staffQuery={staffQuery} />,
        },
        // {
        //     label: t('credential'),
        //     key: 'credential',
        //     children: <CredentialTab staffId={staffId as string} staffQuery={staffQuery} />,
        // },
        {
            label: t('password'),
            key: 'password',
            children: <PasswordTab staffId={staffId as string} />,
        },
        // ...conditionalReturn(permissions.ACTIVITY_LOG, [
        {
            label: t('common:activityLog'),
            key: 'activityLog',
            children: <ActivityLog target={`staff:${staffId}`} />,
        },
        // ]),
    ];

    return (
        <Layout staff={staff} breadCrumbItems={breadCrumbItems} seoConfig={seoConfig} activeMenu={['staff']} activeDropdown={['userManagement']}>
            <Spin spinning={staffQuery.isFetching}>
                {staffQuery.isFetching && <Skeleton active />}
                {!staffData && !staffQuery.isFetching && <Empty />}
                {staffData && (
                    <div className="flex flex-col lg:flex-row">
                        <Tabs items={tabItems} className="order-2 px-2 mt-10 lg:mt-0 lg:flex-1 lg:order-1" />
                    </div>
                )}
            </Spin>
        </Layout>
    );
};

export default StaffId;

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
