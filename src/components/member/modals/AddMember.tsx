import mappedCountryList from '@/lib/countryList';
import errorFormatter from '@/lib/errorFormatter';
import malaysiaStateList from '@/lib/stateList';
import { getMembersList, getPackageData } from '@/services/data';
import { AxiosErrorResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Button, Col, DatePicker, Divider, Form, FormInstance, Input, Modal, Row, Select, message } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { toast } from 'react-toastify';

interface AddMemberModalProps {
    form: FormInstance;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    onCreate: () => void;
    loading: boolean;
}

const AddMember: React.FC<AddMemberModalProps> = ({ form, open, setOpen, onCreate, loading }) => {
    const { t } = useTranslation(['member', 'common', 'messages']);
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

    const onModalCancel = () => {
        setOpen(false);
    };

    const onCreateMemberHandler = () => {
        onCreate();
    };

    const packageListQuery = useQuery({
        queryKey: ['package', 'data'],
        queryFn: async () => {
            const res = await getPackageData();
            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

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

    const packageSelection =
        (packageListQuery.data || []).map((packages: { name: string; id: string }) => ({
            label: packages.name,
            value: packages.id,
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
        <Modal open={open} onCancel={onModalCancel} title={t('Add Member')} width={1000} footer={null} centered>
            <Form form={form} name="Create Member Form" layout="vertical" initialValues={{ joinDate: dayjs() }}>
                <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('Phone Number')} name="phoneNumber" rules={[{ required: true }]}>
                            <PhoneInput country="my" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item label={t('Package')} name="packages" rules={[{ required: true }]}>
                            <Select options={packageSelection} placeholder="Please Select" />
                        </Form.Item>
                    </Col>
                    <Divider orientation="left">{t('Referral Profile')}</Divider>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item label={t('Referral Phone')} name="referralId">
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
                                        form.setFieldsValue({
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
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item label={t('Referral Name')} name="referralName">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                </Row>
                <Divider orientation="left">{t('Member Profile')}</Divider>
                <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('Code')} name="code" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('ID Number')} name="idNumber" rules={[{ required: true }]}>
                            <Input type="number" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item
                            label={t('English Name')}
                            name="englishName"
                            rules={[
                                { required: true },
                                {
                                    min: 2,
                                    message: t('messages:error.string too short', { label: '${label}', min: '2' }) as string,
                                },
                                {
                                    max: 12,
                                    message: t('messages:error.string too long', { label: '${label}', max: '12' }) as string,
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    {/* <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item
                            label={t('chineseName')}
                            name="chineseName"
                            rules={[
                                { required: false },
                                {
                                    min: 2,
                                    message: t('messages:error.string too short', { label: '${label}', min: '2' }) as string,
                                },
                                {
                                    max: 12,
                                    message: t('messages:error.string too long', { label: '${label}', max: '12' }) as string,
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col> */}
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('Date Of Birth')} name="dateOfBirth" rules={[{ required: true }]}>
                            <DatePicker className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('Nationality')} name="nationality" rules={[{ required: true }]}>
                            <Select allowClear showSearch options={mappedCountryList} placeholder="Please Select" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('State')} name="state" rules={[{ required: true }]}>
                            <Select options={malaysiaStateList} placeholder="Please State" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('Gender')} name="gender" rules={[{ required: true }]}>
                            <Select options={genderList} placeholder="Please Select" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('Join Date')} name="joinDate">
                            <DatePicker className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            label={t('Email')}
                            name="email"
                            rules={[
                                {
                                    type: 'email',
                                    message: t('messages:error.invalid', {
                                        label: '${label}',
                                    }) as string,
                                },
                            ]}
                        >
                            <Input placeholder="john@example.com" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item label={t('Address')} name="address">
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    </Col>
                </Row>
                <div className="flex justify-end gap-3">
                    <Button onClick={onModalCancel}>{t('common:Cancel')}</Button>
                    <Button type="primary" onClick={onCreateMemberHandler} loading={loading} disabled={loading}>
                        {t('Add Member')}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddMember;
