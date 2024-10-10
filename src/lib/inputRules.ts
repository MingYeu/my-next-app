import { Rule } from 'antd/es/form';
import { useTranslation } from 'next-i18next';

/*
Password Validation
- minimum 8 characters
- at least 1 uppercase
- at least 1 lowercase
- at least 1 digit
- at least 1 special character
*/
export const PasswordRules = () => {
    const { t } = useTranslation(['messages']);

    return [
        {
            validator: (_, value) => {
                const error = [];
                if (value.length < 8) {
                    error.push(new Error(t('error.Password must be at least 8 characters') as string));
                }
                if (!/[A-Z]/.test(value)) {
                    error.push(new Error(t('error.Password must contain at least 1 uppercase letter') as string));
                }
                if (!/[a-z]/.test(value)) {
                    error.push(new Error(t('error.Password must contain at least 1 lowercase letter') as string));
                }
                if (!/[0-9]/.test(value)) {
                    error.push(new Error(t('error.Password must contain at least 1 digit') as string));
                }
                if (!/[^A-Za-z0-9]/.test(value)) {
                    error.push(new Error(t('error.Password must contain at least 1 special character') as string));
                }
                if (error.length > 0) {
                    return Promise.reject(error);
                }
                return Promise.resolve();
            },
        },
    ] as Rule[];
};
