📑 CivicMitra – Full Software Engineering Blueprint
1. Introduction

Project Goal
Develop a modern, user-friendly Complaint Management System for Indian Municipal Corporations that enables citizens to file complaints, staff to manage them, workers to resolve them, and admin to oversee everything.

Objectives

Provide digital complaint filing and tracking.

Ensure role-based secure access.

Use modern UI/UX (glassmorphism, responsive design).

Integrate AI for complaint classification and priority detection.

Enable real-time communication (chat + notifications).

Provide analytics for admin decision-making.

2. Requirements Engineering
2.1 Functional Requirements

Citizen: register/login, file complaint, upload evidence, track status, view timeline, chat with staff, give feedback.

Staff: login, view department complaints only, update complaint status, assign workers, respond to chat.

Worker: login, view assigned complaints, update timeline (progress, images), mark completion.

Admin: single seeded account, manage users/departments, view analytics, export reports.

System: AI classification of complaints (category + priority), notifications, multilingual support, chatbot for FAQs.

2.2 Non-functional Requirements

Performance: Must support 5000+ concurrent users per city.

Scalability: Add new departments easily.

Security: JWT auth, password hashing, role-based access.

Usability: Responsive, modern UI, minimal steps to file a complaint.

Maintainability: Modular MERN stack code structure, documented APIs.

Reliability: Fault-tolerant deployment, regular backups.

3. Process Model

We will use the Incremental Model:

Deliver system in small usable increments.

Increment 1: Core (auth + citizen complaint filing + tracking).

Increment 2: Staff dashboard + worker assignment.

Increment 3: Notifications + timeline updates.

Increment 4: AI classifier + chat system.

Increment 5: Admin dashboard + analytics.

This ensures early usable software, user feedback, and reduced risk.

4. System Analysis
4.1 Entities

Citizen

Staff (per Department)

Worker

Admin

Department

Complaint

Timeline Entry

Chat Message

Notification

Feedback

4.2 Use Case Diagram

Actors: Citizen, Staff, Worker, Admin.
Use Cases: Register/Login, File Complaint, Update Timeline, Assign Worker, Generate Analytics, Chat, Give Feedback.

4.3 DFDs

Level 0: Citizen submits complaint → System → Department → Worker → Resolution → Citizen feedback.

Level 1: Shows internal data flows between subsystems (Complaint DB, User DB, AI Classifier, Notifications).

Level 2: Expands complaint processing into submission, classification, routing, timeline updates, closure.

5. System Design (High-Level)
5.1 Architecture

Frontend: React + TailwindCSS, Responsive + Modern UI.

Backend: Node.js + Express.

Database: MongoDB (or Supabase if preferred).

AI Service: BERT/DistilBERT microservice.

Storage: S3 bucket / Supabase Storage for files.

Notifications: Real-time (Socket.IO) + Email/SMS.

Deployment: Docker containers, CI/CD pipeline.

5.2 Modules

Authentication & Authorization

Complaint Management

Timeline & Worker Tracking

Chat System

Notification Engine

Admin Dashboard & Analytics

AI Classification Service

6. Low-Level Design (LLD)
6.1 Database Schemas

(Already shared in JSON earlier – Users, Complaints, Timeline, Chat, etc.)

6.2 UI Wireframes (Modern & Glossy)

Login/Register: Glassmorphic form, gradient buttons.

Citizen Dashboard: KPI strip (open, resolved, pending), “File Complaint” CTA.

Complaint Form: 2-step wizard (details + upload).

Staff Dashboard: Filtered complaint list with priority color tags.

Worker View: Task list with quick update buttons.

Admin Dashboard: Analytics charts + export options.

Chat Widget: Floating icon → chat window (bot + escalation).

7. Implementation Plan
Increment 1: Core System

Setup MERN project.

Implement auth (JWT + bcrypt).

Citizen registers, files complaint.

Complaints stored in DB, basic UI.

Increment 2: Staff Dashboard + Worker

Staff login → department dashboard.

Worker accounts created by staff.

Staff assigns worker → worker updates timeline.

Increment 3: Notifications + Timeline

Add real-time notifications (Socket.IO).

Timeline entries for each update.

Increment 4: AI & Chat

Add complaint classification (BERT microservice).

Add chatbot for guided complaint filing.

