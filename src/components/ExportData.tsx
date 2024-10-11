import { Button } from 'antd';
import { useTranslation } from 'next-i18next';
import Icon from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { BiExport } from 'react-icons/bi';
import { useContext } from 'react';
import { PermissionContext } from '@/providers/RoleContext';

// PDF
interface ExportDataProps {
    fileName: string;
    getExportData: () => Promise<Blob>;
}

const ExportData: React.FC<ExportDataProps> = ({ fileName, getExportData }) => {
    const { t } = useTranslation(['layout', 'APIMessage']);
    const { permissions } = useContext(PermissionContext);

    /*
     * Get data to generate Csv
     ** pass a Promise to getExportData props
     */
    const getDataQuery = useQuery({
        queryKey: ['exportData'],
        queryFn: getExportData,
        enabled: false,
        onSuccess: (data) => {
            generateCsvHandler(data);
        },
    });

    /*
     * Generate Csv
     */
    const generateCsvHandler = async (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        // Create a downloadable link
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.csv`; // Set the desired file name

        // Simulate a click on the link to trigger the download
        link.click();

        // Clean up the URL object after the download is initiated
        URL.revokeObjectURL(url);
    };

    /* Execute getDataQuery */
    const exportToCsvHandler = () => {
        getDataQuery.refetch();
    };

    return (
        <div>
            {permissions.DATABASE_VIEW && (
                <Button ghost type="primary" icon={<Icon component={BiExport} />} onClick={exportToCsvHandler} loading={getDataQuery.isFetching}>
                    {t('layout:Export')}
                </Button>
            )}
        </div>
    );
};

export default ExportData;
