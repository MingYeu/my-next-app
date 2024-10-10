import { falsyRole } from '@/data/role';
import { Permissions } from '@/types/role';
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from 'react';

export type PermissionContextType = {
    permissions: Permissions;
    setPermissions: Dispatch<SetStateAction<Permissions>>;
};

export const PermissionContext = createContext<PermissionContextType>({
    permissions: falsyRole(),
    setPermissions: () => void 0,
});

type PermissionProviderProps = PropsWithChildren;

const PermissionProvider = ({ children }: PermissionProviderProps) => {
    const [permissions, setPermissions] = useState<Permissions>(falsyRole());

    return <PermissionContext.Provider value={{ permissions, setPermissions }}>{children}</PermissionContext.Provider>;
};

export default PermissionProvider;
