module.exports = {
    i18n: {
        defaultLocale: 'en-GB',
        locales: ['en-GB', 'zh-HK', 'zh-CN'],
    },
    fallbackLng: {
        // if simplified chinese language detected, fallback to zh-CN
        'zh-CN': ['zh'],
        // if traditional chinese language detected, fallback to zh-HK
        'zh-HK': ['zh'],
        // if english language detected, fallback to en-GB
        'en-GB': ['en'],
    },
    react: { useSuspense: false },
    reloadOnPrerender: process.env.NODE_ENV === 'development',
    keySeparator: '.',
};