Increment 5: Admin Dashboard

Analytics charts + KPIs.

Export reports.

User & department management.

8. Testing Plan

Unit tests: Auth, complaint API, role guards.

Integration tests: Citizen → Complaint → Staff → Worker → Timeline → Feedback.

UI tests: Cypress E2E.

Load testing: JMeter.

Security tests: SQLi/XSS prevention, JWT expiry handling.

9. Deployment Plan

CI/CD (GitHub Actions).

Dockerized backend + frontend.

Deploy on AWS/GCP/Azure.

MongoDB Atlas or Supabase as DB.

CDN for frontend assets.

10. Risks & Mitigation

Low adoption → Make UI simple & attractive.

Scalability issues → Use microservices + queues.

Data privacy → Use encryption, audit logs.

AI misclassification → Allow manual override.

11. Deliverables

Code repo (frontend + backend).

Database schema & seed scripts.

REST API docs (Swagger).

UI component library.

Test reports.

Deployment guide.


lets look this too:
1 — Short summary / Design goals

Deliver a scalable, secure, modern web app for municipal complaint management.

Users: Citizen, Department Staff, Worker, Admin.

Key flows: complaint filing → AI classification → department routing → staff assignment → worker timeline updates → resolution + feedback.

UI: modern, dynamic theme (glass/transparency, shadows, gradients), responsive, accessible.

Data-first design: clear schemas, strict RBAC, auditability.

Build incrementally (MVP first, advanced features later).

2 — Entities (core + recommended auxiliaries)

Primary given: Citizen, Staff, Worker, Admin — these are sufficient as roles. But the system needs additional entities to model state and relations.

Essential entities (what to create and why)

User (profiles) — single table/collection for all accounts. role distinguishes Citizen/Staff/Worker/Admin.

Department — maps complaint categories to organizational units; staff belong to a department.

Complaint — central record for each complaint.

TimelineEntry (Track) — ordered updates (who, when, message, media); worker writes entries.

WorkerAssignment (optional) — assignment record linking worker ↔ complaint with status/time.

Attachment — metadata for uploaded files (URL, type, size, uploadedBy, timestamp).

Notification — notifications per user.

Feedback — rating + comments for closed complaints.

Chat / ChatMessage / BotSession — conversation records (bot and humans).

AuditLog — system-level logs for important actions (assignments, status changes, impersonation).

Category — canonical categories (Garbage, Road, Water, Electricity) — used by classifier.

Priority — simple enum: High/Medium/Low (with SLA thresholds).

SLA / Region (optional) — if municipality has zones with different SLAs.

Why add these? They make access control, analytics, UI rendering and future scaling cleaner.

3 — Data model (document and relational forms)

I’ll show MongoDB-style JSON document shapes (for MERN). For relational DBs convert fields to columns and FK constraints.

User (users collection)
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",          // unique
  "phone": "string",
  "passwordHash": "string",
  "role": "Citizen|Staff|Worker|Admin",
  "departmentId": "ObjectId|null", // for staff/workers
  "isActive": true,
  "createdAt": "ISODate",
  "lastLoginAt": "ISODate"
}

Department
{
  "_id": "ObjectId",
  "name": "string",           // e.g., "Water"
  "email": "string",
  "description": "string",
  "createdAt": "ISODate"
}

Complaint
{
  "_id": "ObjectId",
  "complaintId": "string", // user-friendly reference e.g., CM-2025-0001
  "title": "string",
  "description": "string",
  "category": "Water|Road|Garbage|Electricity|Other",
  "priority": "High|Medium|Low",
  "location": {
    "address": "string",
    "lat": 12.34,
    "lng": 56.78
  },
  "attachments": [
    { "url": "string", "type":"image|pdf|video", "uploadedBy":"userId", "uploadedAt":"ISODate" }
  ],
  "status": "Submitted|In Progress|Resolved|Closed",
  "citizenId": "ObjectId",
  "departmentId": "ObjectId",
  "assignedWorkerId": "ObjectId|null",
  "history": [ "timelineEntryId", ... ],
  "aiCategoryPredicted": "string|null",
  "aiConfidence": 0.0,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}

