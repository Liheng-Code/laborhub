
LABOR MANAGEMENT SYSTEM
SaaS Platform for Contractor Companies

FULL EXECUTION PLAN
Architecture  ·  Backend  ·  Database  ·  Mobile  ·  Dashboard  ·  Deployment
Version 3.0  —  Final & Locked

16 Weeks
Total build timeline	7 Modules
Core system modules	6 Scans/day
Per worker attendance	Multi-tenant
SaaS architecture
 
SECTION 1 — EXECUTIVE SUMMARY

1. Executive Summary
This document is the complete, locked execution plan for the Labor Management System (LMS) — a multi-tenant SaaS platform designed to be sold as a subscription service to subcontractor companies managing 100 or more workers across multiple construction projects.
The system captures the full reality of a construction site: face-scan + GPS attendance (6 scan points per day), manpower assignment to specific WBS locations, cross-project worker relocation, real-time productivity tracking against per-worker benchmarks, issue and delay detection, weekly payroll with OT / Sunday / holiday rules, and PDF payslip delivery — accessible from mobile, a web dashboard, and a Telegram bot.

1.1 Locked Decisions
Decision	Answer	System impact
Offline mobile	Full offline — queue locally, sync when online	SQLite on device + background sync engine
Tenancy	Multi-tenant SaaS sold by subscription	Schema-per-tenant PostgreSQL isolation + Stripe billing
Payroll	Weekly with OT, Sunday, public holiday rules	Pay rule engine + timesheet + Puppeteer PDF payslip
Worker identity	All workers have accounts; clock-in/out recorded	attendance_scans table; 6 scan points per day
Productivity benchmarks	Admin-configured per worker per task type	productivity_benchmarks table; per-worker targets
Face scan method	Offline local match primary; server re-verify async	AWS Rekognition + Expo FaceDetector on device
Scan operator	Worker self-scans on own phone only	Single scan UI; no shared foreman device mode
Time blocks	Morning in/out, Afternoon in/out, OT in/out	6 scan events per day; session calculator job
OT rules	Admin-configured: OT threshold, OT/Sunday/holiday multipliers	pay_rules table versioned by effective date
Payslip format	PDF payslip delivered to worker in-app	Puppeteer PDF service + S3 storage

1.2 System Purpose
Dimension	Detail
Product type	Multi-tenant SaaS — build once, sell subscriptions to many contractor companies
Primary users	Workers, foremen, site engineers, project managers, company admins
Scale target	100 – 500+ workers per tenant, multiple concurrent projects
Core problem solved	Eliminate paper timesheets, manual headcounts, and end-of-week payroll guesswork
Revenue model	Monthly / annual subscription per tenant, tiered by worker count
 
SECTION 2 — SYSTEM ARCHITECTURE

2. System Architecture
2.1 Layer Overview
Layer	Components	Users
Input Layer	Mobile App (React Native + Expo), Web Dashboard (Next.js 14), Telegram Bot (Telegraf.js)	Workers, Foremen, Engineers, PMs, Admins
API Layer	Fastify REST API, JWT Auth Middleware, Tenant Middleware, Subscription Enforcement	All clients connect here — single entry point
Service Layer	Labor, Relocation, Productivity, Payroll Engine, Face Verify, PDF Generator, Notification	Internal services called by the API layer
Data Layer	PostgreSQL (schema-per-tenant), Redis + BullMQ, AWS S3, TimescaleDB extension	Internal — called by service layer only

2.2 Multi-Tenancy: Schema-per-Tenant
Each contractor company gets its own isolated PostgreSQL schema. The shared public schema holds platform-level data only. This gives complete data isolation, easy per-tenant backup, clean GDPR compliance, and simple offboarding (DROP SCHEMA tenant_x CASCADE).
PostgreSQL database
  ├── public                 (tenants, subscriptions, billing_events)
  ├── tenant_company_alpha   (workers, projects, payroll, attendance — Company A only)
  ├── tenant_company_beta    (same tables — Company B, fully isolated)
  └── tenant_company_n       (new schema created automatically on each signup)

API request flow:
  1. JWT decoded -> X-Tenant-ID extracted
  2. Middleware: SET search_path = tenant_company_alpha
  3. All queries automatically scope to that tenant's tables
  4. Cross-tenant data leak is architecturally impossible

2.3 Final Technology Stack
Component	Technology	Reason
Mobile app	React Native (Expo SDK)	Offline-first, camera, biometric, single codebase iOS + Android
Face detect (device)	Expo Camera + FaceDetector	Free, fully offline — confirms face present before capture
Face match (server)	AWS Rekognition	Managed AI, 99%+ accuracy, no ML infrastructure needed
Web dashboard	Next.js 14 (App Router)	SSR for reports, TypeScript, excellent dashboard ecosystem
API server	Node.js + Fastify	Fast, schema-first, TypeScript, low overhead per request
Primary database	PostgreSQL + TimescaleDB	Relational integrity, FK enforcement, time-series for productivity
Cache & job queues	Redis + BullMQ	Sessions, sync state, payroll cron, PDF job queue
File storage	AWS S3 / Cloudflare R2	Face scan photos, PDF payslips, site progress photos
PDF generation	Puppeteer (isolated container)	Pixel-perfect payslips; memory-heavy so runs on demand only
Telegram bot	Telegraf.js	Mature, good session management, webhook-based
Billing	Stripe	Subscriptions, invoices, failed payment retry — no custom billing code
Infrastructure	Docker + Kubernetes or Railway Pro	Container-first; face service scales independently from API
 
