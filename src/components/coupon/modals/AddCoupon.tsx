import errorFormatter from '@/lib/errorFormatter';
import { getCouponSeriesList, getMembersList } from '@/services/data';
import { AxiosErrorResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Button, Col, DatePicker, Divider, Form, FormInstance, Input, InputNumber, Modal, Row, Select, Spin, message } from 'antd';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import 'react-phone-input-2/lib/style.css';
import { toast } from 'react-toastify';

interface AddCouponModalProps {
    form: FormInstance;
    open: boolean;
    memberId?: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
    onCreate: () => void;
    loading: boolean;
}

const AddCoupon: React.FC<AddCouponModalProps> = ({ form, open, memberId, setOpen, onCreate, loading }) => {
    const { t } = useTranslation(['coupon', 'common', 'messages']);
    const [couponSeriesDebouncedKeyword, setCouponSeriesDebouncedKeyword] = useState<string>('');
    const [couponSeriesDebounceTimeout, setCouponSeriesDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [memberDebouncedKeyword, setMemberDebouncedKeyword] = useState<string>('');
    const [memberDebounceTimeout, setMemberDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    const onCouponSeriesSearchHandler = (value: string) => {
        if (couponSeriesDebounceTimeout) {
            clearTimeout(couponSeriesDebounceTimeout);
        }
        const timeout = setTimeout(() => {
            setCouponSeriesDebouncedKeyword(value);
        }, 300);
        setCouponSeriesDebounceTimeout(timeout);
    };

    const couponSeriesListQuery = useQuery({
        queryKey: ['coupon', 'series', 'list', couponSeriesDebouncedKeyword, open],
        queryFn: async () => {
            const res = await getCouponSeriesList(couponSeriesDebouncedKeyword);
            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const onMemberSearchHandler = (value: string) => {
        if (memberDebounceTimeout) {
            clearTimeout(memberDebounceTimeout);
        }
        const timeout = setTimeout(() => {
            setMemberDebouncedKeyword(value);
        }, 300);
        setMemberDebounceTimeout(timeout);
    };

    const memberListQuery = useQuery({
        queryKey: ['members', 'list', memberDebouncedKeyword, memberId, open],
        queryFn: async () => {
            const res = await getMembersList({ debouncedKeyword: memberDebouncedKeyword, memberId: memberId });
            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const onModalCancel = () => {
        form.resetFields();
        setOpen(false);
    };

    const onCreateCouponHandler = () => {
        onCreate();
    };

    return (
        <Spin spinning={memberListQuery.isLoading}>
            <Modal
                open={open}
                onCancel={onModalCancel}
                title={t('Add Coupon')}
                width={1000}
                footer={null}
                centered
                afterOpenChange={(isOpen) => {
                    if (isOpen) {
                        form.resetFields();
                    }
                }}
            >
                <Form
                    form={form}
                    name="Create Coupon Form"
                    layout="vertical"
                    initialValues={{ memberId: memberId, memberName: !!memberId ? memberListQuery.data?.[0]?.englishName : undefined }}
                >
                    <Row gutter={[16, 0]}>
                        <Col xs={24} sm={12} md={12} lg={8}>
                            <Form.Item label={t('Code')} name="code" rules={[{ required: true }]}>
                                <Select
                                    placeholder={t('Please Select')}
                                    showSearch
                                    filterOption={false}
                                    onSearch={onCouponSeriesSearchHandler}
                                    loading={couponSeriesListQuery.isFetching}
                                    allowClear
                                    onSelect={(value) => {
                                        const selectedCouponSeries = couponSeriesListQuery?.data?.find((couponSeries) => couponSeries.id === value);
                                        if (selectedCouponSeries) {
                                            form.setFieldsValue({
                                                startNumber: selectedCouponSeries.count + 1,
                                            });
                                        }

                                        setCouponSeriesDebouncedKeyword('');
                                    }}
                                    onBlur={() => setCouponSeriesDebouncedKeyword('')}
                                    options={
                                        couponSeriesListQuery?.data && !couponSeriesListQuery.isFetching
                                            ? couponSeriesListQuery.data.map((couponSeries) => ({
                                                  label: `${couponSeries.name}`,
                                                  value: couponSeries.id,
                                              }))
                                            : []
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={8}>
                            <Form.Item label={t('Start Number')} name="startNumber" rules={[{ required: true }]}>
                                <InputNumber min={0} placeholder="Please Enter" className="w-full" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={8}>
                            <Form.Item label={t('End Number')} name="endNumber" rules={[{ required: true }]}>
                                <InputNumber min={0} placeholder="Please Enter" className="w-full" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={8}>
                            <Form.Item label={t('Member Phone')} name="memberId">
                                <Select
                                    placeholder={t('Please Select')}
                                    showSearch
                                    filterOption={false}
                                    onSearch={onMemberSearchHandler}
                                    loading={memberListQuery.isFetching}
                                    allowClear
                                    disabled={!!memberId}
                                    onSelect={(value) => {
                                        const selectedMember = memberListQuery.data?.find((member) => member.id === value);

                                        if (selectedMember) {
                                            form.setFieldsValue({
                                                memberName: selectedMember.englishName,
                                            });
                                        }
                                        setMemberDebouncedKeyword('');
                                    }}
                                    onBlur={() => setMemberDebouncedKeyword('')}
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
                            <Form.Item label={t('Member Name')} name="memberName">
                                <Input disabled />
                            </Form.Item>
                        </Col>{' '}
                        <Col xs={24} sm={24} md={24} lg={24}>
                            <Form.Item label={t('Description')} name="description">
                                <Input.TextArea rows={3} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <div className="flex justify-end gap-3">
                        <Button onClick={onModalCancel}>{t('common:Cancel')}</Button>
                        <Button type="primary" onClick={onCreateCouponHandler} loading={loading} disabled={loading}>
                            {t('Add Coupon')}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </Spin>
    );
};

export default AddCoupon;
