import Layout from '@/components/layout';
import { authentication } from '@/lib/authentication';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Descriptions, Empty, Form, Skeleton, Spin, Tabs } from 'antd';
import { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import ActivityLog from '@/components/activityLog';
import ProfileTab from '@/components/member/tabs/Profile';
import { toast } from 'react-toastify';
import conditionalReturn from '@/lib/conditionalReturn';
import { AxiosErrorResponse, StaffPortalProps } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import { deleteMember, getSingleMember, updateMemberStatus } from '@/services/member';
import { useContext, useEffect, useState } from 'react';
import { PermissionContext } from '@/providers/RoleContext';
import MemberStructure from '@/components/member/tabs/MemberStructure';

const MemberId: NextPage<StaffPortalProps> = ({ staff }) => {
    const { t } = useTranslation(['member', 'common']);
    const [memberForm] = Form.useForm();
    const router = useRouter();
    const { memberId, tab } = router.query;
    const { permissions } = useContext(PermissionContext);
    const [currentTab, setCurrentTab] = useState<string>('profile');

    useEffect(() => {
        if (
            tab &&
            typeof tab === 'string' &&
            tabItems
                .map((item) => {
                    return item.key;
                })
                .includes(tab)
        ) {
            setCurrentTab(tab);
        }
    }, [tab]);

    const memberQuery = useQuery({
        queryKey: ['member', memberId],
        keepPreviousData: true,
        queryFn: async () => {
            const res = await getSingleMember(memberId as string);

            memberForm.setFieldsValue(res.data);

            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const memberData = memberQuery.data;

    const breadCrumbItems = [
        {
            label: t('member'),
            path: '/member',
        },
        {
            label: memberQuery.data ? memberQuery.data.code : t('common:loading'),
            path: `/member/${memberId}`,
        },
    ];

    const seoConfig = {
        title: t('member'),
    };

    const tabItems = [
        {
            label: t('profile'),
            key: 'profile',
            children: <ProfileTab memberId={memberId as string} memberQuery={memberQuery} />,
        },
        {
            label: t('structure'),
            key: 'structure',
            children: <MemberStructure memberId={memberId as string} />,
        },

        // {
        //     label: t('password'),
        //     key: 'password',
        //     children: <PasswordTab memberId={memberId as string} />,
        // },
        ...conditionalReturn(permissions.ACTIVITY_LOG, [
            {
                label: t('common:activityLog'),
                key: 'activityLog',
                children: <ActivityLog target={`member:${memberId}`} />,
            },
        ]),
    ];

    return (
        <Layout staff={staff} breadCrumbItems={breadCrumbItems} seoConfig={seoConfig} activeMenu={['member']} activeDropdown={['userManagement']}>
            <Spin spinning={memberQuery.isFetching}>
                {memberQuery.isFetching && <Skeleton active />}
                {!memberData && !memberQuery.isFetching && <Empty />}
                {memberData && (
                    <div className="flex flex-col-reverse xl:flex-row xl:gap-12">
                        <div className="flex-1">
                            <Tabs
                                items={tabItems}
                                activeKey={currentTab}
                                onChange={(key) => {
                                    setCurrentTab(key);
                                    router.push(`/member/${memberId}?tab=${key}`, undefined, {
                                        shallow: true,
                                    });
                                }}
                            />
                        </div>
                    </div>
                )}
            </Spin>
        </Layout>
    );
};

export default MemberId;

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
                ...(await serverSideTranslations(locale as string, ['member', 'APIMessage', 'layout', 'common', 'messages', 'course', 'subject'])),
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
