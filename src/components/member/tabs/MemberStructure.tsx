import { useQuery } from '@tanstack/react-query';
import { Spin, Tree } from 'antd';
import { useTranslation } from 'next-i18next';
import 'react-phone-input-2/lib/style.css';
import { AxiosErrorResponse } from '@/types';
import errorFormatter from '@/lib/errorFormatter';
import { toast } from 'react-toastify';
import { getMemberTreeStructure } from '@/services/member';

interface MemberStructureProps {
    memberId: string;
}

const addKeys = (nodes: any[], parentKey = '0'): any[] => {
    return nodes.map((node, index) => {
        const key = parentKey ? `${parentKey}-${index}` : `${index}`;
        const newNode = { ...node, key }; // Assign key to the node

        if (node.children) {
            newNode.children = addKeys(node.children, key); // Recursively assign keys to children
        }

        return newNode;
    });
};

// Recursive function to change `englishName` to `title`
function transformTreeData(nodes: any[]): any[] {
    return nodes.map((node) => {
        // Destructure the `englishName` and `children`, leaving the rest in `rest`
        const { englishName, children, point, totalPoints, key, ...rest } = node;

        // Return the transformed node with `title` instead of `englishName`
        return {
            key: key,
            title: (
                <div>
                    {englishName}{' '}
                    <span className="text-blue-500">
                        (own: {point ? point : 0}) (total: {totalPoints ? totalPoints : 0})
                    </span>
                </div>
            ),
            children: children ? transformTreeData(children) : [], // Recursively handle children
        };
    });
}

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
            title: 'parent 1',
            key: '0-0',

            children: [
                {
                    title: 'parent 1-0',
                    key: '0-0-0',

                    children: [
                        { title: 'leaf', key: '0-0-0-0' },
                        {
                            title: (
                                <>
                                    <div>multiple line title</div>
                                    <div>multiple line title</div>
                                </>
                            ),
                            key: '0-0-0-1',
                        },
                        { title: 'leaf', key: '0-0-0-2' },
                    ],
                },
            ],
        },
    ];

    // Add keys to the tree data
    const treeDataWithKeys = Array.isArray(memberTreeStructureQuery.data) ? addKeys(memberTreeStructureQuery.data) : addKeys([]);
    const transformedData = transformTreeData(treeDataWithKeys);

    return (
        <Spin spinning={memberTreeStructureQuery.isLoading}>
            <div style={{ width: '300px', margin: '20px' }}>
                <Tree
                    showLine
                    defaultExpandAll
                    treeData={transformedData} // Pass the tree data with keys
                />
            </div>
        </Spin>
    );
};

export default MemberStructure;
