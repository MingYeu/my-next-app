import { Dispatch, SetStateAction } from 'react';
import { Avatar, Divider, Dropdown, notification } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import Link from 'next/link';

import { stringAvatar, stringToColor } from '@/lib/helperFunctions';
import axios from 'axios';
import { logout } from '@/services/auth';
// import Notification from './Notification';

interface HeaderAttributes {
    name: string;
    collapsed: boolean;
    unreadMessage: number;
    staffId: string;
    setCollapsed: Dispatch<SetStateAction<boolean>>;
}

const CustomHeader: React.FC<HeaderAttributes> = ({ name, collapsed, setCollapsed, unreadMessage, staffId }) => {
    const { t } = useTranslation(['layout', 'common']);
    const router = useRouter();

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await logout();
        },
        onError: (error: Error) => {
            notification.error({
                message: t('common:Oh no! Something Went Wrong'),
                description: t(error.message as string),
            });
        },
        onSuccess: () => {
            router.push('/');
        },
    });

    return (
        <div className="flex justify-between px-5">
            <div onClick={() => setCollapsed(!collapsed)} className="cursor-pointer">
                {collapsed ? <MenuUnfoldOutlined className="text-2xl" /> : <MenuFoldOutlined className="text-2xl" />}
            </div>
            <div className="flex items-center justify-center">
                <div className="flex items-center justify-center col-row">
                    {/* <div>
                        <Notification unreadMessages={unreadMessage} staffId={staffId} />
                    </div> */}
                    <div className="mx-3">
                        <span className="font-semibold">{name}</span>
                    </div>
                    <Dropdown
                        trigger={['click']}
                        dropdownRender={() => {
                            return (
                                <div className="flex flex-col p-3 bg-white rounded-md shadow-md">
                                    {/* <LanguageSwitcher /> */}
                                    {/* <Divider className="my-0" /> */}
                                    {/* <Link href="/myProfile" className="leading-[normal]">
                                        <div className="py-2 pl-3 mt-1 duration-100 hover:bg-slate-100 rounded-[4px] cursor-pointer">
                                            {t('My Profile')}
                                        </div>
                                    </Link> */}
                                    <div
                                        className=" min-w-[130px] w-full text-center bg-red-600 rounded-[4px] hover:bg-red-700 duration-100 py-2 mt-2 cursor-pointer leading-[normal]"
                                        onClick={() => {
                                            logoutMutation.mutate();
                                        }}
                                    >
                                        <a className="text-white hover:text-white ">{t('Logout')}</a>
                                    </div>
                                </div>
                            );
                        }}
                    >
                        <div className="cursor-pointer">
                            <Avatar style={{ backgroundColor: stringToColor(name) }} size={35} className="flex items-center">
                                {stringAvatar(name)}
                            </Avatar>
                        </div>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
};

export default CustomHeader;