SECTION 3 — DATABASE SCHEMA

3. Database Schema (Final)
3.1 Public Schema — Platform Level
public.tenants
  id, company_name, slug, plan, status, region, created_at

public.subscriptions
  id, tenant_id, plan, stripe_customer_id, stripe_subscription_id,
  worker_limit, project_limit, current_period_end, status

public.billing_events
  id, tenant_id, event_type, amount, timestamp

3.2 Per-Tenant Schema — Worker Identity
workers
  id, name, phone, photo_url, trade, crew_id,
  daily_rate,                  -- source of truth for pay calculation
  bank_account_encrypted,      -- AES-256 encrypted at rest
  pin_hash,                    -- 4-digit PIN (bcrypt hashed)
  biometric_registered,        -- boolean
  face_reference_photo_url,    -- S3 key of registration photo
  face_embedding_vector,       -- Rekognition embedding stored for matching
  status (ACTIVE | INACTIVE)

worker_rate_history            -- insert-only; never update
  id, worker_id, daily_rate, effective_from, set_by, created_at

face_reference_photos
  id, worker_id, photo_url, embedding_vector, registered_at, registered_by

3.3 Per-Tenant Schema — Attendance
attendance_scans               -- one row per scan event
  id, worker_id, project_id,
  scan_type:                   -- MORNING_IN | MORNING_OUT |
                               --  AFTERNOON_IN | AFTERNOON_OUT |
                               --  OT_IN | OT_OUT
  scanned_at, lat, lng,
  face_photo_url,              -- S3 key of selfie captured at scan time
  face_match_score_local,      -- 0.0-1.0, computed on device (offline)
  face_match_score_server,     -- filled async by AWS Rekognition
  face_verified,               -- true once server confirms >= 0.80
  sync_status (PENDING | SYNCED | REJECTED)
  UNIQUE (worker_id, date, scan_type)   -- no duplicate scans

work_sessions                  -- computed from scan pairs, never entered manually
  id, worker_id, project_id, date,
  morning_hours,               -- MORNING_OUT minus MORNING_IN
  afternoon_hours,             -- AFTERNOON_OUT minus AFTERNOON_IN
  ot_hours,                    -- OT_OUT minus OT_IN
  total_regular_hours, total_ot_hours,
  is_manual_override, override_note, overridden_by, computed_at

3.4 Per-Tenant Schema — Payroll
pay_rules                      -- admin-configured, versioned by effective date
  id, rule_type:
    WEEKDAY_OT | SUNDAY_REGULAR | SUNDAY_OT | HOLIDAY_REGULAR | HOLIDAY_OT
  multiplier,                  -- e.g. 1.5, 2.0, 3.0
  ot_threshold_hours,          -- daily hours before OT applies (e.g. 8.0)
  effective_from, effective_to -- changing rates never alters historical payroll

public_holidays                -- admin sets per calendar year
  id, date, name, country_code

timesheets                     -- one row per worker per week
  id, worker_id, week_start_date,
  regular_hours, ot_hours, sunday_hours, holiday_hours,
  gross_regular, gross_ot, gross_sunday, gross_holiday,
  total_gross, total_deductions, net_pay,
  status (DRAFT | PENDING | APPROVED | PAID),
  pdf_url,                     -- S3 key of generated payslip PDF
  approved_by, approved_at, paid_at

payroll_deductions
  id, worker_id, week_start_date,
  type (ABSENCE | ADVANCE | PENALTY | OTHER), amount, note

3.5 Per-Tenant Schema — Project, Assignment & Productivity
projects
  id, name, code, status, start_date, end_date

wbs_nodes                      -- self-referential tree
  id, project_id, parent_id, level, zone, label
  hierarchy: Project > Building > Level > Zone > Task

daily_assignments              -- THE CORE ENGINE
  id, worker_id, project_id, wbs_node_id, task_id,
  date, time_block (AM | PM | FULL), hours, cost_center,
  entry_by, approved_at
  UNIQUE (worker_id, date, time_block)   -- prevents double-booking

transfer_requests              -- cross-project relocation
  id, from_project_id, to_project_id, worker_ids[],
  date, time_block, reason, status,
  cost_split_pct_origin, cost_split_pct_destination, approved_by

productivity_benchmarks        -- per worker, per task type
  id, worker_id, task_type_id, unit,
  target_output_per_hour, configured_by, updated_at

productivity_snapshots         -- computed after each time block closes
  id, wbs_node_id, date, manpower_count, output, unit,
  productivity_ratio, flag (GREEN | YELLOW | RED)

progress_logs                  -- append-only, never deleted
  id, wbs_node_id, task_id, date, quantity, unit, photos[], logged_by

issues
  id, project_id, wbs_node_id,
  type (MATERIAL | DRAWING | MANPOWER | EQUIPMENT),
  severity, description, photos[], status, raised_by, resolved_at
 
