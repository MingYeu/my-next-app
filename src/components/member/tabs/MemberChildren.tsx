import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Col, Form, Row, Spin, Tree } from 'antd';
import { useTranslation } from 'next-i18next';
import 'react-phone-input-2/lib/style.css';
import { AxiosErrorResponse } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import { toast } from 'react-toastify';
import { getMemberChildren, updateMemberChildren } from '@/services/member';
import AddChildrenModal from '../modals/AddChildren';
import { useContext } from 'react';
import { PermissionContext } from '@/providers/RoleContext';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import Toast from '@/lib/Toast';
import dayjs from 'dayjs';
import { MemberChildren } from '@/types/member';

interface MemberChildrenProps {
    memberId: string;
}

const MemberChildrenProfile: React.FC<MemberChildrenProps> = ({ memberId }) => {
    const { t } = useTranslation(['member', 'common']);
    const { permissions } = useContext(PermissionContext);
    const queryClient = useQueryClient();
    const [memberChildrenForm] = Form.useForm();
    const updateMemberChildrenToast = new Toast('createMember');

    const memberChildrenQuery = useQuery({
        queryKey: ['member', 'children', memberId],
        queryFn: async () => {
            const res = await getMemberChildren(memberId);
            return res.data;
        },
        onSuccess: (data) => {},
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const updateMemberChildrenMutation = useMutation({
        mutationFn: async (values: MemberChildren[]) => {
            updateMemberChildrenToast.loading(t('messages:loading.updateMemberChildren'));
            const res = await updateMemberChildren(memberId, values);

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            updateMemberChildrenToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            memberChildrenForm.resetFields(['reason']);
            updateMemberChildrenToast.update('success', t('messages:success.memberUpdated'));
            queryClient.invalidateQueries(['member', 'children', memberId], { exact: true });
        },
    });

    const onUpdateMemberChildrenHandler = (reason: string) => {
        memberChildrenForm.validateFields().then((values) => {
            updateMemberChildrenMutation.mutate({ ...values, reason });
        });
    };

    if (memberChildrenQuery.data) {
        memberChildrenForm.setFieldsValue({
            children: memberChildrenQuery.data?.map(({ name, gender, dateOfBirth, remarks }) => ({
                name,
                gender,
                dateOfBirth: dateOfBirth ? dayjs(dateOfBirth) : null,
                remarks,
            })),
        });
    }

    return (
        <Spin spinning={memberChildrenQuery.isLoading}>
            <div className="flex flex-col lg:flex-row">
                <div className="order-2 w-full px-2 mt-10 lg:mt-0 lg:flex-1 lg:order-1">
                    <Form form={memberChildrenForm} layout="vertical" title="Member Form">
                        <AddChildrenModal />
                        {permissions.MEMBER_UPDATE && (
                            <div className="flex justify-end">
                                <ConfirmationModal
                                    message={t('updateMemberConfirmation')}
                                    okText={t('updateMemberChildren')}
                                    reason
                                    okButtonProps={{
                                        danger: false,
                                    }}
                                    onOk={(reason: string) => onUpdateMemberChildrenHandler(reason)}
                                >
                                    <Button type="primary">{t('updateMemberChildren')}</Button>
                                </ConfirmationModal>
                            </div>
                        )}
                    </Form>
                </div>
            </div>
        </Spin>
    );
};

export default MemberChildrenProfile;
