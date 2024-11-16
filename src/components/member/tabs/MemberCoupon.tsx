import { useQuery } from '@tanstack/react-query';
import { Spin, Tree } from 'antd';
import { useTranslation } from 'next-i18next';
import 'react-phone-input-2/lib/style.css';
import { AxiosErrorResponse } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import { toast } from 'react-toastify';
import { getMemberTreeStructure } from '@/services/member';

interface MemberCouponProps {
    memberId: string;
}

const MemberCoupon: React.FC<MemberCouponProps> = ({ memberId }) => {
    // const { t } = useTranslation(['member', 'common']);

    // const memberCouponQuery = useQuery({
    //     queryKey: ['member', 'coupon', memberId],
    //     queryFn: async () => {
    //         const res = await getMemberCoupon(memberId);
    //         return res.data;
    //     },
    //     onSuccess: (data) => {},
    //     onError: (error: AxiosErrorResponse & Error) => {
    //         toast.error(t(errorFormatter(error)));
    //     },
    // });

    return (
        // <Spin spinning={memberCouponQuery.isLoading}>
        //     <div style={{ width: '300px', margin: '20px' }}></div>
        // </Spin>
        <></>
    );
};

export default MemberCoupon;