SECTION 4 — BACKEND SERVICES

4. Backend API & Services
4.1 API Design Principles
•	All routes protected by JWT middleware; role enforced per endpoint (WORKER / FOREMAN / ENGINEER / SUPERVISOR / PM / ADMIN)
•	Tenant middleware reads tenant ID from JWT, sets PostgreSQL search_path before any query runs
•	Subscription enforcement middleware checks worker/project limits on every create operation; returns HTTP 402 with upgrade message if exceeded
•	Every write to assignments, transfers, approvals, and pay rules logged in audit_log (entity_type, entity_id, user_id, IP, timestamp)
•	S3 file URLs are pre-signed with 1-hour expiry — never publicly accessible

4.2 Module 1 — Tenant Provisioning
Triggered on new company signup. Steps 1-2 run synchronously (< 1s). Step 3 onward queued in BullMQ to avoid blocking the HTTP response.
1.	Create row in public.tenants
2.	Create Stripe customer + subscription
3.	CREATE SCHEMA tenant_slug in PostgreSQL
4.	Run migration scripts against new schema — all tables created fresh
5.	Create first admin user account with temporary password
6.	Send welcome email with login link and setup guide

4.3 Module 2 — Worker Auth & Identity
Workers log in via 4-digit PIN (glove-friendly on site) plus biometric (Expo LocalAuthentication). JWT access token: 15-minute expiry. Refresh token: 7 days, rotated on use. Worker JWT scoped to own data only.
POST /auth/worker/login          -- PIN + worker_id -> JWT + refresh token
POST /auth/worker/refresh        -- rotate refresh token
POST /workers/:id/register-face  -- upload reference photo -> Rekognition embedding
GET  /workers/:id/reference-photo -- pre-signed URL for device SecureStore download
POST /workers                    -- create worker (admin only)
PUT  /workers/:id/rate           -- update daily rate; inserts to rate_history

4.4 Module 3 — Face Verification Service
Isolated microservice container — CPU-heavy, scales independently. Uses AWS Rekognition. Two-stage verification: device-first for offline capability, server-async for accuracy.
Two-stage face verification flow
STAGE 1 — On device (works fully offline):
  Worker taps scan > camera opens > oval face guide overlay appears
  > Expo FaceDetector confirms face is centered and steady
  > Photo taken automatically (worker does not press a button)
  > Local comparison runs against reference photo stored in device SecureStore
  > Score >= 0.75: accepted locally, scan queued for server verify
  > Score < 0.75: rejected, retry prompt shown (max 3 attempts)
  > After 3 failures: alert sent to foreman for manual override

STAGE 2 — Server re-verification (async when internet available):
  Background job picks up all PENDING scans
  > Sends scan photo + stored reference embedding to AWS Rekognition
  > Server score >= 0.80: face_verified = true, sync_status = SYNCED
  > Server score < 0.80: flagged for foreman review in dashboard
  > Foreman sees side-by-side (reference photo vs scan photo) and confirms or overrides
  > NEVER auto-reject entirely — site conditions (hard hats, sweat, low light) cause false negatives

4.5 Module 4 — Attendance Scan API
POST /scans/submit
  body: { worker_id, project_id, scan_type, face_photo_b64, lat?, lng? }
  -> validates scan sequence (cannot MORNING_OUT before MORNING_IN)
  -> enforces UNIQUE (worker_id, date, scan_type) constraint
  -> stores scan record, queues photo upload to S3, queues server face verify
  -> returns: { accepted: true, local_score: 0.87, queued_for_verify: true }

GET  /scans/today?worker_id=
  -> returns all scan events for today with face_verified status

POST /scans/manual-override     -- foreman or engineer only
  body: { worker_id, date, scan_type, manual_time, reason }
  -> sets is_manual_override = true; logs overridden_by

GET  /scans/flagged             -- PM / engineer dashboard view
  -> returns scans with face_verified = false for human review

4.6 Module 5 — Session Calculator (Background Job)
Runs every 30 minutes and immediately on every OT_OUT scan. Computes work_session rows from scan pairs. Flags incomplete pairs in the dashboard after expected time windows pass.
For each worker with scans today:
  morning_hours   = MORNING_OUT.time - MORNING_IN.time (if both exist)
  afternoon_hours = AFTERNOON_OUT.time - AFTERNOON_IN.time (if both exist)
  ot_hours        = OT_OUT.time - OT_IN.time (if both exist)
  total_regular   = morning_hours + afternoon_hours
  -> upsert work_session row

Incomplete pair detection (runs at window close time):
  MORNING_IN present but no MORNING_OUT by 13:00 -> flag in dashboard
  AFTERNOON_IN present but no AFTERNOON_OUT by 18:30 -> flag in dashboard
  OT_IN present but no OT_OUT by 23:00 -> flag and cap at 4 hours, foreman notified

