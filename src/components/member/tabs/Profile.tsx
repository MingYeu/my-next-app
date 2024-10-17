import mappedCountryList from '@/lib/countryList';
import { UseQueryResult, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, DatePicker, Descriptions, Form, Input, Row, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Toast from '@/lib/Toast';
import { AxiosErrorResponse } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import { Member } from '@/types/member';
import { deleteMember, updateMember, updateMemberStatus } from '@/services/member';
import { PermissionContext } from '@/providers/RoleContext';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import MemberStatus from '@/components/Status';
import router from 'next/router';
import { toast } from 'react-toastify';
import { getMembersList, getPackageData } from '@/services/data';
import malaysiaStateList from '@/lib/stateList';

interface ProfileProps {
    memberId: string;
    memberQuery: UseQueryResult<Member | null>;
}

const Profile: React.FC<ProfileProps> = ({ memberId, memberQuery }) => {
    const { t } = useTranslation(['member', 'common']);
    const { permissions } = useContext(PermissionContext);
    const [memberForm] = Form.useForm();
    const member = memberQuery.data;
    const updateMemberToast = new Toast('updateMember');
    const queryClient = useQueryClient();
    const DItem = Descriptions.Item;
    const updateMemberStatusToast = new Toast('Update Member Status');
    const deleteMemberToast = new Toast('Delete Member');

    const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
    const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    const onSearchHandler = (value: string) => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        const timeout = setTimeout(() => {
            setDebouncedKeyword(value);
        }, 300);
        setDebounceTimeout(timeout);
    };

    const memberListQuery = useQuery({
        queryKey: ['members', 'list', debouncedKeyword],
        queryFn: async () => {
            const res = await getMembersList(debouncedKeyword);
            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    useEffect(() => {
        if (member) {
            memberForm.setFieldsValue({
                ...member,
                packages: member.member_package[0]?.packageId,
                point: member?.member_point?.point,
                dateOfBirth: dayjs(member.dateOfBirth),
                joinDate: dayjs(member.joinDate),
            });
        }
    }, [member]);

    const packageQuery = useQuery({
        queryKey: ['package', 'data'],
        queryFn: async () => {
            const res = await getPackageData();
            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const packageSelection =
        (packageQuery.data || []).map((packages: { name: string; id: string }) => ({
            label: packages.name,
            value: packages.id,
        })) ?? [];

    const updateMemberMutation = useMutation({
        mutationFn: async (memberData: Member) => {
            updateMemberToast.loading(t('messages:loading.updatingMember'));
            const res = await updateMember(memberId, memberData);

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            updateMemberToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            memberForm.resetFields(['reason']);
            updateMemberToast.update('success', t('messages:success.memberUpdated'));
            queryClient.invalidateQueries(['member'], { exact: true });

            // set referralName
            // if (memberForm.getFieldValue('referralName') !== member?.referralName) {

            // }
        },
    });

    const updateMemberStatusMutation = useMutation({
        mutationFn: async ({ status, reason }: { status: boolean; reason: string }) => {
            updateMemberStatusToast.loading(member?.active ? t('messages:loading.deactivatingStudent') : t('messages:loading.activatingStudent'));
            const res = await updateMemberStatus(memberId as string, {
                status,
                reason,
            });

            return res;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            updateMemberStatusToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: (data, inputData) => {
            updateMemberStatusToast.update(
                'success',
                inputData.status ? t('messages:success.memberActivated') : t('messages:success.memberDeactivated')
            );
            memberQuery.refetch();
        },
    });

    const deleteMemberMutation = useMutation({
        mutationFn: async (reason: string) => {
            deleteMemberToast.loading(t('messages:loading.deletingStudent'));
            const res = await deleteMember(memberId as string, {
                reason,
            });

            return res.data;
        },
        onError: (err: AxiosErrorResponse & Error) => {
            deleteMemberToast.update('error', t(errorFormatter(err)));
        },
        onSuccess: () => {
            deleteMemberToast.update('success', t('messages:success.memberDeleted'));
            router.push('/member');
            queryClient.invalidateQueries(['member'], { exact: true });
        },
    });

    const onUpdateMemberProfileHandler = (reason: string) => {
        memberForm.validateFields().then(async (values) => {
            updateMemberMutation.mutate({ ...values, reason });
        });
    };

    const genderList = [
        {
            label: t('male'),
            value: 'male',
        },
        {
            label: t('female'),
            value: 'female',
        },
    ];

    return (
        <Spin spinning={updateMemberMutation.isLoading}>
            {member && (
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:basis-[300px] lg:order-2 order-2 px-2">
                        <Card className="sticky top-5">
                            <Descriptions layout="vertical" title={t('memberProfile')} size="small" column={1}>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('memberId')}>
                                    {member.code}
                                </DItem>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('email')}>
                                    {member.email}
                                </DItem>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('status')}>
                                    <MemberStatus user={member} />
                                </DItem>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('lastActive')}>
                                    {dayjs(member.lastActive).format('D MMM YYYY, hh:mm A')}
                                </DItem>
                                <DItem contentStyle={{ marginBottom: '15px' }} label={t('common:action')}>
                                    <div className="flex flex-col w-full max-w-[300px] gap-2">
                                        {/* {(dayjs(member.tokenExpiredAt).isBefore(dayjs()) ||
                                            (member.tokenExpiredAt && dayjs(member.tokenExpiredAt).isBefore(dayjs()))) && (
                                            <ConfirmationModal
                                                message={t('sendEmailVerificationConfirmation')}
                                                okText={t('update')}
                                                onOk={(reason) => () => resendEmailVerificationMutation.mutate(reason)}
                                                reason
                                            >
                                                <Button type="primary">{t('resendEmailVerification')}</Button>
                                            </ConfirmationModal>
                                        )} */}
                                        {permissions.MEMBER_CREATE && (
                                            <ConfirmationModal
                                                message={member.active ? t('deactivateMemberConfirmation') : t('activateMemberConfirmation')}
                                                okText={member.active ? t('deactivate') : t('activate')}
                                                okButtonProps={{
                                                    danger: member.active,
                                                }}
                                                onOk={(reason) =>
                                                    updateMemberStatusMutation.mutate({
                                                        reason,
                                                        status: !member.active,
                                                    })
                                                }
                                                reason
                                            >
                                                <Button block type={member.active ? 'default' : 'primary'} danger={member.active}>
                                                    {member.active ? t('deactivate') : t('activate')}
                                                </Button>
                                            </ConfirmationModal>
                                        )}
                                        {permissions.MEMBER_DELETE && (
                                            <ConfirmationModal
                                                message={t('deleteMemberConfirmation')}
                                                okText={t('delete')}
                                                okButtonProps={{
                                                    danger: true,
                                                }}
                                                onOk={(reason) => deleteMemberMutation.mutate(reason)}
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
                    </div>
                    <div className="order-2 w-full px-2 mt-10 lg:mt-0 lg:flex-1 lg:order-1">
                        <Form form={memberForm} layout="vertical" title="Member Form">
                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('referralPhone')} name="referralPhone">
                                        <Select
                                            placeholder={t('Please Select')}
                                            showSearch
                                            filterOption={false}
                                            onSearch={onSearchHandler}
                                            loading={memberListQuery.isFetching}
                                            allowClear
                                            onSelect={(value) => {
                                                const selectedMember = memberListQuery.data?.find((member) => member.id === value);

                                                if (selectedMember) {
                                                    memberForm.setFieldsValue({
                                                        referralName: selectedMember.englishName,
                                                    });
                                                }
                                                setDebouncedKeyword('');
                                            }}
                                            onBlur={() => setDebouncedKeyword('')}
                                            options={
                                                memberListQuery?.data && !memberListQuery.isFetching
                                                    ? memberListQuery.data.map((member) => ({
                                                          label: `${member.phoneNumber}`,
                                                          value: member.id,
                                                      }))
                                                    : []
                                            }
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('referralName')} name="referralName">
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('package')} name="packages">
                                        <Select options={packageSelection} placeholder="Please Select" allowClear />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('point')} name="point">
                                        <Input type="number" min={0} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Form.Item label={t('idNumber')} name="idNumber" rules={[{ required: true }]}>
                                        <Input type="number" />
                                    </Form.Item>
                                </Col>
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
                                    <Form.Item label={t('state')} name="state" rules={[{ required: true }]}>
                                        <Select options={malaysiaStateList} placeholder="Please State" />
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
                                    <Form.Item label={t('address')} name="address">
                                        <Input.TextArea rows={3} />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={24} md={24} lg={24}>
                                    <Form.Item label={t('remarks')} name="remarks">
                                        <Input.TextArea rows={3} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            {permissions.MEMBER_UPDATE && (
                                <div className="flex justify-end">
                                    <ConfirmationModal
                                        message={t('updateMemberConfirmation')}
                                        okText={t('updateMember')}
                                        reason
                                        okButtonProps={{
                                            danger: false,
                                        }}
                                        onOk={(reason: string) => onUpdateMemberProfileHandler(reason)}
                                    >
                                        <Button type="primary">{t('updateMember')}</Button>
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
