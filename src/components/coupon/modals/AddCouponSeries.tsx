import { Button, Col, DatePicker, Divider, Form, FormInstance, Input, InputNumber, Modal, Row, Select, message } from 'antd';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction } from 'react';
import 'react-phone-input-2/lib/style.css';

interface AddCouponSeriesModalProps {
    form: FormInstance;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    onCreate: () => void;
    loading: boolean;
}

const AddCoupon: React.FC<AddCouponSeriesModalProps> = ({ form, open, setOpen, onCreate, loading }) => {
    const { t } = useTranslation(['coupon', 'common', 'messages']);

    const onModalCancel = () => {
        setOpen(false);
    };

    const onCreateCouponSeriesHandler = () => {
        onCreate();
    };

    const activeList = [
        {
            label: t('active'),
            value: 1,
        },
        {
            label: t('inactive'),
            value: 0,
        },
    ];

    return (
        <Modal open={open} onCancel={onModalCancel} title={t('Add Coupon Series')} width={1000} footer={null} centered>
            <Form form={form} name="Create Coupon Form" layout="vertical">
                <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('Name (symbol "$" to generate coupons)')} name="name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('Cost')} name="cost" rules={[{ required: true }]}>
                            <InputNumber min={0} precision={2} placeholder="Enter Cost" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8} />
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('Start Date')} name="startDate">
                            <DatePicker className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('End Date')} name="endDate">
                            <DatePicker className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('Period (Month)')} name="period">
                            <InputNumber min={0} placeholder="Please Enter" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item label={t('Remarks')} name="remarks">
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    </Col>
                </Row>
                <div className="flex justify-end gap-3">
                    <Button onClick={onModalCancel}>{t('common:Cancel')}</Button>
                    <Button type="primary" onClick={onCreateCouponSeriesHandler} loading={loading} disabled={loading}>
                        {t('addCouponSeries')}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddCoupon;
