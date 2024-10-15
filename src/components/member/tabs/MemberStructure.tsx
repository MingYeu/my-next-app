import { useQuery } from '@tanstack/react-query';
import { Form, Spin, Tree } from 'antd';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';
import 'react-phone-input-2/lib/style.css';
import { AxiosErrorResponse } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import { PermissionContext } from '@/providers/RoleContext';
import { toast } from 'react-toastify';
import { getMemberTreeStructure } from '@/services/member';

interface MemberStructureProps {
    memberId: string;
}

const addKeys = (nodes: any[], parentKey = ''): any[] => {
    return nodes.map((node, index) => {
        const key = parentKey ? `${parentKey}-${index}` : `${index}`;
        const newNode = { ...node, key }; // Assign key to the node

        if (node.children) {
            newNode.children = addKeys(node.children, key); // Recursively assign keys to children
        }

        return newNode;
    });
};

const MemberStructure: React.FC<MemberStructureProps> = ({ memberId }) => {
    const { t } = useTranslation(['member', 'common']);

    const memberTreeStructureQuery = useQuery({
        queryKey: ['member', 'tree', memberId],
        queryFn: async () => {
            const res = await getMemberTreeStructure(memberId);
            return res.data;
        },
        onError: (error: AxiosErrorResponse & Error) => {
            toast.error(t(errorFormatter(error)));
        },
    });

    const treeData = [
        {
            title: 'Lim RM10',
            children: [
                {
                    title: 'Ming RM30',
                    children: [{ title: 'my leaf' }, { title: 'your leaf' }],
                },
                {
                    title: 'parent 1-1',
                    children: [{ title: 'foo' }],
                },
            ],
        },
    ];

    // Add keys to the tree data
    const treeDataWithKeys = Array.isArray(memberTreeStructureQuery.data) ? addKeys(memberTreeStructureQuery.data) : addKeys([]);

    return (
        <Spin spinning={memberTreeStructureQuery.isLoading}>
            <div style={{ width: '300px', margin: '20px' }}>
                <Tree
                    showLine
                    defaultExpandAll
                    treeData={treeDataWithKeys} // Pass the tree data with keys
                />
            </div>
        </Spin>
    );
};

export default MemberStructure;