TimelineEntry (embedded or separate)
{
  "_id": "ObjectId",
  "complaintId": "ObjectId",
  "actorId": "ObjectId", // worker/staff/admin id
  "actorRole": "Worker|Staff|Admin",
  "actionType": "status_update|progress|note|photo",
  "message": "string",
  "media": [{ "url": "...", "type": "image" }],
  "timestamp": "ISODate"
}

ChatMessage
{
  "_id": "ObjectId",
  "complaintId": "ObjectId|null",
  "botSessionId": "string|null",
  "senderId": "ObjectId|null",
  "senderRole": "Citizen|Staff|Worker|Bot",
  "message": "string",
  "attachments": [],
  "timestamp":"ISODate",
  "escalatedToStaffId": "ObjectId|null"
}

Notification
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "type": "status_update|assignment|message|reminder",
  "title": "string",
  "body": "string",
  "meta": { ... },
  "read": false,
  "createdAt": "ISODate"
}

Feedback
{
  "_id": "ObjectId",
  "complaintId": "ObjectId",
  "citizenId": "ObjectId",
  "rating": 1-5,
  "comment": "string",
  "createdAt": "ISODate"
}

AuditLog
{
  "_id": "ObjectId",
  "userId": "ObjectId|null",
  "action": "assign_worker|status_change|impersonation|login_attempt",
  "details": {...},
  "timestamp":"ISODate"
}

4 — Entity relationships (ER summary)

User (1) ↔ (N) Complaint: a citizen creates many complaints.

Department (1) ↔ (N) Complaint: department handles many complaints.

User (Staff/Worker) ↔ (N) Complaint: staff/worker assigned to complaints.

Complaint (1) ↔ (N) TimelineEntry.

Complaint (1) ↔ (N) ChatMessage.

User (1) ↔ (N) Notification.

5 — API design (contract + examples)

I’ll group by functionality. Keep JSON examples small.

Auth

POST /auth/register — Citizens register.

Body: { name, email, phone, password }

Response: { user:{id,name,email}, token }

NOTE: Do not allow role=Admin registration. Staff registration can be: public + department dropdown OR admin-invite only depending on policy. Your requirement: staff register with department dropdown; system can require admin approval.

POST /auth/login

Body: { email, password }

Response: { token, user }

GET /auth/me — returns user profile, role, department.

Admin special

Admin account seeded or created only through initial setup CLI/migration. No public registration allowed.

Complaints

POST /api/complaints (auth: Citizen)

Body: { title, description, category?, location, attachments? }

Server: 1) store complaint; 2) call AI classifier -> predicted category/priority; 3) map to department; 4) set departmentId; 5) create notification to department staff.

Response: { complaintId, status }

GET /api/complaints/my (auth: Citizen)

Returns user's complaints with statuses and latest timeline.

GET /api/complaints/:id (auth: owner or staff/admin)

Returns complaint with timeline and attachments. For citizens: read-only.

PATCH /api/complaints/:id/assign (auth: Staff/Admin)

Body: { workerId } -> assign worker

PATCH /api/complaints/:id/status (auth: Staff/Worker)

Body: { status, message } -> also adds a timeline entry

POST /api/complaints/:id/timeline (auth: Worker)

Body: { actionType, message, media[] }

Chat

POST /api/chat/start — start bot session

POST /api/chat/:sessionId/message — send message

GET /api/chat/:complaintId — conversation history

Bot escalation endpoint: POST /api/chat/escalate -> creates notification for department staff

Notifications

GET /api/notifications (auth)

PATCH /api/notifications/:id/read

Feedback

POST /api/complaints/:id/feedback (auth: citizen)

Admin

GET /api/admin/analytics — stats

POST /api/admin/users — create staff/workers (optional)

POST /api/admin/seed-admin — initial admin creation (run-once CLI secured)

AI

POST /api/ai/classify — internal microservice call; not public.

Atomic components

Button (primary/secondary/ghost), props: size, disabled, icon, onClick.

Input (with icon, error state).

Card (glass style, shadow, hover lift).

Tag (priority colors).

Avatar, Badge.

Modal (confirm).

Stepper/Timeline — vertical timeline component with step blocks, dates, actor, media previews.

NotificationBell — dropdown list.

FileDropzone — drag-and-drop with previews.

DataTable — sortable, pageable.

ChartCard — wrapper for Chart.js/Recharts.

Pages (per role)