4.7 Module 6 — Pay Rule Resolver
A pure function. Given a work_session and the pay rules active on that date, returns a full pay breakdown. Pay rules are versioned — historical sessions always use the rate that was active at that time.
resolvePayForSession(session, worker, payRules, holidays):
  dayType = getDayType(session.date, holidays)
  // -> WEEKDAY | SUNDAY | HOLIDAY

  hourlyRate = worker.daily_rate / payRules.ot_threshold_hours

  if WEEKDAY:
    regularPay = hourlyRate x min(total_regular_hours, ot_threshold_hours)
    otPay      = hourlyRate x ot_hours x WEEKDAY_OT.multiplier

  if SUNDAY:
    regularPay = hourlyRate x total_regular_hours x SUNDAY_REGULAR.multiplier
    otPay      = hourlyRate x ot_hours x SUNDAY_OT.multiplier

  if HOLIDAY:
    regularPay = hourlyRate x total_regular_hours x HOLIDAY_REGULAR.multiplier
    otPay      = hourlyRate x ot_hours x HOLIDAY_OT.multiplier

  return { regularPay, otPay, total: regularPay + otPay, dayType }

4.8 Module 7 — Weekly Payroll Cron Engine
Runs every Sunday at 23:00 (configurable per tenant timezone via BullMQ cron).
7.	For each active worker with work_sessions in Mon–Sat
a.	Call resolvePayForSession for each day
b.	Sum: gross_regular, gross_ot, gross_sunday, gross_holiday
c.	Fetch all payroll_deductions for the week
d.	net_pay = total_gross − total_deductions
e.	Create or update timesheet row (status: DRAFT)
8.	Push notification to PM: 'Weekly timesheets ready for review'
9.	PM reviews and approves in dashboard (status → APPROVED)
10.	On approval: trigger PDF payslip generation job
11.	Worker receives push notification: 'Your payslip for week X is ready'

Critical: Rate versioning — historical payroll protection
pay_rules rows carry effective_from and effective_to dates.
The resolver queries: WHERE effective_from <= session.date AND (effective_to IS NULL OR effective_to >= session.date)
This means changing multipliers today never touches any past timesheet.
Historical payslips are immutable records — legally and operationally safe.

4.9 Module 8 — PDF Payslip Service
Puppeteer (headless Chrome) in a dedicated Docker container. Triggered by payroll approval via BullMQ job queue. Does not run continuously — spins up on demand.
Each payslip PDF contains: company logo and name (from tenant settings), worker name / ID / trade / bank account last 4 digits, week date range, daily breakdown table (date, day type, regular hours, OT hours, applicable rate multiplier, day gross), earnings summary (gross regular + OT + Sunday/holiday), deductions itemized by type, net pay in large bold type, PM name and approval date, and a QR code linking to the digital record for verification.

4.10 Module 9 — Labor Assignment Engine
POST /assignments             -- bulk entry: foreman logs 18 workers at once
  body: { worker_ids[], project_id, wbs_node_id, task_id, date, time_block }
  -> validates UNIQUE (worker_id, date, time_block) for each worker
  -> creates daily_assignment rows for all valid workers
  -> returns: { created: 16, conflicts: [{ worker_id, reason }] }

GET  /assignments?date=&project_id=   -- manpower matrix data for dashboard
POST /assignments/bulk-import         -- CSV upload for large crews
DELETE /assignments/:id               -- foreman correction (within same day only)

4.11 Module 10 — Relocation Service
GET  /transfers/available-workers?date=&time_block=&from_project_id=
  -> workers with no assignment in that block on that date

POST /transfers/request
  body: { from_project_id, to_project_id, worker_ids[], date, time_block, reason }
  -> creates transfer_request (status: PENDING)
  -> notifies from-project PM and supervisor for approval

POST /transfers/:id/approve
  -> creates daily_assignment rows on destination project
  -> calculates cost split: full-day = 100% to destination; half-day = 50/50
  -> notifies affected workers via push notification
  -> notifies destination foreman

4.12 Module 11 — Productivity Engine
Scheduled job runs after each time block closes (12:30 and 17:30 daily). Compares actual output vs each worker's configured benchmark. Benchmark lookup order: worker-specific > task-type default > project default.
productivity_ratio = actual_output / target_output_per_hour

Flags (admin-configurable thresholds, defaults shown):
  >= 0.90  GREEN   -- normal, no action
  0.70-0.89 YELLOW -- slight drop, monitor
  < 0.70   RED     -- problem, auto-alert PM

Auto-detection (nightly job):
  WBS node has manpower logged but zero progress -> flag DELAY
  Same issue type raised 3+ times on same node -> flag REPEATED
  Crew has no assignment for current time block -> flag IDLE
 
SECTION 5 — MOBILE APPLICATION

5. Mobile Application
5.1 Architecture
Concern	Solution
Framework	React Native with Expo SDK — single codebase for iOS and Android
Offline storage	Expo SQLite — local mirror of key server state
Sync strategy	Write locally first, queue in sync_queue table, sync in background
Face scan	Expo Camera + FaceDetector for capture; local comparison offline
Reference photo	Downloaded from S3 on first login, stored in Expo SecureStore
Authentication	4-digit PIN login + Expo LocalAuthentication (Face ID / fingerprint)
Photo upload	Compressed to max 800KB before upload — manages data costs on site
Push notifications	Expo Notifications (FCM for Android, APNs for iOS)

