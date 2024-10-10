import { Button, ButtonProps, Form, Input, Modal, Space } from 'antd';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useState, cloneElement, ReactElement, JSXElementConstructor, ReactNode } from 'react';

interface ConfirmationModalProps {
    children: ReactElement<any, string | JSXElementConstructor<any>>;
    message: ReactNode | string;
    okButtonProps?: {
        type?: ButtonProps['type'];
        danger?: ButtonProps['danger'];
    };
    okText: string;
    onOk: (reason: string, id: string) => void;
    reason?: boolean;
    id?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ children, message, okButtonProps, okText, onOk, reason = false, id }) => {
    const { t } = useTranslation(['common']);
    const [reasonForm] = Form.useForm();

    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const onCloseModalHandler = () => {
        setModalOpen(false);
        reasonForm.resetFields();
    };

    const onOkModalHandler = () => {
        reasonForm.validateFields().then((values) => {
            setModalOpen(false);
            onOk(values.reason, id ?? '');
            reasonForm.resetFields();
        });
    };

    return (
        <>
            {cloneElement(children, { onClick: () => setModalOpen(true) })}
            <Modal open={modalOpen} maskClosable={true} footer={null} onCancel={onCloseModalHandler}>
                <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                    <p>{message}</p>
                    {reason && (
                        <Form form={reasonForm} layout="vertical" name="Reason Form">
                            <Form.Item name="reason" rules={[{ required: false }]}>
                                <Input.TextArea rows={3} placeholder={t('common:reason') as string} />
                            </Form.Item>
                        </Form>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button onClick={onCloseModalHandler}>{t('cancel')}</Button>
                        <Button type="primary" onClick={onOkModalHandler} {...okButtonProps}>
                            {okText}
                        </Button>
                    </div>
                </Space>
            </Modal>
        </>
    );
};

export default ConfirmationModal;
