import { useState } from 'react';
import { Select } from 'antd';
import { useRouter } from 'next/router';
import Image from 'next/image';
import unitedStatesFlagImage from '../../public/images/flags/united-states.png';
import hongKongFlagImage from '../../public/images/flags/hong-kong.png';
import chinaFlagImage from '../../public/images/flags/china.png';
import { Locale } from '@/types';

interface Locales {
    [key: string]: Locale;
}

const locales: Locales = {
    ENGLISH: 'en-GB',
    TRADITIONAL_CHINESE: 'zh-HK',
    SIMPLIFIED_CHINESE: 'zh-CN',
};

interface LanguageSwitcherProps {
    block?: boolean;
    disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSwitcherProps> = ({ block }) => {
    const router = useRouter();
    const [locale, setLocale] = useState<Locale>(
        ['en-GB', 'zh-HK', 'zh-CN'].includes(router.locale as Locale) ? (router.locale as Locale) : locales.TRADITIONAL_CHINESE
    );

    return (
        <div className={block ? 'w-full' : 'min-w-[130px] w-full'}>
            <Select
                value={locale}
                onChange={(locale) => {
                    setLocale(locale);
                    router.push(
                        {
                            pathname: router.pathname,
                            query: router.query,
                        },
                        router.asPath,
                        { locale: locale }
                    );
                }}
                className="w-full"
            >
                <Select.Option value="en-GB">
                    <div className="flex items-center">
                        <Image height={16} width={16} src={unitedStatesFlagImage} className="h-4 mr-2" alt="English" />
                        English
                    </div>
                </Select.Option>
                <Select.Option value="zh-HK">
                    <div className="flex items-center">
                        <Image height={16} width={16} src={hongKongFlagImage} className="h-4 mr-2" alt="繁体中文" />
                        繁体中文
                    </div>
                </Select.Option>
                <Select.Option value="zh-CN">
                    <div className="flex items-center">
                        <Image height={16} width={16} src={chinaFlagImage} className="h-4 mr-2" alt="简体中文" />
                        简体中文
                    </div>
                </Select.Option>
            </Select>
        </div>
    );
};

export default LanguageSelector;
