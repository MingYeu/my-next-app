import { AiOutlineUser, AiOutlineForm, AiOutlineMail, AiOutlineDatabase } from 'react-icons/ai';
import { MdAttachMoney } from 'react-icons/md';
import { Menu } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { PieChartOutlined } from '@ant-design/icons';
import { TbHierarchy3 } from 'react-icons/tb';
import { SiCoursera } from 'react-icons/si';
import { CgProfile } from 'react-icons/cg';
import { Staff } from '@/types/staff';
import { SlCalender } from 'react-icons/sl';
import { IoSettingsSharp } from 'react-icons/io5';
import { RiFilePaper2Line } from 'react-icons/ri';
import { TbReceipt2 } from 'react-icons/tb';

interface CustomMenuProps {
    staff: Staff;
    activeMenu: string[];
    activeDropdown: string[];
}

const CustomMenu: React.FC<CustomMenuProps> = ({ staff, activeMenu, activeDropdown }) => {
    const { t } = useTranslation(['layout']);
    const router = useRouter();
    const [selectedKeys, setSelectedKeys] = useState<string[]>(activeMenu);
    const [openKeys, setOpenKeys] = useState<string[]>(activeDropdown);

    const onSelectMenuHandler = (menu: string, path: string) => {
        setSelectedKeys([menu]);
        router.push(path);
    };

    const onSelectDropdownMenuHandler = (menu: { key: string }) => {
        if (openKeys.includes(menu.key)) {
            setOpenKeys(openKeys.filter((key) => key !== menu.key));
        } else {
            setOpenKeys([...openKeys, menu.key]);
        }
    };

    const menuItems = [
        {
            key: 'dashboard',
            label: t('menu.Dashboard'),
            icon: <PieChartOutlined className="!text-base" />,
            onClick: () => onSelectMenuHandler('dashboard', '/dashboard'),
        },
        // {
        //     key: 'userManagement',
        //     label: t('menu.UserManagement'),
        //     icon: <AiOutlineUser className="!text-base" />,
        //     onTitleClick: onSelectDropdownMenuHandler,
        //     children: [
        //         {
        //             key: 'staff',
        //             label: t('menu.Staff'),
        //             onClick: () => onSelectMenuHandler('staff', '/staff'),
        //         },

        //         {
        //             key: 'member',
        //             label: t('menu.Member'),
        //             onClick: () => onSelectMenuHandler('member', '/member'),
        //         },
        //     ],
        // },
        {
            key: 'staff',
            label: t('menu.Staff'),
            icon: <AiOutlineUser className="!text-base" />,
            onClick: () => onSelectMenuHandler('staff', '/staff'),
        },
        {
            key: 'member',
            label: t('menu.Member'),
            icon: <AiOutlineUser className="!text-base" />,
            onClick: () => onSelectMenuHandler('member', '/member'),
        },
        {
            key: 'package',
            label: t('menu.Package'),
            icon: <SiCoursera className="!text-base" />,
            onClick: () => onSelectMenuHandler('package', '/package'),
        },
        {
            key: 'coupon',
            label: t('menu.Coupon'),
            icon: <SiCoursera className="!text-base" />,
            onClick: () => onSelectMenuHandler('coupon', '/coupon'),
        },
        // {
        //     key: 'role',
        //     label: t('menu.Role'),
        //     icon: <TbHierarchy3 className="!text-base" />,
        //     onClick: () => onSelectMenuHandler('role', '/role'),
        // },
        {
            key: 'database',
            label: t('menu.Database'),
            icon: <AiOutlineDatabase className="!text-base" />,
            onClick: () => onSelectMenuHandler('database', '/database'),
        },
        {
            key: 'settings',
            label: t('menu.Settings'),
            type: 'group',
        },
        {
            key: 'myProfile',
            label: t('menu.MyProfile'),
            icon: <CgProfile className="!text-base" />,
            onClick: () => onSelectMenuHandler('myProfile', '/myProfile'),
        },
        // {
        //     key: 'siteSetting',
        //     label: t('menu.siteSetting'),
        //     icon: <IoSettingsSharp className="!text-base" />,
        //     onClick: () => onSelectMenuHandler('siteSetting', '/site-setting'),
        // },
    ];

    return <Menu theme="light" mode="inline" defaultOpenKeys={openKeys} defaultSelectedKeys={selectedKeys} items={menuItems} />;
};

export default CustomMenu;