5.2 Offline-First Sync
Sync flow for every write action
1. User action (scan, log manpower, log progress, report issue)
2. Written to local SQLite immediately
3. UI updates optimistically — worker sees confirmation right away
4. Record added to sync_queue (entity_type, entity_id, payload, created_at, retry_count)
5. Background sync process fires whenever internet connection detected
6. Server confirms -> sync_status = SYNCED
7. Server rejects -> retry_count + 1
8. After 3 retries -> surface error to user; never silently drop data

Conflict resolution rules:
  Attendance scans: last-write-wins (foreman correction overrides worker entry)
  Progress logs: append-only, no conflict possible
  Transfers: server is authoritative — cannot approve while offline
  Face scan photos: metadata syncs first; photo file uploads separately after

5.3 Scan Time Windows
Scan event	Default window	Prerequisite	If missed
Morning In	06:30 – 09:00	None	Foreman manual override required
Morning Out	11:00 – 13:00	Morning In complete	Flagged in dashboard after 13:30
Afternoon In	12:30 – 14:00	Morning Out complete	Flagged in dashboard after 14:30
Afternoon Out	16:30 – 18:30	Afternoon In complete	Flagged in dashboard after 19:00
OT In	17:00 – 19:00	OT assigned by foreman today	Cannot scan OT Out without OT In
OT Out	18:00 – 23:00	OT In complete	Capped at 4 hours if not scanned; foreman notified
Time windows are configurable per project by admin — a project starting at 06:30 has different windows than one starting at 08:00.

5.4 Self-Scan UI Flow (All 6 Scan Points)
12.	Worker opens app. Home screen shows next expected scan as the primary action button.
13.	Worker taps. Camera screen opens with oval face guide overlay centered on screen.
14.	Expo FaceDetector runs in real time. Guide turns green when face is centered and steady.
15.	Photo taken automatically — worker does not press a shutter button.
16.	Local comparison runs against reference photo stored in device SecureStore.
17.	Score >= 0.75: green checkmark animation. Scan accepted, GPS tagged, timestamp recorded, queued for sync.
18.	Score < 0.75: red X. Retry prompt displayed. Worker tries again. Maximum 3 attempts.
19.	After 3 failures: push notification sent to foreman. Foreman performs manual override.
20.	Home screen updates: shows next expected scan or today's session summary if no more scans expected.
21.	In background: scan syncs to server. Server re-verifies via Rekognition. If score < 0.80, flagged for dashboard review.

5.5 Screen Inventory
#	Screen	Role	Build week
1	Worker login (PIN pad + biometric button)	Worker	8
2	Face registration (first login / re-register)	Worker + Admin	8
3	Home screen (next scan prompt; today summary card)	Worker	9
4	Scan camera (identical UI for all 6 scan types)	Worker	9
5	Today attendance summary (hours logged; session status)	Worker	9
6	My timesheets (weekly hours + pay breakdown)	Worker	10
7	My payslips (list of weeks + in-app PDF viewer)	Worker	10
8	Foreman home (crew scan status grid; missing scan alerts)	Foreman	9
9	Manpower log (bulk worker + WBS + task; date + block)	Foreman	10
10	Progress entry (quantity + unit + photo attach)	Foreman / Engineer	10
11	Issue report (category + description + photo)	Foreman / Engineer	10
12	Relocation request (available workers; submit transfer)	Foreman / PM	10
13	Approval queue (approve or reject pending items)	Engineer / Supervisor	10
14	Notifications center (all push history)	All roles	10
 
SECTION 6 — WEB DASHBOARD

6. Web Dashboard
6.1 Live Dashboard Cards
Each card is an independent component fetching its own data. One slow query cannot block the whole page.
Card	Data shown	Alert condition
Total manpower today	Worker count across all active projects	Count below plan target
Active tasks	WBS nodes with manpower in current time block	—
Productivity alerts	Nodes flagged YELLOW or RED	Any RED flag triggers PM alert
Delayed locations	WBS nodes with open delay issues	Any unresolved delay
Issues today	Count + severity breakdown (LOW / MED / HIGH)	Any HIGH severity open
Borrowed workers	Incoming transfers active today	—
Lent workers	Outgoing transfers active today	—
Idle crews	Crews with no assignment in current time block	Any idle crew
Pending transfers	Relocation requests awaiting approval	Pending over 4 hours
Unverified face scans	Scans flagged for human review	Any flagged scan

6.2 Page Inventory
Page	Purpose	Primary user
Dashboard (home)	All KPI cards; live status overview; project switcher	PM
Attendance monitor	Live scan status grid all workers; flagged scan review; manual override	PM / Engineer
Manpower matrix	Pivot table: workers × projects × time blocks, color-coded by status	PM
WBS explorer	Recursive tree; click node for history, issues, progress, productivity	PM / Engineer
Relocation hub	Visual worker movement flow; request queue; approval timeline	PM
Productivity trends	Line chart per node vs benchmark; GREEN/YELLOW/RED flag history	PM / Manager
Issue tracker	Kanban board: Open / In Progress / Resolved per project	Engineer / PM
Payroll	Weekly timesheet grid; approve; download PDF; CSV export for accounting	PM
Worker profiles	Photo, trade, rate history, benchmarks, session history, payslips	Admin / PM
Pay rule config	OT threshold, multipliers, holiday calendar — admin only, versioned	Admin
Reports	Daily site report, weekly trend, delay summary — auto-generated PDF	PM / Manager
Subscription & billing	Current plan, usage vs limits, upgrade button, billing history	Admin
Super admin panel	All tenants, plan, usage, last activity, suspend — platform owner only	Platform owner

