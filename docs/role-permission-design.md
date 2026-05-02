# Role Permission Design Plan for LaborHub LMS
Aligned with LMS Execution Plan v3 (Section 11: Roles & Permissions)

## User Question Recommendations
### 1. Should `project_manager` have unique permissions separate from `admin`?
✅ **Yes** — Per Section 11 of the LMS Execution Plan v3:
- **Project Manager (PM) permissions**: All Supervisor actions + approve weekly payroll + manage relocation hub + full dashboard access
- **Admin permissions**: All PM actions + configure pay rules/benchmarks/holiday calendar + manage subscription and billing
- These are distinct, so PM must retain a separate role with fewer permissions than Admin.

### 2. Should there be a `super_admin` role in addition to `admin`?
✅ **Yes** — Add a `platform_owner` (Super Admin) role per the execution plan:
- Only accesses the Super Admin panel, views all tenant plans/usage, and monitors platform health
- **Cannot access any tenant data** (separate from Admin, which manages single-tenant settings)
- Current `/super-admin` sidebar link is currently gated to `admin` — must be updated to gate to `platform_owner` only.

---

## Pre-Alignment Note
The LMS Execution Plan v3 defines **7 tenant/platform roles** (Section 11), but the current codebase only implements 3 (`admin`, `project_manager`, `worker`). Missing roles to implement:
- Tenant roles: `foreman`, `engineer`, `supervisor`
- Platform role: `platform_owner`

---

## Implementation Plan (Ordered Steps)

### Step 1: Update Role Definitions
Update all role type definitions across the codebase to match the execution plan's 7-role structure:

1. **`src/context/AuthContext.tsx`**:
   - Update `userType` type definition to:
     ```ts
     userType?: 'worker' | 'foreman' | 'engineer' | 'supervisor' | 'project_manager' | 'admin' | 'platform_owner'
     ```
   - Update all related function signatures (signUp, etc.) to accept the expanded role set

2. **`src/components/auth/SignUpForm.tsx`**:
   - Restrict self-signup to `admin`/`platform_owner` only (per Section 4.3 of the execution plan, lower roles are created via admin panel)
   - Update role selection options to only show allowed self-signup roles

3. **`src/components/Topbar.tsx`**:
   - Update `getUserRoleLabel` function to return labels for all 7 roles

---

### Step 2: Create Permission Utility
**New file: `src/lib/permissions.ts`**

Define role hierarchies and helper functions:
```ts
// Tenant role hierarchy (lower roles inherit permissions of roles below them)
export const TENANT_ROLE_HIERARCHY = [
  'worker',
  'foreman',
  'engineer',
  'supervisor',
  'project_manager',
  'admin'
] as const;

// Platform role (separate from tenant roles, no tenant data access)
export const PLATFORM_ROLE = 'platform_owner' as const;

// Check if a user has permission for a required tenant role
export function hasTenantPermission(userRole: string, requiredRole: string): boolean {
  const userIndex = TENANT_ROLE_HIERARCHY.indexOf(userRole as any);
  const requiredIndex = TENANT_ROLE_HIERARCHY.indexOf(requiredRole as any);
  
  if (userIndex === -1 || requiredIndex === -1) return false;
  return userIndex >= requiredIndex;
}

// Check if a user can access a route with allowed roles
export function canAccessRoute(userRole: string, allowedRoles: string[]): boolean {
  // Platform owner can only access platform routes
  if (userRole === PLATFORM_ROLE) {
    return allowedRoles.includes(PLATFORM_ROLE);
  }
  
  // Tenant users check against allowed roles with hierarchy
  return allowedRoles.some(role => 
    role === userRole || hasTenantPermission(userRole, role)
  );
}
```

---

### Step 3: Fix Sidebar Role Filtering (Resolve Existing TODO)
**File: `src/components/Sidebar.tsx`**

1. Import `useAuth` to get current user role
2. Replace line 119 TODO with actual role-based filtering:
   ```tsx
   const { user } = useAuth();
   const visibleItems = group.items.filter((item) => {
     if (!item.allowedRoles || !user) return false;
     return canAccessRoute(user.userType, item.allowedRoles);
   });
   ```
3. Update all nav item `allowedRoles` arrays to match Section 6.2 (Page Inventory) of the execution plan:
   | Page Path | Allowed Roles |
   |-----------|---------------|
   | `/attendance-monitoring` | `['engineer', 'supervisor', 'project_manager', 'admin']` |
   | `/worker-profiles` | `['engineer', 'supervisor', 'project_manager', 'admin']` |
   | `/payroll-management` | `['project_manager', 'admin']` |
   | `/wbs-explorer` | `['engineer', 'supervisor', 'project_manager', 'admin']` |
   | `/relocation-hub` | `['project_manager', 'admin']` |
   | `/productivity` | `['project_manager', 'admin']` |
   | `/issue-tracker` | `['engineer', 'supervisor', 'project_manager', 'admin']` |
   | `/worker-onboarding` | `['admin']` |
   | `/approval-workflows` | `['supervisor', 'project_manager', 'admin']` |
   | `/dispute-correction` | `['supervisor', 'project_manager', 'admin']` |
   | `/device-control` | `['admin']` |
   | `/geofence` | `['admin']` |
   | `/notifications` | All roles (including `worker`) |
   | `/audit-log` | `['admin']` |
   | `/reports` | `['project_manager', 'admin']` |
   | `/commercial-reports` | `['project_manager', 'admin']` |
   | `/accounting-export` | `['project_manager', 'admin']` |
   | `/pay-rules` | `['admin']` |
   | `/company-settings` | `['admin']` |
   | `/subscription` | `['admin']` |
   | `/super-admin` | `['platform_owner']` |

---

### Step 4: Add Route-Level Protection
**File: `src/middleware.ts`**

Extend existing middleware to enforce role-based route access per Section 4.1 of the execution plan:
- Unauthorized role access redirects to the user's default dashboard:
  - `worker` → `/worker-portal`
  - Tenant roles → `/attendance-monitoring`
  - `platform_owner` → `/super-admin`
- Add role checks for all protected routes using the `canAccessRoute` helper from `src/lib/permissions.ts`

**File: `src/components/RootRedirect.tsx`**
- Update role-based routing to handle all 7 roles per the execution plan

---

### Step 5: Audit Log for Role Actions
Per Section 4.1 of the execution plan, log all role-based actions (pay rule changes, transfers, approvals, role assignments) with `user_id` + IP + timestamp. Extend the existing audit log functionality to include role assignment changes.

---

## Validation Checklist
1. **Sidebar filtering**: Login with each role and verify only allowed nav items are displayed
2. **Route guard test**: Lower role user attempting to access admin-only route gets redirected to their default dashboard
3. **Platform Owner test**: `platform_owner` only accesses `/super-admin`, no tenant data access
4. **Permission inheritance**: Admin can access all PM routes, PM can access all Supervisor routes, etc.
5. **Signup restriction**: Only `admin` and `platform_owner` can self-signup, other roles are created via admin panel
