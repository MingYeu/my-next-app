import mappedCountryList from '@/lib/countryList';
import errorFormatter from '@/lib/errorFormatter';
import { getMembersList, getPackageData } from '@/services/data';
import { AxiosErrorResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Button, Col, DatePicker, Divider, Form, FormInstance, Input, Modal, Row, Select, message } from 'antd';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import 'react-phone-input-2/lib/style.css';
import { toast } from 'react-toastify';

interface AddPointModalProps {
    form: FormInstance;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    onCreate: () => void;
    loading: boolean;
}

const AddPoint: React.FC<AddPointModalProps> = ({ form, open, setOpen, onCreate, loading }) => {
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

    const memberListQuery = useQuery({
        queryKey: ['members', 'list', debouncedKeyword],
        queryFn: async () => {
            const res = await getMembersList({ debouncedKeyword });
            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const onModalCancel = () => {
        setOpen(false);
    };

    const onCreateMemberPointHandler = () => {
        onCreate();
    };

    return (
        <Modal open={open} onCancel={onModalCancel} title={t('addPoint')} width={1000} footer={null} centered>
            <Form form={form} name="Create Member Point Form" layout="vertical">
                <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item label={t('phoneNumber')} name="phoneNumber">
                            <Select
                                placeholder={t('Please Select')}
                                showSearch
                                filterOption={false}
                                onSearch={onSearchHandler}
                                loading={memberListQuery.isFetching}
                                onSelect={(value) => {
                                    const selectedMember = memberListQuery.data?.find((member) => member.id === value);

                                    if (selectedMember) {
                                        form.setFieldsValue({
                                            englishName: selectedMember.englishName,
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
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('englishName')} name="englishName" rules={[{ required: true }]}>
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Divider orientation="left">{t('addPoint')}</Divider>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('point')} name="point" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('invoiceNo')} name="invoiceNo" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <div className="flex justify-end gap-3">
                    <Button onClick={onModalCancel}>{t('common:Cancel')}</Button>
                    <Button type="primary" onClick={onCreateMemberPointHandler} loading={loading} disabled={loading}>
                        {t('addMemberPoint')}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddPoint;
