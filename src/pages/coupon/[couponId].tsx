import Layout from '@/components/layout';
import { authentication } from '@/lib/authentication';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Descriptions, Empty, Form, Skeleton, Spin, Tabs } from 'antd';
import { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import ActivityLog from '@/components/activityLog';
import ProfileTab from '@/components/package/tabs/Profile';
// import PasswordTab from '@/components/packages/tabs/Password';
import { toast } from 'react-toastify';
import conditionalReturn from '@/lib/conditionalReturn';
import { AxiosErrorResponse, StaffPortalProps } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import { deletePackage, getSinglePackage, restorePackage, updatePackageStatus } from '@/services/package';
import { useContext, useEffect, useState } from 'react';
import { PermissionContext } from '@/providers/RoleContext';

const PackageId: NextPage<StaffPortalProps> = ({ staff }) => {
    const { t } = useTranslation(['packages', 'common']);
    const [packagesForm] = Form.useForm();
    const router = useRouter();
    const { packageId, tab } = router.query;
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

    const packagesQuery = useQuery({
        queryKey: ['packages', packageId],
        keepPreviousData: true,
        queryFn: async () => {
            const res = await getSinglePackage(packageId as string);

            packagesForm.setFieldsValue(res.data);

            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const packagesData = packagesQuery.data;

    const breadCrumbItems = [
        {
            label: t('package'),
            path: '/package',
        },
        {
            label: packagesQuery.data ? packagesQuery.data.name : t('common:loading'),
            path: `/package/${packageId}`,
        },
    ];

    const seoConfig = {
        title: t('package'),
    };

    const tabItems = [
        {
            label: t('profile'),
            key: 'profile',
            children: <ProfileTab packagesId={packageId as string} packagesQuery={packagesQuery} />,
        },
        // ...conditionalReturn(permissions.ACTIVITY_LOG, [
        //     {
        //         label: t('common:activityLog'),
        //         key: 'activityLog',
        //         children: <ActivityLog target={`packages:${packageId}`} />,
        //     },
        // ]),
    ];

    return (
        <Layout staff={staff} breadCrumbItems={breadCrumbItems} seoConfig={seoConfig} activeMenu={['package']} activeDropdown={['userManagement']}>
            <Spin spinning={packagesQuery.isFetching}>
                {packagesQuery.isFetching && <Skeleton active />}
                {!packagesData && !packagesQuery.isFetching && <Empty />}
                {packagesData && (
                    <div className="flex flex-col-reverse xl:flex-row xl:gap-12">
                        <div className="flex-1">
                            <Tabs
                                items={tabItems}
                                activeKey={currentTab}
                                onChange={(key) => {
                                    setCurrentTab(key);
                                    router.push(`/packages/${packageId}?tab=${key}`, undefined, {
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

export default PackageId;

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
                ...(await serverSideTranslations(locale as string, ['tutor', 'APIMessage', 'layout', 'common', 'messages', 'course', 'subject'])),
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
