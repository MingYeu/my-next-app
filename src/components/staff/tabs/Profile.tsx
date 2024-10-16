import mappedCountryList from '@/lib/countryList';
import { UseQueryResult, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, DatePicker, Descriptions, Form, Input, Modal, Row, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Toast from '@/lib/Toast';
import { PermissionContext } from '@/providers/RoleContext';
import { Staff } from '@/types/staff';
import { deleteStaff, restoreStaff, updateStaff, updateStaffRole, updateStaffStatus } from '@/services/staff';
import { AxiosErrorResponse } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import StaffStatus from '@/components/Status';
import { getRoleData } from '@/services/data';
import { toast } from 'react-toastify';
import router from 'next/router';

const { TextArea } = Input;

interface ProfileProps {
    staffId: string;
    staffQuery: UseQueryResult<Staff | null>;
}

const Profile: React.FC<ProfileProps> = ({ staffId, staffQuery }) => {
    const { t, i18n } = useTranslation(['staff', 'common']);
    const { permissions } = useContext(PermissionContext);
    const [staffForm] = Form.useForm();
    const staff = staffQuery.data;
    const updateStaffToast = new Toast('updateStaff');
    const queryClient = useQueryClient();
    const DItem = Descriptions.Item;
    // const resendEmailVerificationToast = new Toast('Resend Email Verification');
    const updateStaffStatusToast = new Toast('Update Staff Status');
    const deleteStaffToast = new Toast('Delete Staff');
    const restoreStaffToast = new Toast('Restore Staff');
    const updateStaffRoleToast = new Toast('updateStaffRole');
    const [roleId, setRoleId] = useState<string>('');
    const [isRoleOpenModal, setIsRoleOpenModal] = useState<boolean>(false);
    const [changeStaffRoleReasonForm] = Form.useForm();

    useEffect(() => {
        if (staff) {
            staffForm.setFieldsValue({
                ...staff,
                dateOfBirth: dayjs(staff.dateOfBirth),
                joinDate: dayjs(staff.joinDate),
            });
            setRoleId(staff.roleId);
        }
    }, [staff]);

    const roleQuery = useQuery({
        queryKey: ['role', 'data'],
        queryFn: async () => {
            const res = await getRoleData();
            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const updateStaffMutation = useMutation({
        mutationFn: async (staffData: Staff & { reason: string }) => {
            updateStaffToast.loading(t('messages:loading.updatingStaff'));
            const res = await updateStaff(staffId, staffData);

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            updateStaffToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            staffForm.resetFields(['reason']);
            updateStaffToast.update('success', t('messages:success.staffUpdated'));
            queryClient.invalidateQueries(['staff'], { exact: true });
        },
    });

    const updateStaffStatusMutation = useMutation({
        mutationFn: async ({ status, reason }: { status: boolean; reason: string }) => {
            updateStaffStatusToast.loading(staff?.active ? t('messages:loading.deactivatingStudent') : t('messages:loading.activatingStudent'));
            const res = await updateStaffStatus(staffId as string, {
                status,
                reason,
            });

            return res;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            updateStaffStatusToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: (data, inputData) => {
            updateStaffStatusToast.update(
                'success',
                inputData.status ? t('messages:success.staffActivated') : t('messages:success.staffDeactivated')
            );
            staffQuery.refetch();
        },
    });

    const deleteStaffMutation = useMutation({
        mutationFn: async (reason: string) => {
            deleteStaffToast.loading(t('messages:loading.deletingStudent'));
            const res = await deleteStaff(staffId as string, {
                reason,
            });

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            deleteStaffToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            deleteStaffToast.update('success', t('messages:success.staffDeleted'), () => restoreStaffMutation.mutate(staffId as string));
            router.push('/staff');
            queryClient.invalidateQueries(['staff'], { exact: true });
        },
    });

    const restoreStaffMutation = useMutation({
        mutationFn: async (staffId: string) => {
            restoreStaffToast.loading(t('messages:loading.restoringTutor'));
            const res = await restoreStaff(staffId);

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            restoreStaffToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            restoreStaffToast.update('success', t('messages:success.staffRestored'));
            queryClient.refetchQueries(['staff', 'pagination']);
        },
    });

    const updateStaffRoleMutation = useMutation({
        mutationFn: async (values: { reason: string; roleId: string }) => {
            updateStaffRoleToast.loading(t('messages:loading.updatingStaffRole'));
            const res = await updateStaffRole(staffId as string, values);
            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            setRoleId(staff?.roleId as string);
            updateStaffRoleToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            updateStaffRoleToast.update('success', t('messages:success.staffRoleUpdated'));
            setIsRoleOpenModal(false);
            changeStaffRoleReasonForm.resetFields();
        },
    });

    const onUpdateStaffHandler = (reason: string) => {
        staffForm.validateFields().then(async (values) => {
            updateStaffMutation.mutate({ ...values, reason });
        });
    };

    const onRoleChangeHandler = (roleId: string) => {
        setRoleId(roleId);
        setIsRoleOpenModal(true);
    };

    const onCloseHandler = () => {
        setIsRoleOpenModal(false);
        setRoleId(staff?.roleId as string);
    };

    const onSubmitHandler = () => {
        changeStaffRoleReasonForm.validateFields().then((values) => {
            updateStaffRoleMutation.mutate({ reason: values.reason, roleId });
        });
    };

    const roleSelection =
        (roleQuery.data || []).map((role: { name: string; id: string }) => ({
            label: role.name,
            value: role.id,
        })) ?? [];

    const genderList = [
        {
            label: t('Male'),
            value: 'male',
        },
        {
            label: t('Female'),
            value: 'female',
        },
    ];
    return (
        <Spin spinning={updateStaffMutation.isLoading}>
            {staff && (
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:basis-[300px] lg:order-2 order-2 px-2">
                        <Card className="sticky top-5">
                            <Descriptions layout="vertical" title={t('staffProfile')} size="small" column={1}>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('staffId')}>
                                    {staff.code}
                                </DItem>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('email')}>
                                    {staff.email}
                                </DItem>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('role')}>
                                    <Select value={roleId} className="w-full" options={roleSelection} showSearch onChange={onRoleChangeHandler} />
                                </DItem>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('status')}>
                                    <StaffStatus user={staff} />
                                </DItem>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('lastActive')}>
                                    {dayjs(staff.lastActive).format('D MMM YYYY, hh:mm A')}
                                </DItem>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('common:action')}>
                                    <div className="flex flex-col w-full max-w-[300px] gap-2">
                                        {/* {(dayjs(staff.tokenExpiredAt).isBefore(dayjs()) ||
                                            (staff.tokenExpiredAt && dayjs(staff.tokenExpiredAt).isBefore(dayjs()))) && (
                                            <ConfirmationModal
                                                message={t('sendEmailVerificationConfirmation')}
                                                okText={t('update')}
                                                onOk={(reason) => () => resendEmailVerificationMutation.mutate(reason)}
                                                reason
                                            >
                                                <Button type="primary">{t('resendEmailVerification')}</Button>
                                            </ConfirmationModal>
                                        )} */}
                                        {permissions.STAFF_UPDATE && (
                                            <ConfirmationModal
                                                message={staff.active ? t('deactivateStaffConfirmation') : t('activateStaffConfirmation')}
                                                okText={staff.active ? t('deactivate') : t('activate')}
                                                okButtonProps={{
                                                    danger: staff.active,
                                                }}
                                                onOk={(reason) =>
                                                    updateStaffStatusMutation.mutate({
                                                        reason,
                                                        status: !staff.active,
                                                    })
                                                }
                                                reason
                                            >
                                                <Button block type={staff.active ? 'default' : 'primary'} danger={staff.active}>
                                                    {staff.active ? t('deactivate') : t('activate')}
                                                </Button>
                                            </ConfirmationModal>
                                        )}
                                        {permissions.STAFF_DELETE && (
                                            <ConfirmationModal
                                                message={t('deleteStaffConfirmation')}
                                                okText={t('delete')}
                                                okButtonProps={{
                                                    danger: true,
                                                }}
                                                onOk={(reason) => deleteStaffMutation.mutate(reason)}
                                                reason
                                            >
                                                <Button block type="primary" danger>
                                                    {t('delete')}
                                                </Button>
                                            </ConfirmationModal>
                                        )}
                                    </div>
                                </DItem>
                            </Descriptions>
                        </Card>
                        <Modal open={isRoleOpenModal} onCancel={onCloseHandler} footer={null} title={t('changeRoleConfirmation')}>
                            <label>
                                <b>{t('reason')}:</b>
                            </label>
                            <Form form={changeStaffRoleReasonForm}>
                                <Form.Item name="reason" rules={[{ required: false }]} className="!w-full">
                                    <TextArea rows={4} className="!resize-none mt-2 !w-full" />
                                </Form.Item>
                            </Form>

                            <div className="text-end">
                                <Button type="primary" htmlType="submit" onClick={onSubmitHandler}>
                                    {t('submit')}
                                </Button>
                            </div>
                        </Modal>
                    </div>
                    <div className="order-2 w-full px-2 mt-10 lg:mt-0 lg:flex-1 lg:order-1">
                        <Form form={staffForm} layout="vertical" title="Staff Form">
                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item
                                        label={t('englishName')}
                                        name="englishName"
                                        rules={[
                                            { required: true },
                                            {
                                                min: 4,
                                                message: t('messages:error.string too short', {
                                                    label: '${label}',
                                                    min: '4',
                                                }) as string,
                                            },
                                            {
                                                max: 20,
                                                message: t('messages:error.string too long', {
                                                    label: '${label}',
                                                    max: '20',
                                                }) as string,
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item
                                        label={t('chineseName')}
                                        name="chineseName"
                                        rules={[
                                            { required: false },
                                            {
                                                min: 2,
                                                message: t('messages:error.string too short', {
                                                    label: '${label}',
                                                    min: '2',
                                                }) as string,
                                            },
                                            {
                                                max: 12,
                                                message: t('messages:error.string too long', {
                                                    label: '${label}',
                                                    max: '12',
                                                }) as string,
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('dateOfBirth')} name="dateOfBirth" rules={[{ required: true }]}>
                                        <DatePicker className="w-full" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('nationality')} name="nationality" rules={[{ required: true }]}>
                                        <Select allowClear showSearch options={mappedCountryList} placeholder="Please Select" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('gender')} name="gender" rules={[{ required: true }]}>
                                        <Select options={genderList} placeholder="Please Select" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('joinDate')} name="joinDate" rules={[{ required: true }]}>
                                        <DatePicker className="w-full" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('phoneNumber')} name="phoneNumber" rules={[{ required: true }]}>
                                        <PhoneInput country="hk" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={24}>
                                    <Form.Item label={t('address')} name="address" rules={[{ required: true }]}>
                                        <Input.TextArea rows={3} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={24}>
                                    <Form.Item label={t('remarks')} name="remarks">
                                        <Input.TextArea rows={3} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            {permissions.STAFF_UPDATE && (
                                <div className="flex justify-end">
                                    <ConfirmationModal
                                        message={t('updateStaffConfirmation')}
                                        okText={t('updateStaff')}
                                        okButtonProps={{
                                            danger: false,
                                        }}
                                        reason
                                        onOk={(reason: string) => onUpdateStaffHandler(reason)}
                                    >
                                        <Button type="primary">{t('updateStaff')}</Button>
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