6.3 Pay Rule Configuration Panel
Admin pay rule panel — 4 sections
Section 1 — OT rules
  OT threshold (hours/day): [ 8.0 ]  — hours before OT rate applies
  Weekday OT multiplier:    [ 1.5x ] — applied to hours beyond threshold
  Sunday OT multiplier:     [ 2.5x ] — OT hours worked on Sunday
  Holiday OT multiplier:    [ 3.0x ] — OT hours worked on public holiday

Section 2 — Day type rates
  Sunday regular rate:      [ 2.0x ] — all regular hours on Sunday
  Public holiday rate:      [ 3.0x ] — all regular hours on holiday

Section 3 — Holiday calendar
  [ + Add holiday ] [ Import CSV ]
  Rows: Date | Name | Country code | Actions
  Changes apply from 'Effective from' date only — past payroll untouched

Section 4 — Worker productivity benchmarks
  Search worker -> select task type -> enter target output/hour + unit -> Save
  View all benchmarks in a sortable table; export as CSV
 
SECTION 7 — TELEGRAM BOT

7. Telegram Bot
7.1 Purpose & Auth
The bot is the adoption engine. Site staff who resist a mobile app will use Telegram — they already have it. Every bot command routes to the same backend API as the mobile app. No separate data. Bot sessions are worker-authenticated via phone number. Session token stored in Redis per chat_id, expires after 24 hours of inactivity.

7.2 Command Reference
Command	Role	Action
/start	Anyone	Register with company code; system assigns role based on phone match
/clockin	Worker	Guided flow: project -> scan type -> records time + GPS location
/clockout	Worker	Closes active session; bot replies with total hours logged today
/labor	Foreman	Guided: project -> WBS node -> task -> worker count -> submit
/progress	Foreman / Engineer	Guided: project -> WBS node -> quantity -> unit -> submit
/issue	Anyone	Report issue: category prompt -> description -> attach photo optional
/transfer	PM	Request worker move: from project -> to project -> workers -> time block
/approve [id]	Engineer / Supervisor	Approve pending assignment, transfer, or timesheet
/status	Foreman / PM	Today's manpower + productivity flag summary for your project
/myweek	Worker	Hours Mon–today + estimated gross pay this week
/mypay	Worker	Latest approved payslip: net pay + week dates + deductions summary
/photo	Anyone	Upload site photo; bot asks which WBS node to tag it to
 
SECTION 8 — DEPLOYMENT & INFRASTRUCTURE

8. Deployment Architecture
8.1 Environments
Environment	Infrastructure	Purpose
Development	Local Docker Compose — all services on one machine	Each developer runs the full stack locally
Staging	Single server 2 vCPU / 4 GB RAM (Railway or DigitalOcean)	Integration tests, QA, client demos
Production	Kubernetes cluster or Railway Pro (multi-region capable)	Live paying tenants — HA + auto-scale

8.2 Production Service Sizing
Service	Scaling strategy	Notes
API (Fastify)	2–4 replicas behind load balancer	Stateless — safe to horizontal scale
Face verify (Rekognition wrapper)	1–2 dedicated containers	CPU-heavy; isolated from main API
Payroll cron (BullMQ)	1 container, no HTTP	Separate from API; BullMQ handles retry
PDF generator (Puppeteer)	Scale to 0 when idle, up on demand	~300MB memory per instance
Web dashboard (Next.js)	2 replicas + Cloudflare CDN	SSR pages cached aggressively
Telegram bot (Telegraf)	1 container, webhook-based	Low resource; webhook not polling
PostgreSQL	Managed: Supabase / Neon / RDS	Never self-host DB in production
Redis	Managed: Upstash / ElastiCache	Cluster mode for HA
S3 / R2	Object storage — infinite scale	Face photos, PDFs, site photos

8.3 CI/CD Pipeline
22.	Developer pushes to feature branch
23.	GitHub Actions: TypeScript check + ESLint + unit tests
24.	On merge to develop: Docker image built and pushed to registry; auto-deploy to staging
25.	QA runs integration tests on staging (3 dummy tenants, automated scenarios)
26.	On git tag release: deploy to production with manual approval gate in GitHub Actions
27.	Sentry monitors production errors; PagerDuty alert on error spike or downtime

8.4 Multi-Tenant Migration Strategy
Every schema change must be applied to all existing tenant schemas. Use a migration runner — not knex.migrate which does not support multi-schema.
Migration runner (Node.js script):
  1. SELECT id, slug FROM public.tenants WHERE status = 'ACTIVE'
  2. For each tenant:
     SET search_path = tenant.slug
     Execute migration SQL file
     INSERT INTO migration_log (tenant_id, version, ran_at, success)
  3. On any failure: log error, continue to next tenant, alert engineer

