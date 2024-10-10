import { STAFF_AUTH_TOKEN } from '@/config';
import roles from '@/data/role';
import { authenticationStaff } from '@/services/auth';
import { IncomingMessage } from 'http';

export const authentication = async (
    req: IncomingMessage & {
        cookies: Partial<{
            [key: string]: string;
        }>;
    },
    permission?: (typeof roles)[number]
) => {
    const token = req.cookies[STAFF_AUTH_TOKEN];

    if (!token) {
        throw new Error('token not found');
    }

    const response = await authenticationStaff({
        token: token ? token : '',
        permission: permission ? permission : '',
    });

    var result = response.data;

    return result;
};
