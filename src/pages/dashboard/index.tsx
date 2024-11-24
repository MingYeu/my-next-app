// import PaymentInfoStatistic from '@/components/dashboard/PaymentInfo';
import PieChart from '@/components/dashboard/PieChart';
import Layout from '@/components/layout';
import { authentication } from '@/lib/authentication';
import errorFormatter from '@/lib/errorFormatter';
import { getDashboardInfo } from '@/services/data';
import { AxiosErrorResponse, Dashboard, StaffPortalProps } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Col, Divider, Row } from 'antd';
import { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { toast } from 'react-toastify';

const Index: NextPage<StaffPortalProps> = ({ staff }) => {
    const { t } = useTranslation(['dashboard']);

    // Dashboard Query
    const dashboardQuery = useQuery({
        queryKey: ['dashboard'],
        keepPreviousData: true,
        queryFn: async () => {
            const res = await getDashboardInfo();
            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const memberByPackage = dashboardQuery.data?.userManagement.membersByPackage?.map((member) => {
        return {
            type: member.packageName !== null ? member.packageName : 'Empty',
            total: member.total,
        };
    });

    const couponByPackage = dashboardQuery.data?.userManagement.couponBySeries?.map((coupon) => {
        return {
            type: coupon.seriesName,
            total: coupon.total,
        };
    });

    const memberManagementPieChartConfig = {
        appendPadding: 10,
        color: ['#2986cc', '#c90076', '#EB1961', '#ED1C24', '#6CBD24', '#EBC722', '#EB8A2D'],
        data: memberByPackage,
        angleField: 'total',
        colorField: 'type',
        radius: 0.9,
        label: {
            autoRotate: false,
            type: 'inner',
            offset: '-35%',
            style: {
                fontSize: 24,
                textAlign: 'center',
            },
        },
    };

    const couponManagementPieChartConfig = {
        appendPadding: 10,
        color: ['#2986cc', '#c90076', '#EB1961'],
        data: couponByPackage,
        angleField: 'total',
        colorField: 'type',
        radius: 0.9,
        label: {
            autoRotate: false,
            type: 'inner',
            offset: '-35%',
            style: {
                fontSize: 24,
                textAlign: 'center',
            },
        },
    };

    return (
        <Layout staff={staff} activeMenu={['dashboard']}>
            {/* <PaymentInfoStatistic paymentInfo={dashboardQuery.data?.paymentInfo} /> */}
            <Divider />
            <Row gutter={[32, 32]} className="mb-8">
                {/* <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <PieChart
                        title={t('user-management')}
                        loading={dashboardQuery.isFetching || dashboardQuery.isLoading}
                        config={userManagementPieChartConfig}
                    />
                </Col> */}
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <PieChart
                        title={t('Member Management')}
                        loading={dashboardQuery.isFetching || dashboardQuery.isLoading}
                        config={memberManagementPieChartConfig}
                    />
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <PieChart
                        title={t('Coupon Management')}
                        loading={dashboardQuery.isFetching || dashboardQuery.isLoading}
                        config={couponManagementPieChartConfig}
                    />
                </Col>
            </Row>
        </Layout>
    );
};

export default Index;

export const getServerSideProps: GetServerSideProps = async ({ locale, req, resolvedUrl }) => {
    try {
        const authResponse = await authentication(req);
        return {
            props: {
                staff: authResponse,
                ...(await serverSideTranslations(locale as string, ['dashboard', 'APIMessage', 'layout', 'common', 'messages'])),
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
