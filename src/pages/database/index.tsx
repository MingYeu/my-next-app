import Layout from '@/components/layout';
import { authentication } from '@/lib/authentication';
import { StaffPortalProps } from '@/types';
import { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Form, Select, Space } from 'antd';
import ExportData from '@/components/ExportData';
import { exportData } from '@/services/data';
import { useContext, useState } from 'react';
import { PermissionContext } from '@/providers/RoleContext';

const Index: NextPage<StaffPortalProps> = ({ staff }) => {
    const { t } = useTranslation(['database']);
    const { permissions } = useContext(PermissionContext);
    const [fileName, setFileName] = useState('');

    // Form Instances
    const [databaseForm] = Form.useForm();

    const exportCasesToCsv = async () => {
        const response = await exportData(databaseForm.getFieldsValue().table);

        const blob = new Blob([response.data]);
        return blob;
    };

    const setFileNameFunc = (values: string) => {
        setFileName(values);
    };

    const seoConfig = {
        title: t('database'),
    };

    const breadCrumbItems = [
        {
            label: t('database'),
            path: '/database',
        },
    ];

    return (
        <Layout staff={staff} activeMenu={['database']} seoConfig={seoConfig} breadCrumbItems={breadCrumbItems}>
            <Space.Compact className="w-full">
                <Form form={databaseForm} layout="vertical" name="filter_form" className="w-full">
                    <Form.Item initialValue="" name="table">
                        <Select className="w-full" onChange={setFileNameFunc}>
                            <Select.Option value="member" key="member">
                                {t('member')}
                            </Select.Option>
                            <Select.Option value="package" key="package">
                                {t('package')}
                            </Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
                {permissions.DATABASE_VIEW && <ExportData fileName={fileName} getExportData={exportCasesToCsv} />}
            </Space.Compact>
        </Layout>
    );
};

export default Index;

export const getServerSideProps: GetServerSideProps = async ({ locale, req, resolvedUrl }) => {
    try {
        const authResponse = await authentication(req, 'DATABASE_VIEW');

        if (authResponse.unauthorized) {
            return {
                redirect: {
                    destination: `${locale === 'en-GB' ? '/' : `/${locale}/`}unauthorized`,
                    permanent: false,
                },
            };
        }

        return {
            props: {
                staff: authResponse,
                ...(await serverSideTranslations(locale as string, ['package', 'APIMessage', 'database', 'layout', 'common', 'messages'])),
            },
        };
    } catch (error) {
        return {
            redirect: {
                destination: `${locale === 'en-GB' ? '/' : `/${locale}`}?redirect=${resolvedUrl}`,
                permanent: false,
            },
        };
    }
};
