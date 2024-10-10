import { Button, Form, Input, Modal } from 'antd';
import { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AiOutlineLock, AiOutlineUser } from 'react-icons/ai';
import IPLogo from '../../public/images/icons/pioneer.png';
import Image from 'next/image';
import LanguageSelector from '@/components/LanguageSwitcher';
import { authentication } from '@/lib/authentication';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useState } from 'react';
import Toast from '@/lib/Toast';
import { login, requestResetPassword } from '@/services/auth';
import { AxiosErrorResponse, LoginBody } from '@/types';
import errorFormatter from '@/lib/errorFormatter';

const Login: NextPage = () => {
    const [loginForm] = Form.useForm();
    const router = useRouter();
    const { t, i18n } = useTranslation(['login', 'common', 'messages', 'APIMessage']);
    const [modalOpen, setModalOpen] = useState(false);
    const [forgotPasswordForm] = Form.useForm();
    const forgotPasswordToast = new Toast('forgotPassword');
    const currentLocale = i18n.language;

    const loginMutation = useMutation({
        mutationFn: async (values: LoginBody) => {
            const response = await login(values);

            return response.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
        onSuccess: () => {
            router.push('/dashboard');
        },
    });

    // const requestResetPasswordMutation = useMutation({
    //     mutationFn: async (values: { email: string }) => {
    //         forgotPasswordToast.loading(t('messages:loading.Loading'));
    //         const res = await requestResetPassword(values);

    //         return res.data;
    //     },
    //     onError: (error: AxiosErrorResponse & Error) => {
    //         forgotPasswordToast.update('error', t(errorFormatter(error)));
    //     },
    //     onSuccess: () => {
    //         forgotPasswordToast.update('success', t('messages:success.passwordResetLinkHasSentSuccessfully'));
    //         forgotPasswordForm.resetFields();
    //         setModalOpen(false);
    //     },
    // });

    const onLoginHandler = () => {
        loginForm.validateFields().then((values: LoginBody) => {
            loginMutation.mutate(values);
        });
    };

    const handleKeyUp = (event: any) => {
        // Enter
        if (event.keyCode === 13) {
            onLoginHandler();
        }
    };

    // const onForgotPasswordHandler = () => {
    //     forgotPasswordForm.validateFields().then(async (values: { email: string }) => {
    //         requestResetPasswordMutation.mutate(values);
    //     });
    // };

    return (
        <div className="flex items-center justify-center min-h-screen loginBackground">
            <div className="absolute top-[20px] right-[20px]">
                <LanguageSelector />
            </div>
            <div className="max-w-[500px] mx-4 w-full border-solid border-2 border-gray-200 rounded bg-white px-7 pb-10 pt-5">
                <div className="flex items-center justify-center">
                    {/* Logo */}
                    <div>
                        <Image src={IPLogo} alt="Pioneer Education" className="w-[350px] h-[200px] mb-3" />
                        <h1 className="text-center uppercase">{t('login')}</h1>
                    </div>
                </div>
                <div>
                    <Form layout="vertical" form={loginForm} name="Login Form" onKeyUp={handleKeyUp} tabIndex={0}>
                        <Form.Item label={t('staffId')} name="code" rules={[{ required: true }]}>
                            <Input size="large" prefix={<AiOutlineUser />} />
                        </Form.Item>
                        <Form.Item
                            label={t('password')}
                            name="password"
                            rules={[
                                { required: true },
                                {
                                    min: 6,
                                    message: t('messages:error.string too short', {
                                        label: '${label}',
                                        min: '6',
                                    }) as string,
                                },
                                {
                                    max: 20,
                                    message: t('messages:error.string too long', {
                                        label: '${label}',
                                        max: '20',
                                    }) as string,
                                },
                            ]}
                        >
                            <Input.Password size="large" prefix={<AiOutlineLock />} />
                        </Form.Item>
                        <Button
                            type="primary"
                            block
                            size="large"
                            className="mt-5"
                            onClick={onLoginHandler}
                            disabled={loginMutation.isLoading}
                            loading={loginMutation.isLoading}
                        >
                            {t('login')}
                        </Button>
                        {/* <div className="mt-1">
                            <a className="text-black" onClick={() => setModalOpen(true)}>
                                {t('forgotPassword')}
                            </a>
                        </div> */}
                    </Form>
                </div>
            </div>
            {/* <Modal
                title={t('forgotPassword')}
                open={modalOpen}
                onOk={onForgotPasswordHandler}
                confirmLoading={requestResetPasswordMutation.isLoading}
                onCancel={() => setModalOpen(false)}
                okText={t('button.resetPassword')}
                cancelText={t('button.cancel')}
            >
                <Form form={forgotPasswordForm} layout="vertical" className="mt-5">
                    <Form.Item label={t('email')} required name="email" rules={[{ required: true }, { type: 'email' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal> */}
        </div>
    );
};

export default Login;

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
    try {
        const res = await authentication(req);

        return {
            redirect: {
                destination: `${locale === 'en-GB' ? '/' : `/${locale}`}/dashboard`,
                permanent: false,
                locale,
            },
        };
    } catch (error) {
        return {
            props: {
                ...(await serverSideTranslations(locale as string, ['login', 'common', 'messages', 'APIMessage'])),
            },
        };
    }
};