Always test migration on staging (full tenant schemas) before production run.
Prepare rollback SQL for every migration before deploying.

8.5 Security Requirements
Requirement	Implementation
All traffic encrypted	HTTPS only with HSTS; no HTTP fallback anywhere
JWT tokens	Access: 15-min expiry, RS256 signed. Refresh: 7-day, rotated on use, hashed in Redis
Bank account field	AES-256 encrypted at rest; decrypted only at payslip display, never logged
Face photos	Private S3 bucket only; pre-signed URLs with 1-hour expiry; never in public CDN
Row-level data scope	Workers see own data only; engineers see own project; PM sees all within own tenant
Audit log	Every write to assignments, transfers, approvals, and pay rules: user_id + IP + timestamp
DB backups	Daily automated PostgreSQL dumps to separate S3 bucket; 90-day retention minimum
Tenant isolation test	Automated: API call with Tenant A JWT must never return Tenant B data — fails CI if broken
Subscription enforcement	Worker/project limits checked before every create; HTTP 402 with upgrade message if exceeded
 
SECTION 9 — BUILD TIMELINE (16 WEEKS)

9. Build Timeline
Week	Phase	Milestone & key deliverables
1	Foundation	Schema finalized (all tables). Docker Compose local env. AWS Rekognition account configured. Stripe account + webhook setup. GitHub repo + CI skeleton. Migration runner scaffolded.
2	Identity & Tenancy	Tenant provisioning API (schema creation + Stripe + welcome email). Worker auth (PIN login + biometric). Face registration flow. JWT middleware. Subscription enforcement middleware.
3	Attendance Core	All 6 attendance scan types API. Scan sequence validation. UNIQUE constraint enforcement. Session calculator background job (30-min cron). Time window config per project.
4	Face Verification	AWS Rekognition server-side verify microservice. Async re-verify queue (BullMQ). Flagged scan API for dashboard review. Manual override API with audit log.
5	Pay Rules & Payroll	Pay rule CRUD with versioning. Holiday calendar API. Pay rule resolver (pure function + unit tests). Payroll cron engine (Sunday 23:00 trigger). Deduction API. Payslip PDF service (Puppeteer).
6	Project & Labor	WBS + project CRUD APIs. Daily assignment engine with bulk entry. CSV import for large crews. Relocation request + approval flow with cost split calculation.
7	Productivity & Issues	Productivity engine with per-worker benchmark lookup. Three-tier flag thresholds. Progress log API (append-only). Issue API with auto-detection job. Report generator (daily + weekly).
8	Mobile: Identity	Worker login screen (PIN pad + biometric). Face registration UI. Reference photo download to device SecureStore. JWT token management in app.
9	Mobile: Attendance	Self-scan UI for all 6 scan types (single reusable camera component). Home screen scan prompt logic with time window awareness. Offline SQLite queue. Background sync service.
10	Mobile: Complete	Manpower log screen (bulk entry). Progress entry with photo. Issue report. Relocation request. Approval queue. Timesheet viewer. Payslip PDF viewer. Notifications center.
11	Dashboard: Operations	Attendance monitor page + flagged scan review panel. Pay rule config + holiday calendar admin page. Manpower matrix pivot table. WBS explorer with drill-down.
12	Dashboard: Payroll & Reports	Payroll page (approve + PDF download + CSV export). Worker profiles with benchmark config. Report page (daily + weekly auto-generated). Subscription & billing page.
13	Bot & Admin	Telegram bot — all 12 commands. Phone number auth + Redis session. Admin super-panel (platform owner view). Notification service (push + bot broadcast).
14	Integration Testing	3 isolated tenants, 150 workers, 2 full simulated weeks of data. Tenant isolation automated test. Face verify end-to-end test. Payroll cron end-to-end test. Offline sync stress test.
15	Load & Security	Load test: 200+ workers peak morning scan rush (all scanning within 20 min). Security audit: JWT, schema isolation, S3 URL expiry, bank field encryption. Fix all findings.
16	Production Launch	Deploy to production environment. Pilot launch with 1–2 real contractor companies. Monitor Sentry + dashboard. Daily bug triage. Weekly retrospective with pilot users.
 
SECTION 10 — END-TO-END DAILY FLOW

10. A Complete Day in the System
Full daily workflow — site reality mapped to system actions
06:30  Workers arrive at site. Each opens app, taps 'Morning In'.
       Face scan: camera opens, oval guide, auto-capture, local match.
       GPS tagged. Scan queued offline. Syncs when site WiFi available.

07:00  Foreman logs manpower: 18 workers -> Tower A -> L03 -> Rebar (mobile or /labor bot).
       Bulk entry: selects 18 workers, picks WBS node, taps submit.
       Duplicate check runs — 2 workers already assigned elsewhere flagged.

08:30  Server re-verifies face scans via Rekognition in background.
       1 scan flags as low score. Dashboard shows alert to PM.
       PM opens Attendance Monitor, reviews side-by-side photos, confirms manually.

12:00  Workers tap 'Morning Out'. Session calculator updates morning_hours.

13:00  Workers tap 'Afternoon In'. Foreman logs afternoon assignment.