Top navbar: CivicMitra logo, search, notification bell, profile menu.

Sidebar (collapsible): icons and labels (Dashboard, Complaints, Chat, Reports).

Citizen

Dashboard (new complaint CTA, recent complaints, quick stats)

New Complaint (form)

My Complaints (list + filters)

Complaint Detail (read-only timeline, chat, attachments)

Staff

Department Dashboard (list prioritized complaints)

Complaint Detail (assign worker, see timeline)

Chat (department messages)

Worker

Assigned Complaints (task list)

Update Timeline (step form with photo upload)

Admin

Global Dashboard (KPIs, charts)

User/Dept Management

Audit Logs

Export reports

UX specifics

Responsive: mobile-first; shift tables to cards on small screens; Off-canvas sidebar.

Accessibility: input labels, aria attributes on interactive components, keyboard navigation.

Microinteractions: small hover shadows, subtle transitions, toasts for success/error.

Visual timeline: each timeline card shows date, actor role, message, attachments; newest at top or bottom (decide and be consistent).

7 — User flows & sequence descriptions (detailed)
Flow A — Citizen files complaint (detailed)

Citizen opens New Complaint form → fills title, desc, selects optional category, adds location + attachments.

Client validates fields; uploads attachments to storage (S3 or Supabase Storage) returning URLs.

Client POST /api/complaints with payload and token.

Backend persists complaint with status=Submitted.

Backend calls AI classifier microservice with description to get aiCategory and priorityPrediction.

Backend maps aiCategory → departmentId (via Category→Department mapping).

Backend updates complaint with departmentId, aiCategoryConfidence.

Backend pushes notification to the staff users of that department (via DB Notification + real-time if available).

Citizen receives confirmation with complaintId and initial timeline entry Submitted.

Staff sees item in their department dashboard (sorted by priority).

Flow B — Staff assigns worker

Staff opens complaint detail (only for their department).

Staff clicks "Assign Worker", selects worker from staff's department.

Backend creates assignment, updates assignedWorkerId, logs AuditLog.

Notification to worker is generated.

Flow C — Worker updates timeline (progress)

Worker opens assigned complaint.

Worker clicks "Add Update": enters action, remarks, attaches photo(s).

Client uploads media → gets URLs → POST /api/complaints/:id/timeline.

Backend appends TimelineEntry, updates complaint updatedAt.

Notifications to staff & citizen (read-only).

Staff sees updates; citizen sees read-only timeline.

Flow D — Chat escalation

Citizen opens chat; bot replies with FAQ / detection of category.

If bot fails or citizen asks to escalate, create chat message flagged escalationRequested.

Backend creates ChatMessage and notifies staff (or specific on-duty staff).

Staff answers in their dashboard. Messages saved.

Flow E — Admin operations

Admin views global analytics; can reassign complaints or adjust SLAs; audit logs accessible.

8 — AI integration (classifier)

Architecture

Separate microservice (Python FastAPI or Flask) hosting a BERT-based classifier (fine-tuned or zero-shot).

Endpoint: POST /classify → { text } → returns { category, priority, confidence }.

Backend calls classifier asynchronously or syncronously depending on latency. For fast UX: run async job and update complaint when done; return immediate response to user.

Data

Training: labeled past complaints (text -> category, priority).

Fallback: rules-based mapping for short-term.

Fallback & override

Always allow citizen or staff to override predicted category.

9 — Security & authorization (detailed)

Auth: JWT (access + refresh). Store access short-lived (e.g., 15m), refresh token httpOnly cookie or secure store.

Password storage: bcrypt/argon2 with strong salt rounds.

Role-based access: middleware requireRole(['Staff']) or requireDepartmentAccess.

Admin hardening:

Admin account created via secure seed or CLI.

No admin option in public registration.

Admin login protected with 2FA (optional).

Input validation & sanitization: use JOI/Zod for payloads; sanitize HTML (if any).

File uploads:

Virus scanning (if possible).

Limit size and allowed types.

Store in private bucket; generate signed URLs for downloads.

Rate limiting: protect auth endpoints.

Audit logging: every assignment, status change, login, impersonation must be logged.

CORS & CSP: configure headers for security.

HTTPS strictly in production.

OWASP: protect against injection, XSS, CSRF (if cookies used), broken auth, insecure deserialization.

