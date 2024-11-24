import errorFormatter from '@/lib/errorFormatter';
import { getCouponsList, getMembersList, getPackageData } from '@/services/data';
import { AxiosErrorResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Button, Col, Divider, Form, FormInstance, Input, InputNumber, Modal, Row, Select, SelectProps, message } from 'antd';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import 'react-phone-input-2/lib/style.css';
import { toast } from 'react-toastify';

interface MemberTransactionModalProps {
    form: FormInstance;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    onCreate: () => void;
    loading: boolean;
}

const MemberTransaction: React.FC<MemberTransactionModalProps> = ({ form, open, setOpen, onCreate, loading }) => {
    const { t } = useTranslation(['member', 'common', 'messages']);
    const [memberDebouncedKeyword, setMemberDebouncedKeyword] = useState<string>('');
    const [couponDebouncedKeyword, setCouponDebouncedKeyword] = useState<string>('');
    const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
    // const [selectedCouponIds, setSelectedCouponIds] = useState([]); // Track selected coupon IDs
    // const [totalCouponCost, setTotalCouponCost] = useState(0);

    const onSearchMemberHandler = (value: string) => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        const timeout = setTimeout(() => {
            setMemberDebouncedKeyword(value);
        }, 300);
        setDebounceTimeout(timeout);
    };

    const onSearchCouponHandler = (value: string) => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        const timeout = setTimeout(() => {
            setCouponDebouncedKeyword(value);
        }, 300);
        setDebounceTimeout(timeout);
    };

    const memberListQuery = useQuery({
        queryKey: ['members', 'list', memberDebouncedKeyword, open],
        queryFn: async () => {
            const res = await getMembersList(memberDebouncedKeyword);
            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const couponListQuery = useQuery({
        queryKey: ['coupons', 'list', couponDebouncedKeyword, open],
        queryFn: async () => {
            const res = await getCouponsList(couponDebouncedKeyword);
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

    const onUpdateMemberCouponHandler = () => {
        onCreate();
    };

    // const handleCouponChange = (selectedValues: any) => {
    //     setSelectedCouponIds(selectedValues);

    //     // Calculate total cost based on currently selected coupon IDs
    //     const selectedCoupons = couponListQuery.data?.filter((coupon) => selectedValues.includes(coupon.id));

    //     const totalCost = selectedCoupons?.reduce((acc, coupon) => acc + coupon.cost, 0) || 0;

    //     setTotalCouponCost(totalCost);

    //     // Update form field with total cost
    //     form.setFieldsValue({
    //         totalCost,
    //     });
    // };
    return (
        <Modal open={open} onCancel={onModalCancel} title={t('Member Transaction')} width={1000} footer={null} centered>
            <Form form={form} name="Update Member Coupon" layout="vertical">
                <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item label={t('phoneNumber')} name="phoneNumber">
                            <Select
                                placeholder={t('Please Select')}
                                showSearch
                                filterOption={false}
                                onSearch={onSearchMemberHandler}
                                loading={memberListQuery.isFetching}
                                onSelect={(value) => {
                                    const selectedMember = memberListQuery.data?.find((member) => member.id === value);

                                    if (selectedMember) {
                                        form.setFieldsValue({
                                            englishName: selectedMember.englishName,
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
                        <Form.Item label={t('englishName')} name="englishName" rules={[{ required: true }]}>
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Divider orientation="left">{t('Used Coupon')}</Divider>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('Coupon List')} name="couponList">
                            <Select
                                mode="multiple"
                                placeholder={t('Please Select')}
                                showSearch
                                allowClear
                                filterOption={false}
                                onSearch={onSearchCouponHandler}
                                loading={couponListQuery.isFetching}
                                // onSelect={(value) => {
                                //     const selectedCoupons = couponListQuery.data?.filter((coupon) => value.includes(coupon.id));
                                //     setTotalCouponCost(selectedCoupons?.reduce((acc, coupon) => acc + coupon.cost, 0) || 0);

                                //     form.setFieldsValue({
                                //         totalCost: totalCouponCost ? totalCouponCost : 0,
                                //     });
                                // }}
                                // onChange={handleCouponChange}
                                onBlur={() => setCouponDebouncedKeyword('')}
                                options={
                                    couponListQuery?.data && !couponListQuery.isFetching
                                        ? couponListQuery.data.map((coupon) => ({
                                              label: `${coupon.code} (RM${coupon.cost})`,
                                              value: coupon.id,
                                          }))
                                        : []
                                }
                            />
                        </Form.Item>
                    </Col>
                    {/* <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('Total Cost')} name="totalCost">
                            <Input disabled type="number" />
                        </Form.Item>
                    </Col> */}
                    <Divider orientation="left">{t('Used Point')}</Divider>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('Point')} name="point">
                            <InputNumber min={0} placeholder="Please Enter" className="w-full" />
                        </Form.Item>
                    </Col>
                </Row>
                <div className="flex justify-end gap-3">
                    <Button onClick={onModalCancel}>{t('common:Cancel')}</Button>
                    <Button type="primary" onClick={onUpdateMemberCouponHandler} loading={loading} disabled={loading}>
                        {t('Submit')}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default MemberTransaction;
