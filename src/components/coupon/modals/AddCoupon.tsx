import { Button, Col, DatePicker, Divider, Form, FormInstance, Input, InputNumber, Modal, Row, Select, message } from 'antd';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction } from 'react';
import 'react-phone-input-2/lib/style.css';

interface AddCouponModalProps {
    form: FormInstance;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    onCreate: () => void;
    loading: boolean;
}

const AddCoupon: React.FC<AddCouponModalProps> = ({ form, open, setOpen, onCreate, loading }) => {
    const { t } = useTranslation(['coupon', 'common', 'messages']);

    const onModalCancel = () => {
        setOpen(false);
    };

    const onCreateCouponHandler = () => {
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
        <Modal open={open} onCancel={onModalCancel} title={t('addCoupon')} width={1000} footer={null} centered>
            <Form form={form} name="Create Coupon Form" layout="vertical">
                <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('code')} name="code" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('cost')} name="cost" rules={[{ required: true }]}>
                            <InputNumber min={0} precision={2} placeholder="Enter Cost" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('type')} name="type">
                            <Select options={activeList} placeholder="Please Select" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('startDate')} name="startDate">
                            <DatePicker className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item label={t('endDate')} name="endDate">
                            <DatePicker className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Form.Item label={t('description')} name="description">
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    </Col>
                </Row>
                <div className="flex justify-end gap-3">
                    <Button onClick={onModalCancel}>{t('common:Cancel')}</Button>
                    <Button type="primary" onClick={onCreateCouponHandler} loading={loading} disabled={loading}>
                        {t('addCoupon')}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddCoupon;
