export interface Tenant {
    id: string;
    name: string;
    domain: string;
    autoJoinByDomain: boolean;
    isActive: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
}
