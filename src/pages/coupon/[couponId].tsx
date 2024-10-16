import Layout from '@/components/layout';
import { authentication } from '@/lib/authentication';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Descriptions, Empty, Form, Skeleton, Spin, Tabs } from 'antd';
import { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import ActivityLog from '@/components/activityLog';
import ProfileTab from '@/components/coupon/tabs/Profile';
// import PasswordTab from '@/components/coupons/tabs/Password';
import { toast } from 'react-toastify';
import conditionalReturn from '@/lib/conditionalReturn';
import { AxiosErrorResponse, StaffPortalProps } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import { deleteCoupon, getSingleCoupon, updateCouponStatus } from '@/services/coupon';
import { useContext, useEffect, useState } from 'react';
import { PermissionContext } from '@/providers/RoleContext';

const CouponId: NextPage<StaffPortalProps> = ({ staff }) => {
    const { t } = useTranslation(['coupons', 'common']);
    const [couponsForm] = Form.useForm();
    const router = useRouter();
    const { couponId, tab } = router.query;
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

    const couponsQuery = useQuery({
        queryKey: ['coupons', couponId],
        keepPreviousData: true,
        queryFn: async () => {
            const res = await getSingleCoupon(couponId as string);

            couponsForm.setFieldsValue(res.data);

            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const couponsData = couponsQuery.data;

    const breadCrumbItems = [
        {
            label: t('coupon'),
            path: '/coupon',
        },
        {
            label: couponsQuery.data ? couponsQuery.data.code : t('common:loading'),
            path: `/coupon/${couponId}`,
        },
    ];

    const seoConfig = {
        title: t('coupon'),
    };

    const tabItems = [
        {
            label: t('profile'),
            key: 'profile',
            children: <ProfileTab couponsId={couponId as string} couponsQuery={couponsQuery} />,
        },
        // ...conditionalReturn(permissions.ACTIVITY_LOG, [
        //     {
        //         label: t('common:activityLog'),
        //         key: 'activityLog',
        //         children: <ActivityLog target={`coupons:${couponId}`} />,
        //     },
        // ]),
    ];

    return (
        <Layout staff={staff} breadCrumbItems={breadCrumbItems} seoConfig={seoConfig} activeMenu={['coupon']} activeDropdown={['userManagement']}>
            <Spin spinning={couponsQuery.isFetching}>
                {couponsQuery.isFetching && <Skeleton active />}
                {!couponsData && !couponsQuery.isFetching && <Empty />}
                {couponsData && (
                    <div className="flex flex-col-reverse xl:flex-row xl:gap-12">
                        <div className="flex-1">
                            <Tabs
                                items={tabItems}
                                activeKey={currentTab}
                                onChange={(key) => {
                                    setCurrentTab(key);
                                    router.push(`/coupons/${couponId}?tab=${key}`, undefined, {
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

export default CouponId;

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
