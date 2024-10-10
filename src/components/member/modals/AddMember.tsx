import mappedCountryList from '@/lib/countryList';
import errorFormatter from '@/lib/errorFormatter';
import { getPackageData } from '@/services/data';
import { AxiosErrorResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Button, Col, DatePicker, Divider, Form, FormInstance, Input, Modal, Row, Select, message } from 'antd';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction } from 'react';
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

    const onModalCancel = () => {
        setOpen(false);
    };

    const onCreateMemberHandler = () => {
        onCreate();
    };

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
        <Modal open={open} onCancel={onModalCancel} title={t('addMember')} width={1000} footer={null} centered>
            <Form form={form} name="Create Member Form" layout="vertical">
                <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            label={t('email')}
                            name="email"
                            rules={[
                                { required: true },
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
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item label={t('package')} name="packages">
                            <Select options={packageSelection} placeholder="Please Select" />
                            {/* <Select value={roleId} className="w-full" options={roleSelection} showSearch onChange={onRoleChangeHandler} /> */}
                        </Form.Item>
                    </Col>
                </Row>
                <Divider orientation="left">{t('memberProfile')}</Divider>
                <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item
                            label={t('englishName')}
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
                    <Col xs={24} sm={12} md={12} lg={8}>
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
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('dateOfBirth')} name="dateOfBirth" rules={[{ required: true }]}>
                            <DatePicker className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('nationality')} name="nationality" rules={[{ required: true }]}>
                            <Select allowClear showSearch options={mappedCountryList} placeholder="Please Select" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('gender')} name="gender" rules={[{ required: true }]}>
                            <Select options={genderList} placeholder="Please Select" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('joinDate')} name="joinDate" rules={[{ required: true }]}>
                            <DatePicker className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('phoneNumber1')} name="phoneNumber1" rules={[{ required: true }]}>
                            <PhoneInput country="my" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('phoneNumber2')} name="phoneNumber2">
                            <PhoneInput country="my" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item label={t('address1')} name="address1">
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item label={t('address2')} name="address2">
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item label={t('address3')} name="address3">
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item label={t('remarks')} name="remarks">
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    </Col>
                </Row>
                <div className="flex justify-end gap-3">
                    <Button onClick={onModalCancel}>{t('common:Cancel')}</Button>
                    <Button type="primary" onClick={onCreateMemberHandler} loading={loading} disabled={loading}>
                        {t('addMember')}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddMember;
