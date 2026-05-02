# Backend Foundation Implementation Plan

## Phase 1: Backend API + Database Foundation

### Step 1: Backend Project Setup
- Create `laborhub/backend/` directory
- Initialize Fastify + TypeScript + Node.js project
- Docker Compose for local dev (PostgreSQL, Redis, Fastify API)
- Environment configuration (.env template)

### Step 2: Database Schema (PostgreSQL)
Create all tables per Section 3 of execution plan:
- **Public schema**: `tenants`, `subscriptions`, `billing_events`
- **Tenant schema**: `workers`, `worker_rate_history`, `face_reference_photos`
- **Attendance**: `attendance_scans`, `work_sessions`
- **Payroll**: `pay_rules`, `public_holidays`, `timesheets`, `payroll_deductions`
- **Project**: `projects`, `wbs_nodes`, `daily_assignments`, `transfer_requests`
- **Productivity**: `productivity_benchmarks`, `productivity_snapshots`, `progress_logs`, `issues`
- Migration runner script (multi-tenant aware)

### Step 3: Tenant Provisioning Service
- Signup → create `public.tenants` row → `CREATE SCHEMA` → run migrations → create first admin
- Stripe customer + subscription creation
- Welcome email trigger (queue-based)

### Step 4: Auth & Middleware
- JWT middleware (RS256, 15-min access + 7-day refresh)
- Tenant middleware (`SET search_path = tenant_schema`)
- Role enforcement per endpoint
- Subscription limit enforcement (HTTP 402)

### Step 5: Core APIs
- **Worker Auth**: PIN login, biometric, face registration
- **Attendance Scans**: submit, sequence validation, duplicate prevention
- **Session Calculator**: 30-min cron job to compute work_sessions from scan pairs
- **Audit Log**: append-only logging for all writes

---

## Deliverables
1. Working Fastify API server with TypeScript
2. PostgreSQL database with all schemas/tables
3. Docker Compose setup for local development
4. Multi-tenant provisioning working end-to-end
5. Auth system with JWT + role enforcement
6. Attendance scan API with validation
7. Session calculator background job
8. Audit log infrastructure
