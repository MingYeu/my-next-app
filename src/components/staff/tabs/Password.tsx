import { useMutation } from '@tanstack/react-query';
import { Button, Form, Input, Spin } from 'antd';
import { useTranslation } from 'next-i18next';
import Toast from '@/lib/Toast';
import { PasswordRules } from '@/lib/inputRules';
import { PermissionContext } from '@/providers/RoleContext';
import { useContext } from 'react';
import { updateStaffPassword } from '@/services/staff';
import { AxiosErrorResponse } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

interface PasswordTabProps {
    staffId: string;
}

const Password: React.FC<PasswordTabProps> = ({ staffId }) => {
    const { t } = useTranslation(['staff', 'common']);
    const [passwordForm] = Form.useForm();
    const updatePasswordToast = new Toast('updatePassword');
    const { permissions } = useContext(PermissionContext);

    const updatePasswordMutation = useMutation({
        mutationFn: async (passwordForm: { password: string; reason: string }) => {
            updatePasswordToast.loading(t('messages:loading.updatingPassword'));
            const res = await updateStaffPassword(staffId, passwordForm);

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            updatePasswordToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            updatePasswordToast.update('success', t('messages:success.passwordUpdated'));
        },
    });

    const onUpdateStaffPasswordHandler = (reason: string) => {
        passwordForm.validateFields().then((values) => {
            updatePasswordMutation.mutate({ ...values, reason });
        });
    };

    return (
        <Spin spinning={updatePasswordMutation.isLoading}>
            <Form form={passwordForm} layout="vertical" title="Staff Password form">
                <Form.Item label={t('newPassword')} name="password" rules={[{ required: true }, ...PasswordRules()]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    label={t('confirmPassword')}
                    name="confirmPassword"
                    rules={[
                        { required: true },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error(t('messages:error.passwordDoesNotMatch') as string));
                            },
                        }),
                    ]}
                >
                    <Input.Password />
                </Form.Item>
                {permissions.STAFF_UPDATE && (
                    <div className="flex justify-end">
                        <ConfirmationModal
                            message={t('updateStaffPasswordConfirmation')}
                            okText={t('updateStaffPassword')}
                            okButtonProps={{
                                danger: false,
                            }}
                            reason
                            onOk={(reason: string) => onUpdateStaffPasswordHandler(reason)}
                        >
                            <Button type="primary">{t('updateStaffPassword')}</Button>
                        </ConfirmationModal>
                    </div>
                )}
            </Form>
        </Spin>
    );
};

export default Password;
