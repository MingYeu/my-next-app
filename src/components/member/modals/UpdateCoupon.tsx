import mappedCountryList from '@/lib/countryList';
import errorFormatter from '@/lib/errorFormatter';
import { getCouponsList, getMembersList, getPackageData } from '@/services/data';
import { AxiosErrorResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Button, Col, DatePicker, Divider, Form, FormInstance, Input, Modal, Row, Select, SelectProps, message } from 'antd';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { toast } from 'react-toastify';

interface UpdateCouponModalProps {
    form: FormInstance;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    onCreate: () => void;
    loading: boolean;
}

const UpdateCoupon: React.FC<UpdateCouponModalProps> = ({ form, open, setOpen, onCreate, loading }) => {
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
            const res = await getMembersList(debouncedKeyword);
            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const couponListQuery = useQuery({
        queryKey: ['coupons', 'list', debouncedKeyword],
        queryFn: async () => {
            const res = await getCouponsList(debouncedKeyword);
            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const onModalCancel = () => {
        setOpen(false);
    };

    const onUpdateMemberCouponHandler = () => {
        onCreate();
    };

    return (
        <Modal open={open} onCancel={onModalCancel} title={t('usedMemberCoupon')} width={1000} footer={null} centered>
            <Form form={form} name="Update Member Coupon" layout="vertical">
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
                    <Divider orientation="left">{t('used coupon')}</Divider>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('couponList')} name="couponList" rules={[{ required: true }]}>
                            <Select
                                mode="multiple"
                                allowClear
                                style={{ width: '100%' }}
                                placeholder="Please select"
                                onChange={(value) => {
                                    const selectedCoupons = couponListQuery.data?.filter((coupon) => value.includes(coupon.id));
                                    const totalCost = selectedCoupons?.reduce((acc, coupon) => acc + coupon.cost, 0);

                                    form.setFieldsValue({
                                        totalCost: totalCost ? totalCost : 0,
                                    });
                                }}
                                options={
                                    couponListQuery?.data && !couponListQuery.isFetching
                                        ? couponListQuery.data.map((coupon) => ({
                                              label: `${coupon.code}`,
                                              value: coupon.id,
                                          }))
                                        : []
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('totalCost')} name="totalCost" rules={[{ required: true }]}>
                            <Input disabled type="number" />
                        </Form.Item>
                    </Col>
                </Row>
                <div className="flex justify-end gap-3">
                    <Button onClick={onModalCancel}>{t('common:Cancel')}</Button>
                    <Button type="primary" onClick={onUpdateMemberCouponHandler} loading={loading} disabled={loading}>
                        {t('usedCoupon')}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default UpdateCoupon;
