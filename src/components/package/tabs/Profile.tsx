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
import { Package } from '@/types/package';
import { deletePackage, updatePackage, updatePackageStatus } from '@/services/package';
import { AxiosErrorResponse } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import PackageStatus from '@/components/Status';
import { getRoleData } from '@/services/data';
import { toast } from 'react-toastify';
import router from 'next/router';

const { TextArea } = Input;

interface ProfileProps {
    packagesId: string;
    packagesQuery: UseQueryResult<Package | null>;
}

const Profile: React.FC<ProfileProps> = ({ packagesId, packagesQuery }) => {
    const { t, i18n } = useTranslation(['packages', 'common']);
    const { permissions } = useContext(PermissionContext);
    const [packagesForm] = Form.useForm();
    const packages = packagesQuery.data;
    const updatePackageToast = new Toast('updatePackage');
    const queryClient = useQueryClient();
    const DItem = Descriptions.Item;
    const updatePackageStatusToast = new Toast('Update Package Status');
    const deletePackageToast = new Toast('Delete Package');
    const restorePackageToast = new Toast('Restore Package');
    const updatePackageRoleToast = new Toast('updatePackageRole');
    const [roleId, setRoleId] = useState<string>('');
    const [isRoleOpenModal, setIsRoleOpenModal] = useState<boolean>(false);
    const [changePackageRoleReasonForm] = Form.useForm();

    useEffect(() => {
        if (packages) {
            packagesForm.setFieldsValue({
                ...packages,
                startDate: packages.startDate ? dayjs(packages.startDate) : null,
                endDate: packages.endDate ? dayjs(packages.endDate) : null,
            });
            // setRoleId(packages.roleId);
        }
    }, [packages]);

    const updatePackageMutation = useMutation({
        mutationFn: async (packagesData: Package & { reason: string }) => {
            updatePackageToast.loading(t('messages:loading.updatingPackage'));

            const res = await updatePackage(packagesId, packagesData);

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            updatePackageToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            packagesForm.resetFields(['reason']);
            updatePackageToast.update('success', t('messages:success.packagesUpdated'));
            queryClient.invalidateQueries(['packages'], { exact: true });
        },
    });

    const updatePackageStatusMutation = useMutation({
        mutationFn: async ({ status, reason }: { status: boolean; reason: string }) => {
            updatePackageStatusToast.loading(packages?.active ? t('messages:loading.deactivatingStudent') : t('messages:loading.activatingStudent'));
            const res = await updatePackageStatus(packagesId as string, {
                status,
                reason,
            });

            return res;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            updatePackageStatusToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: (data, inputData) => {
            updatePackageStatusToast.update(
                'success',
                inputData.status ? t('messages:success.packagesActivated') : t('messages:success.packagesDeactivated')
            );
            packagesQuery.refetch();
        },
    });

    const deletePackageMutation = useMutation({
        mutationFn: async (reason: string) => {
            deletePackageToast.loading(t('messages:loading.deletingStudent'));
            const res = await deletePackage(packagesId as string, {
                reason,
            });

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            deletePackageToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            deletePackageToast.update('success', t('messages:success.packagesDeleted'));
            router.push('/package');
            queryClient.invalidateQueries(['packages'], { exact: true });
        },
    });

    const onUpdatePackageHandler = (reason: string) => {
        packagesForm.validateFields().then(async (values) => {
            updatePackageMutation.mutate({ ...values, reason });
        });
    };

    return (
        <Spin spinning={updatePackageMutation.isLoading}>
            {packages && (
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:basis-[300px] lg:order-2 order-2 px-2">
                        <Card className="sticky top-5">
                            <Descriptions layout="vertical" title={t('packagesProfile')} size="small" column={1}>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('packagesName')}>
                                    {packages.name}
                                </DItem>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('cost')}>
                                    RM {packages.cost}
                                </DItem>
                                {/* <DItem contentStyle={{ marginBottom: '15px' }} label={t('status')}>
                                    <PackageStatus packages={packages} />
                                </DItem> */}

                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('common:action')}>
                                    <div className="flex flex-col w-full max-w-[300px] gap-2">
                                        {/* {permissions.PACKAGE_UPDATE && ( */}
                                        <ConfirmationModal
                                            message={packages.active ? t('deactivatePackageConfirmation') : t('activatePackageConfirmation')}
                                            okText={packages.active ? t('deactivate') : t('activate')}
                                            okButtonProps={{
                                                danger: packages.active,
                                            }}
                                            onOk={(reason) =>
                                                updatePackageStatusMutation.mutate({
                                                    reason,
                                                    status: !packages.active,
                                                })
                                            }
                                            reason
                                        >
                                            <Button block type={packages.active ? 'default' : 'primary'} danger={packages.active}>
                                                {packages.active ? t('deactivate') : t('activate')}
                                            </Button>
                                        </ConfirmationModal>
                                        {/* )} */}
                                        {/* {permissions.PACKAGE_DELETE && ( */}
                                        <ConfirmationModal
                                            message={t('deletePackageConfirmation')}
                                            okText={t('delete')}
                                            okButtonProps={{
                                                danger: true,
                                            }}
                                            onOk={(reason) => deletePackageMutation.mutate(reason)}
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
                            <Form form={changePackageRoleReasonForm}>
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
                        <Form form={packagesForm} layout="vertical" title="Package Form">
                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('name')} name="name" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('cost')} name="cost" rules={[{ required: true }]}>
                                        <InputNumber min={0} className="w-full" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('point')} name="point" rules={[{ required: true }]}>
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
                                        message={t('updatePackageConfirmation')}
                                        okText={t('updatePackage')}
                                        okButtonProps={{
                                            danger: false,
                                        }}
                                        reason
                                        onOk={(reason: string) => onUpdatePackageHandler(reason)}
                                    >
                                        <Button type="primary">{t('updatePackage')}</Button>
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
