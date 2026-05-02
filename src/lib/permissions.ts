import type { UserRole } from '@/context/AuthContext';

export const TENANT_ROLE_HIERARCHY = [
  'worker',
  'foreman',
  'engineer',
  'supervisor',
  'project_manager',
  'admin',
] as const;

export const PLATFORM_ROLE = 'platform_owner' as const;

export function hasTenantPermission(userRole: string, requiredRole: string): boolean {
  const userIndex = TENANT_ROLE_HIERARCHY.indexOf(userRole as (typeof TENANT_ROLE_HIERARCHY)[number]);
  const requiredIndex = TENANT_ROLE_HIERARCHY.indexOf(requiredRole as (typeof TENANT_ROLE_HIERARCHY)[number]);

  if (userIndex === -1 || requiredIndex === -1) return false;
  return userIndex >= requiredIndex;
}

export function canAccessRoute(userRole: string | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;

  if (userRole === PLATFORM_ROLE) {
    return allowedRoles.includes(PLATFORM_ROLE);
  }

  return allowedRoles.some(
    (role) => role === userRole || hasTenantPermission(userRole, role),
  );
}

export function getDefaultRoute(userRole: string | undefined): string {
  if (!userRole) return '/auth/signin';
  if (userRole === PLATFORM_ROLE) return '/super-admin';
  if (userRole === 'worker') return '/worker-portal';
  return '/attendance-monitoring';
}

const ROLE_LABELS: Record<string, string> = {
  worker: 'Worker',
  foreman: 'Foreman',
  engineer: 'Engineer',
  supervisor: 'Supervisor',
  project_manager: 'Project Manager',
  admin: 'Company Admin',
  platform_owner: 'Platform Owner',
};

export function getUserRoleLabel(userRole?: string): string {
  return ROLE_LABELS[userRole || ''] || 'User';
}

export interface RoleAuditEntry {
  userId: string;
  action: 'ROLE_ASSIGNED' | 'ROLE_REVOKED' | 'PAY_RULE_CHANGED' | 'TRANSFER_APPROVED' | 'APPROVAL_GRANTED';
  targetUser?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

const auditLog: RoleAuditEntry[] = [];

export function logRoleAction(entry: Omit<RoleAuditEntry, 'timestamp'>): void {
  const logEntry: RoleAuditEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };
  auditLog.push(logEntry);

  if (typeof window !== 'undefined') {
    console.log('[Audit] Role action logged:', logEntry);
  }
}

export function getRoleAuditLog(): RoleAuditEntry[] {
  return [...auditLog];
}
