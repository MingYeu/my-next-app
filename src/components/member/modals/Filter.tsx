import React, { useState } from 'react';
import { Button, Col, Modal, Form, Input, Row, Select, message } from 'antd';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/es/form/Form';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@tanstack/react-query';
import mappedCountryList from '@/lib/countryList';
import { getRoleData } from '@/services/data';
import { AxiosErrorResponse } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import malaysiaStateList from '@/lib/stateList';
import { mappedMonthList } from '@/lib/dateList';

interface FilterAttributes {
    filterTutorForm: FormInstance;
    onReset: () => void;
    onSearch: () => void;
    loading: boolean;
}

const FilterDrawer: React.FC<FilterAttributes> = ({ filterTutorForm, onReset, onSearch, loading }) => {
    const { t } = useTranslation(['tutor', 'common']);
    const criteriaSelected = filterTutorForm.getFieldsValue();
    const criteriaCount: number = Object.values(criteriaSelected).reduce((count: number, val) => count + (val ? 1 : 0), 0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const roleQuery = useQuery({
        queryKey: ['role', 'data'],
        queryFn: async () => {
            const res = await getRoleData();

            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            message.error(t(errorFormatter(error)));
        },
    });

    const breakPoint = {
        xs: 24,
        sm: 24,
        md: 12,
        lg: 12,
    };

    const fullBreakPoint = {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 24,
    };

    const roleSelection =
        roleQuery.data?.map((role) => ({
            label: role.name,
            value: role.id,
        })) ?? [];

    const onResetHandler = () => {
        onReset();
        setIsModalOpen(false);
    };

    return (
        <div>
            <Button onClick={() => setIsModalOpen(true)} icon={<FilterOutlined />}>
                {criteriaCount > 0 && `(${criteriaCount})`} {t('common:Filter')}
            </Button>
            <Modal title={t('common:Filter')} onCancel={() => setIsModalOpen(false)} open={isModalOpen} footer={null} width={650}>
                <Form form={filterTutorForm} layout="vertical" name="filter_form" className="mt-6">
                    <Row gutter={[16, 0]}>
                        <Col {...fullBreakPoint}>
                            <Form.Item initialValue="" name="fullNameEmail">
                                <Input placeholder={t('English Name') as string} />
                            </Form.Item>
                        </Col>
                        <Col {...fullBreakPoint}>
                            <Form.Item initialValue="" name="phoneNumber">
                                <Input placeholder={t('Phone Number') as string} />
                            </Form.Item>
                        </Col>
                        <Col {...breakPoint}>
                            <Form.Item initialValue="" label={t('common:Date of Birth Month')} name="dateOfBirthMonth">
                                <Select
                                    allowClear
                                    showSearch
                                    options={[
                                        {
                                            label: t('--select-month--') as string,
                                            value: '',
                                        },
                                        ...mappedMonthList,
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col {...breakPoint}>
                            <Form.Item initialValue="" label={t('common:Status')} name="active">
                                <Select>
                                    <Select.Option value="">{t('--select-status--')}</Select.Option>
                                    <Select.Option value="true" key="true">
                                        {t('Active')}
                                    </Select.Option>
                                    <Select.Option value="false" key="false">
                                        {t('Inactive')}
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col {...breakPoint}>
                            <Form.Item initialValue="" label={t('common:Nationality')} name="nationality">
                                <Select
                                    allowClear
                                    showSearch
                                    options={[
                                        {
                                            label: t('--select-nationality--') as string,
                                            value: '',
                                        },
                                        ...mappedCountryList,
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col {...breakPoint}>
                            <Form.Item initialValue="" label={t('common:State')} name="state">
                                <Select
                                    allowClear
                                    showSearch
                                    options={[
                                        {
                                            label: t('--select-state--') as string,
                                            value: '',
                                        },
                                        ...malaysiaStateList,
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <div className="flex justify-between mt-3 gap-x-3">
                        <Button onClick={onResetHandler} loading={loading}>
                            {t('common:button.Reset')}
                        </Button>
                        <Button type="primary" onClick={onSearch} loading={loading}>
                            {t('common:button.Apply Filter')}
                            <SearchOutlined />
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default FilterDrawer;
