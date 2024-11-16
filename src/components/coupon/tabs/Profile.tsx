import mappedCountryList from '@/lib/countryList';
import { UseQueryResult, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, DatePicker, Descriptions, Form, Input, InputNumber, Modal, Row, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Toast from '@/lib/Toast';
import { PermissionContext } from '@/providers/RoleContext';
import { Coupon } from '@/types/coupon';
import { deleteCoupon, updateCoupon, updateCouponStatus } from '@/services/coupon';
import { AxiosErrorResponse } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import CouponStatus from '@/components/Status';
import { getRoleData } from '@/services/data';
import { toast } from 'react-toastify';
import router from 'next/router';

const { TextArea } = Input;

interface ProfileProps {
    couponsId: string;
    couponsQuery: UseQueryResult<Coupon | null>;
}

const Profile: React.FC<ProfileProps> = ({ couponsId, couponsQuery }) => {
    const { t, i18n } = useTranslation(['coupons', 'common']);
    const { permissions } = useContext(PermissionContext);
    const [couponsForm] = Form.useForm();
    const coupons = couponsQuery.data;
    const updateCouponToast = new Toast('updateCoupon');
    const queryClient = useQueryClient();
    const DItem = Descriptions.Item;
    const updateCouponStatusToast = new Toast('Update Coupon Status');
    const deleteCouponToast = new Toast('Delete Coupon');
    const restoreCouponToast = new Toast('Restore Coupon');
    const updateCouponRoleToast = new Toast('updateCouponRole');
    const [roleId, setRoleId] = useState<string>('');
    const [isRoleOpenModal, setIsRoleOpenModal] = useState<boolean>(false);
    const [changeCouponRoleReasonForm] = Form.useForm();

    useEffect(() => {
        if (coupons) {
            couponsForm.setFieldsValue({
                ...coupons,
                startDate: coupons.startDate ? dayjs(coupons.startDate) : null,
                endDate: coupons.endDate ? dayjs(coupons.endDate) : null,
            });
            // setRoleId(coupons.roleId);
        }
    }, [coupons]);

    const updateCouponMutation = useMutation({
        mutationFn: async (couponsData: Coupon & { reason: string }) => {
            updateCouponToast.loading(t('messages:loading.updatingCoupon'));

            const res = await updateCoupon(couponsId, couponsData);

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            updateCouponToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            couponsForm.resetFields(['reason']);
            updateCouponToast.update('success', t('messages:success.couponsUpdated'));
            queryClient.invalidateQueries(['coupons'], { exact: true });
        },
    });

    const updateCouponStatusMutation = useMutation({
        mutationFn: async ({ status, reason }: { status: boolean; reason: string }) => {
            updateCouponStatusToast.loading(coupons?.active ? t('messages:loading.deactivatingStudent') : t('messages:loading.activatingStudent'));
            const res = await updateCouponStatus(couponsId as string, {
                status,
                reason,
            });

            return res;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            updateCouponStatusToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: (data, inputData) => {
            updateCouponStatusToast.update(
                'success',
                inputData.status ? t('messages:success.couponsActivated') : t('messages:success.couponsDeactivated')
            );
            couponsQuery.refetch();
        },
    });

    const deleteCouponMutation = useMutation({
        mutationFn: async (reason: string) => {
            deleteCouponToast.loading(t('messages:loading.deletingStudent'));
            const res = await deleteCoupon(couponsId as string, {
                reason,
            });

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            deleteCouponToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            deleteCouponToast.update('success', t('messages:success.couponsDeleted'));
            router.push('/coupon');
            queryClient.invalidateQueries(['coupons'], { exact: true });
        },
    });

    const onUpdateCouponHandler = (reason: string) => {
        couponsForm.validateFields().then(async (values) => {
            updateCouponMutation.mutate({ ...values, reason });
        });
    };

    return (
        <Spin spinning={updateCouponMutation.isLoading}>
            {coupons && (
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:basis-[300px] lg:order-2 order-2 px-2">
                        <Card className="sticky top-5">
                            <Descriptions layout="vertical" title={t('couponsProfile')} size="small" column={1}>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('couponsName')}>
                                    {coupons.code}
                                </DItem>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('cost')}>
                                    RM {coupons.cost}
                                </DItem>
                                {/* <DItem contentStyle={{ marginBottom: '15px' }} label={t('status')}>
                                    <CouponStatus coupons={coupons} />
                                </DItem> */}

                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('common:action')}>
                                    <div className="flex flex-col w-full max-w-[300px] gap-2">
                                        {/* {permissions.PACKAGE_UPDATE && ( */}
                                        <ConfirmationModal
                                            message={coupons.active ? t('deactivateCouponConfirmation') : t('activateCouponConfirmation')}
                                            okText={coupons.active ? t('deactivate') : t('activate')}
                                            okButtonProps={{
                                                danger: coupons.active,
                                            }}
                                            onOk={(reason) =>
                                                updateCouponStatusMutation.mutate({
                                                    reason,
                                                    status: !coupons.active,
                                                })
                                            }
                                            reason
                                        >
                                            <Button block type={coupons.active ? 'default' : 'primary'} danger={coupons.active}>
                                                {coupons.active ? t('deactivate') : t('activate')}
                                            </Button>
                                        </ConfirmationModal>
                                        {/* )} */}
                                        {/* {permissions.PACKAGE_DELETE && ( */}
                                        <ConfirmationModal
                                            message={t('deleteCouponConfirmation')}
                                            okText={t('delete')}
                                            okButtonProps={{
                                                danger: true,
                                            }}
                                            onOk={(reason) => deleteCouponMutation.mutate(reason)}
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
                        {/* <Modal open={isRoleOpenModal} onCancel={onCloseHandler} footer={null} title={t('changeRoleConfirmation')}>
                            <label>
                                <b>{t('reason')}:</b>
                            </label>
                            <Form form={changeCouponRoleReasonForm}>
                                <Form.Item name="reason" rules={[{ required: false }]} className="!w-full">
                                    <TextArea rows={4} className="!resize-none mt-2 !w-full" />
                                </Form.Item>
                            </Form>

                            <div className="text-end">
                                <Button type="primary" htmlType="submit" onClick={onSubmitHandler}>
                                    {t('submit')}
                                </Button>
                            </div>
                        </Modal> */}
                    </div>
                    <div className="order-2 w-full px-2 mt-10 lg:mt-0 lg:flex-1 lg:order-1">
                        <Form form={couponsForm} layout="vertical" title="Coupon Form">
                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('code')} name="code" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('cost')} name="cost" rules={[{ required: true }]}>
                                        <InputNumber min={0} className="w-full" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('startDate')} name="startDate">
                                        <DatePicker className="w-full" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('endDate')} name="endDate">
                                        <DatePicker className="w-full" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={24}>
                                    <Form.Item label={t('description')} name="description">
                                        <Input.TextArea rows={3} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            {permissions.STAFF_UPDATE && (
                                <div className="flex justify-end">
                                    <ConfirmationModal
                                        message={t('updateCouponConfirmation')}
                                        okText={t('updateCoupon')}
                                        okButtonProps={{
                                            danger: false,
                                        }}
                                        reason
                                        onOk={(reason: string) => onUpdateCouponHandler(reason)}
                                    >
                                        <Button type="primary">{t('updateCoupon')}</Button>
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

export default Profile;
