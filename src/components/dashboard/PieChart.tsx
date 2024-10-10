import { Card } from 'antd';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

interface CustomerPieChartAttributes {
    loading: boolean;
    title: string | ReactNode;
    config: any;
}

const PieChart = dynamic(() => import('@ant-design/plots').then(({ Pie }) => Pie), { ssr: false });

const CustomerPieChart: React.FC<CustomerPieChartAttributes> = ({ loading = false, title, config }) => {
    return (
        <Card className="!border-gray-300">
            {typeof title === 'string' ? <h4 className="text-xl font-bold mb-4">{title}</h4> : title}
            <PieChart {...config} loading={loading} />
        </Card>
    );
};

export default CustomerPieChart;
