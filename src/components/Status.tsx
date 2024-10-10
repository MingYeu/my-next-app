import { Staff } from '@/types/staff';
import { Member } from '@/types/member';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { Package } from '@/types/package';

const Status: React.FC<{ user?: Staff | Member; packages?: Package }> = ({ user, packages }) => {
    const { t } = useTranslation(['common']);
    if (user) {
        if (!user?.tokenExpiredAt) {
            return <Tag color={user?.active ? 'green' : 'red'}>{user?.active ? t('active') : t('inactive')}</Tag>;
        }
        if (dayjs(user?.tokenExpiredAt).isBefore(dayjs())) {
            return <Tag color="red">{t('Verification Expired')}</Tag>;
        } else {
            return <Tag color="orange">{t('Verification Pending')}</Tag>;
        }
    } else if (packages) {
        return <Tag color={packages?.active ? 'green' : 'red'}>{packages?.active ? t('active') : t('inactive')}</Tag>;
    } else {
        return <Tag color="red">{t('Cant find status')}</Tag>;
    }
};

export default Status;
