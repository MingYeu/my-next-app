import { SettingOutlined } from '@ant-design/icons';
import { Button, Checkbox, Modal, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Dispatch, SetStateAction, useState } from 'react';

interface CheckboxOptions {
    label: string;
    value: string;
}

interface ColumnSelectorAttributes {
    options: CheckboxOptions[];
    column: string[];
    setColumn: Dispatch<SetStateAction<string[]>>;
}

const ColumnSelector: React.FC<ColumnSelectorAttributes> = ({ options, column, setColumn }) => {
    const { t } = useTranslation(['columnSelector', 'common']);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    return (
        <>
            <Tooltip title={t('common:Table Column Selector')}>
                <SettingOutlined
                    onClick={() => {
                        setIsModalOpen(true);
                    }}
                    className="!text-xl cursor-pointer"
                />
            </Tooltip>
            <Modal
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                }}
                footer={null}
                title={t('common:Table Column Selector')}
                width={700}
            >
                <Checkbox.Group
                    className="grid justify-center grid-cols-1 gap-2 py-4 mt-5 xs:grid-cols-2 sm:grid-cols-3"
                    options={options}
                    onChange={(checkedValue) => {
                        setColumn(checkedValue as string[]);
                    }}
                    defaultValue={column}
                ></Checkbox.Group>
                <div className="flex justify-end mt-2">
                    <Button
                        onClick={() => {
                            setIsModalOpen(false);
                        }}
                    >
                        {t('common:Cancel')}
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default ColumnSelector;
