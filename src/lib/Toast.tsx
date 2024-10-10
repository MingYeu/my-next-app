import { TOAST_AUTO_CLOSE } from '@/config';
import { ReactNode } from 'react';
import { useTranslation } from 'next-i18next';
import { toast, Id } from 'react-toastify';
import { Button } from 'antd';

interface UndoButtonProps {
    content: string | ReactNode;
    undo: () => void;
}

class Toast {
    private toastId: Id;

    constructor(toastId: string | number) {
        this.toastId = toastId;
    }

    UndoButton: React.FC<UndoButtonProps> = ({ content, undo }) => {
        const { t } = useTranslation(['common']);

        const onUndoHandler = (e: any) => {
            e.stopPropagation();
            e.preventDefault();
            this.dismiss();
            undo();
        };

        return (
            <div>
                <p>{content}</p>
                {/* <Button onClick={onUndoHandler} size="small" className="mt-2">
                    {t('undo')}
                </Button> */}
            </div>
        );
    };

    loading(content: string | ReactNode) {
        toast.loading(content, {
            toastId: this.toastId,
        });
    }

    update(type: 'success' | 'error' | 'info', content: string | ReactNode, undo?: () => void) {
        toast.update(this.toastId, {
            render: undo ? <this.UndoButton content={content} undo={undo} /> : <p>{content}</p>,
            type,
            isLoading: false,
            autoClose: TOAST_AUTO_CLOSE,
            closeOnClick: false,
            closeButton: true,
        });
    }

    private dismiss() {
        toast.dismiss(this.toastId);
    }
}

export default Toast;
