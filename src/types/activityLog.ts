export interface ActivityLog {
    id: string;
    targetId: string;
    executorName: string;
    createdAt: string;
    staffId?: string;
    rtId?: string;
    action: string;
    description: string;
    reason: string;
    data?: string;
}

export type ActivityLogView = Pick<
    ActivityLog,
    'id' | 'executorName' | 'createdAt' | 'action' | 'description' | 'reason'
>;
