import Layout from '@/components/layout';
import { authentication } from '@/lib/authentication';
import { useQuery } from '@tanstack/react-query';
import { Empty, Form, Skeleton, Spin, Tabs } from 'antd';
import { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { AxiosErrorResponse, StaffPortalProps } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import { getSingleCouponSeries } from '@/services/coupon';
import { useContext, useEffect, useState } from 'react';
import { PermissionContext } from '@/providers/RoleContext';
import CouponSeriesProfile from '@/components/coupon/tabs/CouponSeriesProfile';

const CouponId: NextPage<StaffPortalProps> = ({ staff }) => {
    const { t } = useTranslation(['coupons', 'common']);
    const [couponsForm] = Form.useForm();
    const router = useRouter();
    const { couponSeriesId, tab } = router.query;
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

    const couponsSeriesQuery = useQuery({
        queryKey: ['coupons', 'series', couponSeriesId],
        keepPreviousData: true,
        queryFn: async () => {
            const res = await getSingleCouponSeries(couponSeriesId as string);

            couponsForm.setFieldsValue(res.data);

            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const couponsData = couponsSeriesQuery.data;

    const breadCrumbItems = [
        {
            label: t('coupon-series'),
            path: '/coupon-series',
        },
        {
            label: couponsSeriesQuery.data ? couponsSeriesQuery.data.name : t('common:loading'),
            path: `/coupon-series/${couponSeriesId}`,
        },
    ];

    const seoConfig = {
        title: t('coupon'),
    };

    const tabItems = [
        {
            label: t('profile'),
            key: 'profile',
            children: <CouponSeriesProfile couponSeriesId={couponSeriesId as string} couponsSeriesQuery={couponsSeriesQuery} />,
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
        <Layout staff={staff} breadCrumbItems={breadCrumbItems} seoConfig={seoConfig} activeMenu={['couponSeries']}>
            <Spin spinning={couponsSeriesQuery.isFetching}>
                {couponsSeriesQuery.isFetching && <Skeleton active />}
                {!couponsData && !couponsSeriesQuery.isFetching && <Empty />}
                {couponsData && (
                    <div className="flex flex-col-reverse xl:flex-row xl:gap-12">
                        <div className="flex-1">
                            <Tabs
                                items={tabItems}
                                activeKey={currentTab}
                                onChange={(key) => {
                                    setCurrentTab(key);
                                    router.push(`/coupons/${couponSeriesId}?tab=${key}`, undefined, {
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
