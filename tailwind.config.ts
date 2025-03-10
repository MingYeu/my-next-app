import type { Config } from 'tailwindcss';

const config: Config = {
    corePlugins: {
        preflight: false,
    },
    content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            screens: {
                xs: '480px',
            },
            fontFamily: {
                poppins: ['var(--font-poppins)'],
            },
        },
    },
    plugins: [],
};
export default config;
