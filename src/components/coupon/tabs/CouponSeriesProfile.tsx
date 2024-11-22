import { UseQueryResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, DatePicker, Descriptions, Form, Input, InputNumber, Row, Spin } from 'antd';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';
import 'react-phone-input-2/lib/style.css';
import Toast from '@/lib/Toast';
import { PermissionContext } from '@/providers/RoleContext';
import { Coupon, CouponSeries } from '@/types/coupon';
import { deleteCoupon, deleteCouponSeries, updateCoupon, updateCouponSeries, updateCouponSeriesStatus, updateCouponStatus } from '@/services/coupon';
import { AxiosErrorResponse } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import router from 'next/router';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface CouponSeriesProfileProps {
    couponSeriesId: string;
    couponsSeriesQuery: UseQueryResult<CouponSeries | null>;
}

const CouponSeriesProfile: React.FC<CouponSeriesProfileProps> = ({ couponSeriesId, couponsSeriesQuery }) => {
    const { t, i18n } = useTranslation(['coupons', 'series', 'common']);
    const { permissions } = useContext(PermissionContext);
    const [couponSeriesForm] = Form.useForm();
    const couponSeries = couponsSeriesQuery.data;
    const updateCouponSeriesToast = new Toast('updateCouponSeries');
    const queryClient = useQueryClient();
    const DItem = Descriptions.Item;
    const updateCouponSeriesStatusToast = new Toast('Update Coupon Series Status');
    const deleteCouponSeriesToast = new Toast('Delete Coupon Series');

    useEffect(() => {
        if (couponSeries) {
            couponSeriesForm.setFieldsValue({
                ...couponSeries,
                startDate: couponSeries.startDate ? dayjs(couponSeries.startDate) : null,
                endDate: couponSeries.endDate ? dayjs(couponSeries.endDate) : null,
            });
        }
    }, [couponSeries]);

    const updateCouponSeriesMutation = useMutation({
        mutationFn: async (couponsSeriesData: CouponSeries & { reason: string }) => {
            updateCouponSeriesToast.loading(t('messages:loading.updatingCouponSeries'));
            const res = await updateCouponSeries(couponSeriesId, couponsSeriesData);
            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            updateCouponSeriesToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            couponSeriesForm.resetFields(['reason']);
            updateCouponSeriesToast.update('success', t('messages:success.couponsSeriesUpdated'));
            queryClient.invalidateQueries(['couponsSeries'], { exact: true });
        },
    });

    const updateCouponStatusMutation = useMutation({
        mutationFn: async ({ status, reason }: { status: boolean; reason: string }) => {
            updateCouponSeriesStatusToast.loading(
                couponSeries?.active ? t('messages:loading.deactivatingCouponSeries') : t('messages:loading.activatingCouponSeries')
            );
            const res = await updateCouponSeriesStatus(couponSeriesId as string, {
                status,
                reason,
            });

            return res;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            updateCouponSeriesStatusToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: (data, inputData) => {
            updateCouponSeriesStatusToast.update(
                'success',
                inputData.status ? t('messages:success.couponSeriesActivated') : t('messages:success.couponSeriesDeactivated')
            );
            couponsSeriesQuery.refetch();
        },
    });

    const deleteCouponSeriesMutation = useMutation({
        mutationFn: async (reason: string) => {
            deleteCouponSeriesToast.loading(t('messages:loading.deletingCouponSeries'));
            const res = await deleteCouponSeries(couponSeriesId as string, {
                reason,
            });

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            deleteCouponSeriesToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            deleteCouponSeriesToast.update('success', t('messages:success.couponSeriesDeleted'));
            router.push('/coupon-series');
            queryClient.invalidateQueries(['couponSeries'], { exact: true });
        },
    });

    const onUpdateCouponSeriesHandler = (reason: string) => {
        couponSeriesForm.validateFields().then(async (values) => {
            updateCouponSeriesMutation.mutate({ ...values, reason });
        });
    };

    console.log('couponSeries', couponSeries);

    return (
        <Spin spinning={updateCouponSeriesMutation.isLoading}>
            {couponSeries && (
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:basis-[300px] lg:order-2 order-2 px-2">
                        <Card className="sticky top-5">
                            <Descriptions layout="vertical" title={t('couponsProfile')} size="small" column={1}>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('couponSeriesName')}>
                                    {couponSeries.name}
                                </DItem>

                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('common:action')}>
                                    <div className="flex flex-col w-full max-w-[300px] gap-2">
                                        {/* {permissions.PACKAGE_UPDATE && ( */}
                                        <ConfirmationModal
                                            message={couponSeries.active ? t('deactivateCouponConfirmation') : t('activateCouponConfirmation')}
                                            okText={couponSeries.active ? t('deactivate') : t('activate')}
                                            okButtonProps={{
                                                danger: couponSeries.active,
                                            }}
                                            onOk={(reason) =>
                                                updateCouponStatusMutation.mutate({
                                                    reason,
                                                    status: !couponSeries.active,
                                                })
                                            }
                                            reason
                                        >
                                            <Button block type={couponSeries.active ? 'default' : 'primary'} danger={couponSeries.active}>
                                                {couponSeries.active ? t('deactivate') : t('activate')}
                                            </Button>
                                        </ConfirmationModal>
                                        {/* )} */}
                                        {/* {permissions.PACKAGE_DELETE && ( */}
                                        <ConfirmationModal
                                            message={t('deleteCouponSeriesConfirmation')}
                                            okText={t('delete')}
                                            okButtonProps={{
                                                danger: true,
                                            }}
                                            onOk={(reason) => deleteCouponSeriesMutation.mutate(reason)}
                                            reason
                                        >
                                            <Button block type="primary" danger>
                                                {t('delete')}
                                            </Button>
                                        </ConfirmationModal>
                                        {/* )} */}
                                    </div>
                                </DItem>
                            </Descriptions>
                        </Card>
                    </div>
                    <div className="order-2 w-full px-2 mt-10 lg:mt-0 lg:flex-1 lg:order-1">
                        <Form form={couponSeriesForm} layout="vertical" title="Coupon Form">
                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('Name')} name="name" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('Cost')} name="cost" rules={[{ required: true }]}>
                                        <InputNumber min={0} precision={2} placeholder="Enter Cost" className="w-full" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('Start Date')} name="startDate">
                                        <DatePicker className="w-full" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('End Date')} name="endDate">
                                        <DatePicker className="w-full" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('Period')} name="period">
                                        <InputNumber min={0} placeholder="Please Enter" className="w-full" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={24} md={24} lg={24}>
                                    <Form.Item label={t('Remarks')} name="remarks">
                                        <Input.TextArea rows={3} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            {permissions.STAFF_UPDATE && (
                                <div className="flex justify-end">
                                    <ConfirmationModal
                                        message={t('updateCouponSeriesConfirmation')}
                                        okText={t('updateCouponSeries')}
                                        okButtonProps={{
                                            danger: false,
                                        }}
                                        reason
                                        onOk={(reason: string) => onUpdateCouponSeriesHandler(reason)}
                                    >
                                        <Button type="primary">{t('updateCouponSeries')}</Button>
                                    </ConfirmationModal>
                                </div>
                            )}
                        </Form>
                    </div>
                </div>
            )}
        </Spin>
    );
};

export default CouponSeriesProfile;