14:00  Emergency: Project B PM needs 8 workers for afternoon slab casting.
       PM opens Relocation Hub. Filters available workers for PM block today.
       Selects 8 workers from Project A. Submits transfer request.
       Project A supervisor receives push notification, approves in 2 taps.
       8 workers receive push: 'Report to Tower B / Grid C5 for afternoon.'
       Cost split automatically set to 50/50 (half-day transfer).

17:00  Engineer logs progress: 2.5 tons rebar completed. Photo attached to WBS node.
       Issue logged: material delivery 45 minutes late (MATERIAL / LOW).

17:00  Workers tap 'Afternoon Out'. OT workers assigned by foreman tap 'OT In'.

17:30  Productivity engine runs.
       Sokha's benchmark: 0.30 tons/hour. Actual: 0.28 tons/hour. Flag: YELLOW.
       Dashboard updates card: '1 node YELLOW'. PM sees it without opening anything.

20:00  OT workers tap 'OT Out'. Session calculator finalizes all hours.
       Worker Dara: 5h morning + 4h afternoon + 2.5h OT = 11.5 hours total.

23:00  Sunday payroll cron fires.
       Dara: Mon–Sat sessions totalled. Wednesday was a public holiday.
       Regular weekday hours x 1.0x. Wednesday hours x 3.0x (holiday rate).
       OT hours across week x 1.5x (weekday OT). Net after advance deduction computed.
       Timesheet created (DRAFT). PM notified: '47 timesheets ready for review.'

Monday 09:00  PM opens Payroll page. Reviews per-worker breakdown.
              Approves all 47 timesheets in one click (or individually for exceptions).
              Puppeteer generates 47 PDF payslips. Uploaded to S3.
              47 workers receive push notification: 'Your payslip is ready.'
              Workers open app -> My Payslips -> see net amount -> tap to view full PDF.
 
SECTION 11 — ROLES, RISKS & DECISIONS

11. Roles & Permissions
Role	Capabilities
Worker	Self-scan all 6 time blocks. View own sessions, timesheets, payslips. Receive push notifications.
Foreman	Log manpower (bulk). Log progress + photos. Report issues. Manual scan override for crew. View crew status grid.
Engineer	All Foreman actions. Approve assignments. WBS explorer full view. Mark issues as resolved.
Supervisor	All Engineer actions. Approve and reject transfer requests. View all projects in tenant.
PM	All Supervisor actions. Approve weekly payroll. Manage relocation hub. Full dashboard access.
Admin	All PM actions. Configure pay rules, benchmarks, holiday calendar. Manage subscription and billing.
Platform owner	Super admin panel only. View all tenant plans and usage. Cannot access any tenant data.

12. Risks & Mitigations
Risk	Likelihood	Mitigation
Worker without smartphone	Medium	Foreman logs attendance manually via dashboard override or Telegram bot. Operational policy — not a code change.
Poor site internet at scan time	High	Offline-first: scan accepted locally at 0.75 score. Server re-verify is async. No scan is ever blocked waiting for a connection.
Face scan false negative (hard hat, sweat, low light)	Medium	3 retries before foreman alert. Foreman manual override with audit log. Server review panel with side-by-side photos. Never auto-reject.
Multi-tenant migration failure	Low	Per-tenant migration log. Rollback SQL prepared before every deploy. Migration tested on staging with 5 dummy tenants first.
Payroll dispute	Low but high impact	Full audit trail: session log, pay rule version used, who approved, timestamp. Payslip PDF is immutable source of record. Rate history is insert-only.
Stripe payment failure	Medium	7-day grace period before tenant access suspended. Email warnings at day 3 and day 1. No data deleted on suspension — data restored on payment.
Photo storage cost growth	Medium-long term	Compress to 800KB before upload. Lifecycle policy: move photos older than 90 days to S3 Glacier (lower cost archive). Admin can configure retention.

13. Subscription Tiers (Suggested)
Plan	Workers	Projects	Suggested price	Key features
Starter	Up to 50	Up to 3	$49 / month	All 7 core modules. Telegram bot. Basic reports. Email support.
Growth	Up to 200	Unlimited	$149 / month	All Starter + advanced productivity charts. CSV/PDF export. Priority support.
Enterprise	Unlimited	Unlimited	Custom	All Growth + API access. Custom reports. Dedicated support. SLA. Data residency option.

14. Operational Policy Decisions (Pre-Launch)
These items do not require system changes. They must be documented as operating policy before pilot launch so foremen and PMs know the rule on day one.
•	Workers without smartphones: decide whether foreman submits attendance on their behalf (dashboard override) or company provides a small pool of shared Android devices at the site office.
•	OT approval: decide whether OT must be pre-approved by PM before workers can scan OT In, or whether OT is logged and reviewed after the fact. Pre-approval requires an OT request flow (additional 1 week of development if needed later).
•	Payroll release day: decide whether PM approves timesheets Sunday night or Monday morning. System supports both.
•	Data retention policy: decide how many years of payroll and attendance records to retain before archiving to cold storage. Affects S3 costs and GDPR obligations if operating in EU markets.

All architectural and design decisions are confirmed and locked.
The system is ready to enter Phase 1 build — begin with the database migration files and tenant provisioning service.

