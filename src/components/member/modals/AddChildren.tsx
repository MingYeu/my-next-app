import { genderList } from '@/global/options';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Modal, Row, Select } from 'antd';
import { FormInstance } from 'antd/lib';
import { useTranslation } from 'next-i18next';
const AddChildrenModal = () => {
    const { t } = useTranslation(['member', 'common']);
    return (
        <Form.List name="children">
            {(fields, { add, remove }) => (
                <>
                    {fields.map(({ key, name, ...restField }) => (
                        <div key={key} className="flex flex-col items-center">
                            <div className="w-full">
                                <Row gutter={[24, 0]}>
                                    <Col xs={24} sm={24} md={8} lg={8}>
                                        <Form.Item {...restField} name={[name, 'name']} label={t('name')} rules={[{ required: true }]}>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={8} lg={8}>
                                        <Form.Item {...restField} name={[name, 'gender']} label={t('gender')} rules={[{ required: true }]}>
                                            <Select options={genderList} placeholder="Please Select" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={8} lg={8}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'dateOfBirth']}
                                            label={t('Date Of Birth')}
                                            rules={[{ required: true }]}
                                        >
                                            <DatePicker className="w-full" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={[16, 0]}>
                                    <Col xs={24} sm={24} md={24} lg={24}>
                                        <Form.Item {...restField} name={[name, 'remarks']} label={t('Remarks')}>
                                            <Input.TextArea rows={1} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>

                            <Button danger className="ml-auto mb-5" onClick={() => remove(name)}>
                                Remove
                            </Button>
                        </div>
                    ))}
                    <Form.Item className="w-full pt-5">
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            {t('Add Child')}
                        </Button>
                    </Form.Item>
                </>
            )}
        </Form.List>
    );
};

export default AddChildrenModal;