10 — Performance & scalability

DB indexes:

complaints on { departmentId, status, priority, createdAt }.

users on { email }.

timeline on { complaintId, timestamp }.

Pagination for lists.

Caching: Redis for frequently used analytics; also for rate-limiting and session store if needed.

Async processing: Attachments uploads, AI classification, notifications handled by background workers (BullMQ/Sidekiq) to keep API responsive.

Horizontal scaling: stateless backend behind load balancer; store sessions in Redis or use JWT.

Storage: object storage (S3) for attachments.

11 — Monitoring, observability & ops

Logs: structured logs (winston or pino) with correlation IDs.

Error tracking: Sentry or equivalent.

Metrics: Prometheus/Grafana or cloud-based (NewRelic).

Health endpoints: /health checks DB + storage + AI service.

Backups: DB snapshots daily; retention policy per municipality rules.

Disaster recovery: playbook for restore.

CI/CD: GitHub Actions or GitLab CI — lint → tests → deploy to staging → manual approval → production.

12 — Testing strategy

Unit tests: controllers, model validation.

Integration tests: API endpoints with test DB (mongomock or ephemeral container).

E2E tests: Cypress for frontend flows (file complaint, worker update, feedback).

Load testing: k6 for key APIs (submission and listing).

Security tests: automated scanning for OWASP.

13 — Data privacy & retention

Personal data (phone, email) must comply with local laws.

Retention policy: keep resolved complaints for X years; purge or anonymize after policy period.

Provide data export and data deletion endpoints (GDPR-like if needed).

14 — Acceptance criteria & MVP

MVP (must-have):

Citizen registration & login, New Complaint form, AI classification hook (placeholder allowed), staff login & department-restricted dashboard, worker assignment + timeline updates visible read-only to citizens, notifications, admin seeded account, basic analytics.

Acceptance tests:

Citizen can file complaint and receive complaintId.

Staff sees only department complaints.

Worker can update timeline and citizen sees it read-only.

Admin can view KPIs and reassign complaint.

Advanced (phase 2):

Full AI classifier trained & deployed, chatbot escalation, export reports, multilingual support, GIS maps.
16 — Developer handoff checklist (what to implement first)

Freeze schema and API contracts (this document).

Seed admin account and departments.

Implement auth + RBAC + middleware.

Implement complaint model + create endpoint + attachments storage + basic UI.

Implement worker timeline + update endpoints + UI.

Implement assignment & notification flow.

Build staff dashboard with priority sorting & color-coded tags.

Implement chatbot stub + escalation path.

Add AI integration (asynchronous classifier).

Polish UI (design system) and accessibility.

17 — Sample request/response (for developer copy-paste)

Create Complaint

POST /api/complaints
Headers: Authorization: Bearer <token>
Body:
{
  "title": "Water pipe leakage near A-Block",
  "description": "Leaking pipe since 2 days causing flooding",
  "category": "Water",           // optional; AI may override
  "location": { "address":"A-Block", "lat":..., "lng":... },
  "attachments": [ "https://.../img1.jpg" ]
}
Response:
{ "complaintId": "CM-2025-0012", "status": "Submitted" }


Worker update timeline

POST /api/complaints/60f.../timeline
Headers: Authorization: Bearer <workerToken>
Body:
{
  "actionType": "progress",
  "message": "Replaced the damaged section. Testing ongoing.",
  "media": ["https://.../before.jpg", "https://.../after.jpg"]
}
Response: { "ok": true, "timelineEntryId": "..." }

18 — Risks & mitigations

AI misclassification → always allow override and log confidence; use human-in-loop.

Unauthorized access → strict RBAC + audit logs + rate limits.

Large media uploads → enforce size/type and offload to object storage.

Scaling spikes → use async jobs for heavy tasks; DB indexing.

Privacy/regulatory → document retention & deletion features.

19 — Final recommendations & next steps (practical)

Approve these schemas & API contracts (use as source-of-truth).

Create seed scripts:

departments (Water, Road, Waste, Electricity)

admin account (created by CLI script requiring secret).

Implement RBAC middleware and unit test it first.

Build UI component library (Button, Card, Input, Timeline) as a single source in /frontend/src/components/design-system.

Implement complaint submission + worker timeline first (critical path).

Add AI classifier as a background service and use job queue.