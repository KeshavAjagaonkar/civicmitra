# CivicMitra - Design Documentation

## Table of Contents
- [3.1 Software Model](#31-software-model)
  - [3.1.1 Phases of Software Model](#311-phases-of-software-model)
- [3.2 Proposed System](#32-proposed-system)
- [3.3 System Requirement Specification (SRS)](#33-system-requirement-specification-srs)
- [3.4 Design](#34-design)
  - [3.4.1 Gantt Chart (Timeline Chart)](#341-gantt-chart-timeline-chart)
  - [3.4.2 System Architecture](#342-system-architecture)
  - [3.4.3 Data Flow Diagrams](#343-data-flow-diagrams)
  - [3.4.4 Use Case Diagram](#344-use-case-diagram)
  - [3.4.5 Flowchart Diagram](#345-flowchart-diagram)
  - [3.4.6 Sequence Diagram](#346-sequence-diagram)
  - [3.4.7 Data Model Diagram](#347-data-model-diagram)
- [3.5 Risk Mitigation Monitoring and Management Plan](#35-risk-mitigation-monitoring-and-management-plan)

---

## 3.1 Software Model

CivicMitra follows the **Incremental Development Model**, which is well-suited for college projects with fixed timelines and clear deliverables. The system is developed in increments, where each increment adds new functionality to the existing system.

### Key Characteristics:
- **Phased Development**: System built in planned increments
- **Early Partial Delivery**: Core features delivered first, then enhanced
- **Reduced Risk**: Each increment is tested before moving to the next
- **Fixed Timeline**: Suitable for academic semester constraints
- **Clear Milestones**: Well-defined deliverables for evaluation

### 3.1.1 Phases of Software Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    INCREMENTAL DEVELOPMENT MODEL                        │
└─────────────────────────────────────────────────────────────────────────┘

Phase 1: REQUIREMENT ANALYSIS & PLANNING (Weeks 1-2)
┌─────────────────────────────────────────────────────────────┐
│ Activities:                                                 │
│ • Identify system requirements and constraints              │
│ • Study existing complaint management systems               │
│ • Define functional and non-functional requirements         │
│ • Plan incremental builds (4 increments)                    │
│ • Technology stack selection and justification              │
│                                                             │
│ Deliverables:                                               │
│ • Software Requirement Specification (SRS) document         │
│ • Feasibility study report                                  │
│ • Project plan with timeline                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
Phase 2: SYSTEM DESIGN (Weeks 3-4)
┌─────────────────────────────────────────────────────────────┐
│ Activities:                                                 │
│ • System architecture design (3-tier MERN architecture)     │
│ • Database design (ER diagrams, schema design)              │
│ • DFD (Level 0, 1, 2), Use case diagrams                   │
│ • Sequence diagrams, flowcharts                            │
│ • UI/UX mockups and wireframes                             │
│                                                             │
│ Deliverables:                                               │
│ • System Design Document (SDD)                              │
│ • Database schema                                           │
│ • All UML/design diagrams                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
Phase 3: INCREMENTAL IMPLEMENTATION (Weeks 5-14)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ INCREMENT 1: Core Authentication & User Management (Wk 5-6) │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ • User registration (Citizen, Staff, Worker, Admin) │    │
│ │ • Login/Logout with JWT authentication              │    │
│ │ • Role-based access control (RBAC)                  │    │
│ │ • User profile management                           │    │
│ │ • Password encryption (bcrypt)                      │    │
│ │                                                     │    │
│ │ Testing: Unit tests for auth APIs                  │    │
│ └─────────────────────────────────────────────────────┘    │
│                            ↓                                │
│ INCREMENT 2: Complaint Management System (Weeks 7-9)        │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ • Complaint submission form (title, desc, location) │    │
│ │ • Image upload functionality (Cloudinary)           │    │
│ │ • View complaints (citizen & staff dashboards)      │    │
│ │ • Complaint status tracking                         │    │
│ │ • Basic categorization and department assignment    │    │
│ │ • Timeline feature for complaint history            │    │
│ │                                                     │    │
│ │ Testing: Integration tests for complaint workflow  │    │
│ └─────────────────────────────────────────────────────┘    │
│                            ↓                                │
│ INCREMENT 3: Department & Worker Assignment (Weeks 10-11)   │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ • Department management (CRUD operations)           │    │
│ │ • Staff assigns complaints to workers               │    │
│ │ • Worker dashboard with assigned tasks              │    │
│ │ • Status updates by workers                         │    │
│ │ • Resolution proof upload                           │    │
│ │ • Feedback system for citizens                      │    │
│ │                                                     │    │
│ │ Testing: End-to-end workflow testing               │    │
│ └─────────────────────────────────────────────────────┘    │
│                            ↓                                │
│ INCREMENT 4: Advanced Features (Weeks 12-14)                │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ • AI-based complaint classification (Google Gemini) │    │
│ │ • AI summarization and sentiment analysis           │    │
│ │ • Real-time chat between citizen & staff            │    │
│ │ • Real-time notifications (Socket.io)               │    │
│ │ • Email notifications (Nodemailer)                  │    │
│ │ • Analytics dashboard (charts, reports)             │    │
│ │ • Export functionality (CSV, PDF)                   │    │
│ │                                                     │    │
│ │ Testing: Performance & security testing            │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
Phase 4: SYSTEM TESTING & INTEGRATION (Weeks 15-16)
┌─────────────────────────────────────────────────────────────┐
│ • Integration testing of all increments                     │
│ • System testing (functional & non-functional)              │
│ • User acceptance testing with sample data                  │
│ • Bug fixes and refinements                                 │
│ • Performance optimization                                  │
│                                                             │
│ Deliverables:                                               │
│ • Test case documents                                       │
│ • Test results and bug reports                              │
│ • Fully integrated system                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
Phase 5: DEPLOYMENT & DOCUMENTATION (Week 17)
┌─────────────────────────────────────────────────────────────┐
│ • Deploy on cloud platform (Render/Vercel/Railway)          │
│ • System demonstration preparation                          │
│ • User manual creation                                      │
│ • Technical documentation finalization                      │
│ • Project report preparation                                │
│                                                             │
│ Deliverables:                                               │
│ • Deployed application (live URL)                           │
│ • Complete project report                                   │
│ • User manual                                               │
│ • Project presentation (PPT/Demo)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
Phase 6: PROJECT EVALUATION & VIVA (Week 18)
┌─────────────────────────────────────────────────────────────┐
│ • Project demonstration to faculty                          │
│ • Viva voce examination                                     │
│ • Final report submission                                   │
│ • Source code submission                                    │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│            WHY INCREMENTAL MODEL FOR THIS PROJECT?          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✓ Fixed Timeline: Academic semester has fixed deadlines    │
│                                                             │
│ ✓ Manageable Scope: Each increment is small and testable   │
│                                                             │
│ ✓ Early Deliverables: Working system after each increment  │
│                                                             │
│ ✓ Risk Reduction: Issues identified early in each phase    │
│                                                             │
│ ✓ Progressive Complexity: Start simple, add advanced       │
│   features later (AI, real-time chat)                       │
│                                                             │
│ ✓ Evaluation Friendly: Faculty can assess progress at      │
│   each increment                                            │
│                                                             │
│ ✓ Realistic for Team Size: Manageable by 3-4 students      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3.2 Proposed System

### System Overview

**CivicMitra** is a comprehensive civic complaint management platform designed to bridge the communication gap between citizens and municipal authorities. The system leverages modern web technologies, AI-powered automation, and real-time communication to streamline civic issue resolution.

### Core Objectives

1. **Citizen Empowerment**: Enable citizens to report civic issues easily through an intuitive web interface
2. **Efficient Workflow**: Automate complaint routing using AI-based classification
3. **Transparency**: Provide real-time tracking and status updates for all complaints
4. **Accountability**: Track worker performance and department efficiency
5. **Data-Driven Decisions**: Generate insights through analytics dashboards

### Key Features

#### For Citizens:
- **Easy Complaint Submission**: Multi-step form with image upload, location tagging
- **AI-Assisted Classification**: Automatic categorization and department assignment
- **Real-Time Tracking**: View complaint status with detailed timeline
- **Chat Support**: Direct communication with department staff
- **Feedback System**: Rate resolution quality and provide comments
- **Email Notifications**: Automated updates on complaint progress

#### For Department Staff:
- **Dashboard Overview**: View all complaints assigned to their department
- **Worker Assignment**: Assign complaints to field workers based on availability
- **Status Management**: Update complaint status and add timeline events
- **Analytics**: Department performance metrics and resolution trends
- **Bulk Operations**: Export data, filter by multiple criteria

#### For Field Workers:
- **Task Management**: View assigned complaints with priority levels
- **Location Information**: Access complaint location and citizen details
- **Progress Updates**: Upload resolution proof images
- **Timeline Updates**: Add notes and status changes
- **Mobile-Friendly Interface**: Optimized for field use

#### For Administrators:
- **System-Wide Monitoring**: Overview of all departments and complaints
- **User Management**: Create and manage users across all roles
- **Department Management**: Add/edit departments and their details
- **Analytics Dashboard**: System-wide performance metrics
- **System Alerts**: Monitor critical issues and bottlenecks

### Technical Highlights

- **AI Integration**: Google Gemini API for intelligent complaint classification and summarization
- **Real-Time Communication**: Socket.io for instant notifications and chat
- **Cloud Storage**: Cloudinary for image and document management
- **Email Service**: Nodemailer for automated email notifications
- **Security**: JWT-based authentication, bcrypt password hashing, Helmet.js for HTTP headers
- **Responsive Design**: Mobile-first approach using React and Tailwind CSS

### System Benefits

| Stakeholder | Benefits |
|------------|----------|
| **Citizens** | Quick complaint submission, transparent tracking, faster resolutions |
| **Municipal Staff** | Streamlined workflow, reduced manual categorization, better organization |
| **Field Workers** | Clear task assignments, easy progress reporting, digital proof submission |
| **Administration** | Data-driven insights, performance monitoring, accountability tracking |
| **Government** | Improved citizen satisfaction, efficient resource allocation, reduced operational costs |

---

## 3.3 System Requirement Specification (SRS)

### 3.3.1 Functional Requirements

#### FR1: User Authentication & Authorization
- **FR1.1**: System shall support registration for citizens with email verification
- **FR1.2**: System shall provide role-based access control (Citizen, Staff, Worker, Admin)
- **FR1.3**: System shall implement JWT-based authentication with secure token management
- **FR1.4**: System shall hash passwords using bcrypt before storing
- **FR1.5**: System shall auto-generate unique slugs for user profiles

#### FR2: Complaint Management
- **FR2.1**: Citizens shall submit complaints with title, description, location, category, and attachments
- **FR2.2**: System shall support image upload (max 5 images, 5MB each) via Cloudinary
- **FR2.3**: System shall classify complaints using AI (Google Gemini) with confidence scoring
- **FR2.4**: System shall automatically assign complaints to appropriate departments
- **FR2.5**: System shall generate AI summaries with key points and sentiment analysis
- **FR2.6**: System shall track complaint status: Submitted → In Progress → Resolved → Closed
- **FR2.7**: System shall maintain detailed timeline with all status changes

#### FR3: Department & Worker Management
- **FR3.1**: Admin shall create departments with unique names and descriptions
- **FR3.2**: Staff shall assign complaints to workers within their department
- **FR3.3**: System shall track worker details: ID, specialization, experience, vehicle info
- **FR3.4**: Workers shall upload resolution proof images
- **FR3.5**: System shall filter complaints by department, status, and priority

#### FR4: Real-Time Communication
- **FR4.1**: System shall provide real-time chat between citizens and department staff
- **FR4.2**: System shall send real-time notifications using Socket.io
- **FR4.3**: System shall send email notifications for complaint updates
- **FR4.4**: System shall support bot messages in chat for automated responses

#### FR5: Feedback & Analytics
- **FR5.1**: Citizens shall provide ratings (1-5) and comments after complaint resolution
- **FR5.2**: System shall generate analytics dashboards with complaint trends
- **FR5.3**: System shall calculate department efficiency metrics
- **FR5.4**: System shall export data in CSV/Excel/PDF formats

### 3.3.2 Non-Functional Requirements

#### NFR1: Performance
- **NFR1.1**: System shall respond to user requests within 2 seconds (95th percentile)
- **NFR1.2**: System shall support 1000+ concurrent users
- **NFR1.3**: Database queries shall be optimized with proper indexing
- **NFR1.4**: Images shall be compressed and cached for faster loading

#### NFR2: Security
- **NFR2.1**: System shall use HTTPS for all communications
- **NFR2.2**: System shall implement CORS policies to prevent unauthorized access
- **NFR2.3**: System shall use Helmet.js to set secure HTTP headers
- **NFR2.4**: System shall implement rate limiting to prevent DoS attacks
- **NFR2.5**: System shall sanitize all user inputs to prevent XSS and SQL injection

#### NFR3: Scalability
- **NFR3.1**: System architecture shall support horizontal scaling
- **NFR3.2**: Database shall be designed for sharding capabilities
- **NFR3.3**: Static assets shall be served via CDN

#### NFR4: Usability
- **NFR4.1**: UI shall be responsive and mobile-friendly
- **NFR4.2**: System shall provide intuitive navigation with clear labels
- **NFR4.3**: Error messages shall be user-friendly and actionable
- **NFR4.4**: System shall be accessible (WCAG 2.1 Level AA compliance)

#### NFR5: Reliability
- **NFR5.1**: System shall have 99.5% uptime
- **NFR5.2**: System shall implement automated backups (daily)
- **NFR5.3**: System shall have disaster recovery plan with 4-hour RTO

#### NFR6: Maintainability
- **NFR6.1**: Code shall follow consistent style guidelines (ESLint, Prettier)
- **NFR6.2**: System shall have comprehensive API documentation
- **NFR6.3**: System shall implement error logging (Morgan, Winston)

### 3.3.3 System Constraints

- **SC1**: Internet connectivity required for all operations
- **SC2**: Modern web browser required (Chrome 90+, Firefox 88+, Safari 14+)
- **SC3**: Third-party dependencies: Google Gemini API, Cloudinary, SMTP server
- **SC4**: Database: MongoDB 5.0+
- **SC5**: Node.js runtime: v16+ required

---

## 3.4 Design

### 3.4.1 Gantt Chart (Timeline Chart)

```
CivicMitra Project Timeline (17 Weeks)
═══════════════════════════════════════════════════════════════════════════

Task                            │ W1 │ W2 │ W3 │ W4 │ W5 │ W6 │ W7 │ W8 │ W9 │ W10│ W11│ W12│ W13│ W14│ W15│ W16│ W17│
────────────────────────────────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
PHASE 1: PLANNING               │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │
Requirements Gathering          │████│████│    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │
Stakeholder Analysis            │████│████│    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │
Feasibility Study               │    │████│    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │
────────────────────────────────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
PHASE 2: DESIGN                 │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │
System Architecture             │    │    │████│████│    │    │    │    │    │    │    │    │    │    │    │    │    │
Database Schema Design          │    │    │████│████│    │    │    │    │    │    │    │    │    │    │    │    │    │
UI/UX Design & Prototyping      │    │    │    │████│████│    │    │    │    │    │    │    │    │    │    │    │    │
API Documentation               │    │    │    │████│    │    │    │    │    │    │    │    │    │    │    │    │    │
────────────────────────────────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
PHASE 3: DEVELOPMENT            │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │
Sprint 1: Authentication        │    │    │    │    │████│████│    │    │    │    │    │    │    │    │    │    │    │
Sprint 2: Complaint System      │    │    │    │    │    │    │████│████│    │    │    │    │    │    │    │    │    │
Sprint 3: Dept & Worker Mgmt    │    │    │    │    │    │    │    │    │████│████│    │    │    │    │    │    │    │
Sprint 4: Chat & Notifications  │    │    │    │    │    │    │    │    │    │    │████│████│    │    │    │    │    │
Sprint 5: AI & Analytics        │    │    │    │    │    │    │    │    │    │    │    │    │████│████│    │    │    │
────────────────────────────────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
PHASE 4: TESTING                │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │
Unit Testing (Continuous)       │    │    │    │    │░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│░░░░│    │    │    │
Integration Testing             │    │    │    │    │    │    │    │    │    │    │    │    │    │    │████│    │    │
UAT & Performance Testing       │    │    │    │    │    │    │    │    │    │    │    │    │    │    │████│████│    │
Security Testing                │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │████│    │
────────────────────────────────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
PHASE 5: DEPLOYMENT             │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │
Infrastructure Setup            │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │████│████│
Database Migration              │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │████│
Production Deployment           │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │████│
────────────────────────────────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
PHASE 6: HANDOVER               │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │
Documentation                   │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │████│████│
Training & Support              │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │████│

Legend: ████ = Active Development  ░░░░ = Continuous Activity
```

### Key Milestones:
- **Week 2**: Requirements finalized
- **Week 4**: Design sign-off
- **Week 6**: Authentication module complete
- **Week 10**: Core complaint management complete
- **Week 14**: AI integration complete
- **Week 16**: Testing complete
- **Week 17**: Production deployment

---

### 3.4.2 System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         CIVICMITRA SYSTEM ARCHITECTURE                     │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Citizen    │  │    Staff     │  │   Worker     │  │    Admin     │  │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │                 │           │
│         └─────────────────┴─────────────────┴─────────────────┘           │
│                                    │                                        │
│                    ┌───────────────▼───────────────┐                       │
│                    │      REACT FRONTEND           │                       │
│                    │  (React 19.1 + Vite)         │                       │
│                    ├───────────────────────────────┤                       │
│                    │ • React Router (Navigation)   │                       │
│                    │ • Axios (HTTP Client)         │                       │
│                    │ • Socket.io-client (WebSoc)   │                       │
│                    │ • Tailwind CSS (Styling)      │                       │
│                    │ • Radix UI (Components)       │                       │
│                    │ • React Hook Form (Forms)     │                       │
│                    │ • Recharts (Analytics)        │                       │
│                    └───────────────┬───────────────┘                       │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                                     │ HTTPS / WSS
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                           APPLICATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    ┌───────────────────────────────┐                        │
│                    │    EXPRESS.JS SERVER          │                        │
│                    │    (Node.js 16+)              │                        │
│                    └───────────────┬───────────────┘                        │
│                                    │                                        │
│    ┌───────────────────────────────┼───────────────────────────────┐       │
│    │              MIDDLEWARE LAYER                                 │       │
│    ├──────────────────────────────────────────────────────────────┤       │
│    │ • Helmet.js (Security Headers)                               │       │
│    │ • CORS (Cross-Origin Resource Sharing)                       │       │
│    │ • Morgan (HTTP Logging)                                      │       │
│    │ • Express Rate Limit (API Throttling)                        │       │
│    │ • JWT Authentication Middleware                              │       │
│    │ • Multer (File Upload)                                       │       │
│    │ • Error Handler Middleware                                   │       │
│    └──────────────────────────┬───────────────────────────────────┘       │
│                               │                                            │
│    ┌──────────────────────────▼────────────────────────────┐              │
│    │                  ROUTING LAYER                         │              │
│    ├────────────────────────────────────────────────────────┤              │
│    │  /api/auth         │  Authentication & Authorization   │              │
│    │  /api/users        │  User Management                  │              │
│    │  /api/complaints   │  Complaint CRUD Operations        │              │
│    │  /api/departments  │  Department Management            │              │
│    │  /api/chats        │  Chat & Messaging                 │              │
│    │  /api/notifications│  Notification Management          │              │
│    │  /api/feedback     │  Feedback System                  │              │
│    │  /api/admin        │  Admin Operations                 │              │
│    └────────────────────────┬──────────────────────────────┘              │
│                             │                                              │
│    ┌────────────────────────▼──────────────────────────────┐              │
│    │              CONTROLLER LAYER                          │              │
│    ├───────────────────────────────────────────────────────┤              │
│    │ • authController          • complaintController        │              │
│    │ • userController          • departmentController       │              │
│    │ • chatController          • notificationController     │              │
│    │ • feedbackController      • adminController            │              │
│    └────────────────────────┬──────────────────────────────┘              │
│                             │                                              │
└─────────────────────────────┼──────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────────────────────┐
│                            BUSINESS LOGIC LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌─────────────────────────────────────────────────────────────┐         │
│    │                      MODELS (Mongoose)                       │         │
│    ├─────────────────────────────────────────────────────────────┤         │
│    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │         │
│    │  │   User   │  │Complaint │  │Department│  │   Chat   │   │         │
│    │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │         │
│    │  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │         │
│    │  │Feedback  │  │Notification│ │SystemAlert│                │         │
│    │  └──────────┘  └──────────┘  └──────────┘                 │         │
│    └─────────────────────────────────────────────────────────────┘         │
│                                                                             │
│    ┌─────────────────────────────────────────────────────────────┐         │
│    │                    UTILITY SERVICES                          │         │
│    ├─────────────────────────────────────────────────────────────┤         │
│    │ • nlpClassifier.js      (AI Classification Logic)           │         │
│    │ • socket.js             (Socket.io Configuration)           │         │
│    │ • errorResponse.js      (Error Handling)                    │         │
│    │ • emailService.js       (Nodemailer Integration)            │         │
│    └─────────────────────────────────────────────────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                         DATA PERSISTENCE LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    ┌───────────────────────────────┐                        │
│                    │      MongoDB Database         │                        │
│                    │      (NoSQL - v5.0+)          │                        │
│                    ├───────────────────────────────┤                        │
│                    │ Collections:                  │                        │
│                    │ • users                       │                        │
│                    │ • complaints                  │                        │
│                    │ • departments                 │                        │
│                    │ • chats                       │                        │
│                    │ • notifications               │                        │
│                    │ • feedbacks                   │                        │
│                    │ • systemalerts                │                        │
│                    └───────────────────────────────┘                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │  Google Gemini   │  │   Cloudinary     │  │  Email Service   │         │
│  │   AI API         │  │  Cloud Storage   │  │   (SMTP)         │         │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤         │
│  │ • NLP Analysis   │  │ • Image Upload   │  │ • Nodemailer     │         │
│  │ • Classification │  │ • Storage        │  │ • Notifications  │         │
│  │ • Summarization  │  │ • Transformation │  │ • Alerts         │         │
│  │ • Sentiment      │  │ • CDN Delivery   │  │                  │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        REAL-TIME COMMUNICATION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    ┌───────────────────────────────┐                        │
│                    │      Socket.io Server         │                        │
│                    ├───────────────────────────────┤                        │
│                    │ Events:                       │                        │
│                    │ • notification:new            │                        │
│                    │ • chat:message                │                        │
│                    │ • complaint:update            │                        │
│                    │ • worker:assigned             │                        │
│                    └───────────────────────────────┘                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

ARCHITECTURE PATTERN: Three-Tier Architecture (Presentation → Application → Data)
ARCHITECTURAL STYLE: Monolithic with Service-Oriented Design (SOD)
COMMUNICATION: REST API + WebSocket (Socket.io)
```

---

### 3.4.3 Data Flow Diagrams

#### DFD Level 0 (Context Diagram)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        CONTEXT DIAGRAM (Level 0)                           │
└────────────────────────────────────────────────────────────────────────────┘

                                  ┌─────────────┐
                                  │             │
                                  │   Citizen   │
                                  │             │
                                  └──────┬──────┘
                                         │
                      Complaint Details, │
                      Feedback, Chat     │ Complaint Status,
                      Messages           │ Notifications,
                                         │ Chat Responses
                     ┌───────────────────▼──────────────────┐
                     │                                       │
    ┌────────────┐   │                                       │   ┌────────────┐
    │Department  │   │                                       │   │  Field     │
    │   Staff    ├───►         CivicMitra System            ◄───┤  Worker    │
    │            │   │      (Complaint Management)          │   │            │
    └────────────┘   │                                       │   └────────────┘
         │           └───────────────────┬──────────────────┘           │
         │                               │                              │
    Assign Worker,                       │                      Upload Resolution
    Update Status,                       │                      Proof, Update
    View Reports                         │                      Progress
                                         │
                                  ┌──────▼──────┐
                                  │             │
                                  │    Admin    │
                                  │             │
                                  └──────┬──────┘
                                         │
                                    Manage Users,
                                    Departments,
                                    System Config

         ┌────────────────────────────────────────────────────────┐
         │ External Systems:                                      │
         │ • Google Gemini AI (Classification & Summarization)    │
         │ • Cloudinary (Image Storage)                          │
         │ • SMTP Server (Email Notifications)                   │
         └────────────────────────────────────────────────────────┘
```

#### DFD Level 1 (Major Processes)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW DIAGRAM (Level 1)                       │
└────────────────────────────────────────────────────────────────────────────┘

┌──────────┐                                                      ┌──────────┐
│ Citizen  │                                                      │  Staff   │
└────┬─────┘                                                      └────┬─────┘
     │                                                                 │
     │ 1. Registration/Login                                          │
     │                                                                 │
     ├──────────────────────┐                       ┌─────────────────┤
     │                      ▼                       ▼                 │
     │              ┌──────────────────┐    ┌──────────────────┐     │
     │              │   1.0 Manage     │    │   5.0 Manage     │     │
     │              │   Authentication │    │   Departments    │     │
     │              └────────┬─────────┘    └────────┬─────────┘     │
     │                       │                       │               │
     │                JWT Token                Department Data       │
     │                       │                       │               │
     │              ┌────────▼───────────────────────▼─────┐         │
     │              │           User Database             │         │
     │              └─────────────────────────────────────┘         │
     │                                                               │
     │ 2. Submit Complaint                                           │
     │ (Title, Desc, Images, Location)                               │
     │                                                               │
     ├──────────────────────┐                                        │
     │                      ▼                                        │
     │              ┌──────────────────┐                             │
     │              │   2.0 Complaint  │                             │
     │              │   Submission     │                             │
     │              └────────┬─────────┘                             │
     │                       │                                       │
     │                       │ 2.1 Upload Images                     │
     │                       ▼                                       │
     │              ┌──────────────────┐                             │
     │              │   Cloudinary     │                             │
     │              │   (Image Store)  │                             │
     │              └────────┬─────────┘                             │
     │                       │ Image URLs                            │
     │                       │                                       │
     │                       │ 2.2 AI Classification                 │
     │                       ▼                                       │
     │              ┌──────────────────┐                             │
     │              │  Google Gemini   │                             │
     │              │  AI Classifier   │                             │
     │              └────────┬─────────┘                             │
     │                       │ Category, Dept, Summary              │
     │                       │                                       │
     │              ┌────────▼─────────┐                             │
     │              │   Complaint DB   │                             │
     │              └────────┬─────────┘                             │
     │                       │                                       │
     │ 3. Notification       │ 3.1 Email Alert                       │
     │ ◄─────────────────────┼──────────────────────────────────────►│
     │                       │                                       │
     │              ┌────────▼─────────┐                             │
     │              │   3.0 Send       │                             │
     │              │   Notifications  │                             │
     │              └──────────────────┘                             │
     │                                                               │
     │                       4. View Complaints                      │
     │                       ◄───────────────────────────────────────┤
     │                                                               │
     │                                           5. Assign to Worker │
     │                                           ◄────────────────────
     │                                                               │
     │                                                  ┌──────────┐ │
     │                                                  │  Worker  │ │
     │                                                  └────┬─────┘ │
     │                                                       │       │
     │                       6. View Assigned Tasks          │       │
     │                       ◄───────────────────────────────┤       │
     │                                                       │       │
     │              ┌────────────────────┐                   │       │
     │              │   4.0 Complaint    │                   │       │
     │              │   Tracking &       │                   │       │
     │              │   Updates          │                   │       │
     │              └────────┬───────────┘                   │       │
     │                       │                               │       │
     │                       │ 7. Upload Resolution Proof    │       │
     │                       ◄───────────────────────────────┤       │
     │                       │                                       │
     │ 8. View Status        │                                       │
     │ ◄─────────────────────┤                                       │
     │                       │                                       │
     │ 9. Submit Feedback    │                                       │
     │ ──────────────────────►                                       │
     │                       │                                       │
     │              ┌────────▼─────────┐                             │
     │              │   6.0 Feedback   │                             │
     │              │   Management     │                             │
     │              └────────┬─────────┘                             │
     │                       │                                       │
     │              ┌────────▼─────────┐                             │
     │              │   Feedback DB    │                             │
     │              └──────────────────┘                             │
     │                                                               │
     │              ┌────────────────────┐                   ┌──────────┐
     │              │   7.0 Real-Time    │                   │  Admin   │
     │              │   Chat System      │◄──────────────────┤          │
     │              └────────┬───────────┘                   └──────────┘
     │                       │                                       │
     │ 10. Chat Messages     │                                       │
     │ ◄────────────────────►│                                       │
     │                       │                               11. Analytics
     │              ┌────────▼─────────┐                             │
     │              │     Chat DB      │                             │
     │              └──────────────────┘                             │
     │                                                               │
     │                                                 ┌─────────────▼────────┐
     │                                                 │   8.0 Analytics &    │
     │                                                 │   Reporting Engine   │
     │                                                 └──────────────────────┘

Data Stores:
D1: User Database
D2: Complaint Database
D3: Department Database
D4: Chat Database
D5: Notification Database
D6: Feedback Database
```

#### DFD Level 2 (Complaint Submission Process - Detailed)

```
┌────────────────────────────────────────────────────────────────────────────┐
│              DATA FLOW DIAGRAM Level 2: Complaint Submission               │
└────────────────────────────────────────────────────────────────────────────┘

┌──────────┐
│ Citizen  │
└────┬─────┘
     │
     │ Complaint Form Data
     │ (title, description, location, images)
     │
     ▼
┌────────────────────┐
│ 2.1 Validate Input │
│  (Zod Schema)      │
└────────┬───────────┘
         │
         │ Validated Data
         ▼
┌────────────────────┐          ┌──────────────────┐
│ 2.2 Upload Images  ├─────────►│   Cloudinary     │
│  (Multer)          │          │   API            │
└────────┬───────────┘          └─────────┬────────┘
         │                                │
         │                                │ Image URLs,
         │ Complaint Data + Image URLs    │ public_ids
         │                                │
         ▼                                │
┌────────────────────┐                    │
│ 2.3 Call AI        │                    │
│  Classification    │                    │
└────────┬───────────┘                    │
         │                                │
         │ Title + Description            │
         ▼                                │
┌────────────────────┐                    │
│  Google Gemini AI  │                    │
│  NLP Service       │                    │
└────────┬───────────┘                    │
         │                                │
         │ Category, Department,          │
         │ Summary, Sentiment,            │
         │ Confidence Score               │
         ▼                                │
┌────────────────────┐                    │
│ 2.4 Create         │◄───────────────────┘
│  Complaint Record  │
└────────┬───────────┘
         │
         │ Complete Complaint Object
         ▼
┌────────────────────┐
│   D2: Complaint    │
│    Database        │
└────────┬───────────┘
         │
         │ Complaint ID
         │
         ├────────────────────────────────┐
         │                                │
         ▼                                ▼
┌────────────────────┐          ┌────────────────────┐
│ 2.5 Create Chat    │          │ 2.6 Send Email     │
│  Thread            │          │  Notification      │
└────────┬───────────┘          └────────┬───────────┘
         │                                │
         ▼                                ▼
┌────────────────────┐          ┌────────────────────┐
│   D4: Chat DB      │          │  Nodemailer SMTP   │
└────────────────────┘          └────────────────────┘
         │                                │
         ├────────────────────────────────┤
         │                                │
         ▼                                ▼
┌────────────────────┐          ┌────────────────────┐
│ 2.7 Notify Staff   │          │ 2.8 Send Real-Time │
│  via Socket.io     │          │  Notification      │
└────────┬───────────┘          └────────┬───────────┘
         │                                │
         ▼                                ▼
┌────────────────────┐          ┌────────────────────┐
│ Staff Dashboard    │          │  Notification DB   │
│  (Real-time Update)│          │  (D5)              │
└────────────────────┘          └────────────────────┘
         │
         │ Success Response
         ▼
┌────────────────────┐
│  Return to Citizen │
│  (Complaint ID +   │
│   Status)          │
└────────────────────┘
```

---

### 3.4.4 Use Case Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                            USE CASE DIAGRAM                                │
│                          CivicMitra System                                 │
└────────────────────────────────────────────────────────────────────────────┘


                                    System Boundary
    ┌───────────────────────────────────────────────────────────────────┐
    │                                                                   │
┌───────┐                    AUTHENTICATION                            │
│Citizen│─────────────┐                                                │
└───────┘             │    ┌──────────────────┐                        │
                      ├───►│    Register      │                        │
┌───────┐             │    └──────────────────┘                        │
│ Staff │─────────────┤                                                │
└───────┘             │    ┌──────────────────┐                        │
                      ├───►│      Login       │                        │
┌───────┐             │    └──────────────────┘                        │
│Worker │─────────────┤                                                │
└───────┘             │    ┌──────────────────┐                        │
                      ├───►│     Logout       │                        │
┌───────┐             │    └──────────────────┘                        │
│ Admin │─────────────┘                                                │
└───────┘                                                               │
    │                          CITIZEN USE CASES                       │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    │                  │Submit Complaint  │                            │
    │                  └────────┬─────────┘                            │
    │                           │                                      │
    │                           │ <<include>>                          │
    │                           ▼                                      │
    │                  ┌──────────────────┐                            │
    │                  │ Upload Images    │                            │
    │                  └──────────────────┘                            │
    │                           │                                      │
    │                           │ <<extend>>                           │
    │                           ▼                                      │
    │                  ┌──────────────────┐                            │
    │                  │AI Auto-Classify  │                            │
    │                  └──────────────────┘                            │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│View My Complaints│                            │
    │                  └──────────────────┘                            │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│Track Status      │                            │
    │                  └────────┬─────────┘                            │
    │                           │                                      │
    │                           │ <<include>>                          │
    │                           ▼                                      │
    │                  ┌──────────────────┐                            │
    │                  │View Timeline     │                            │
    │                  └──────────────────┘                            │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│Chat with Staff   │◄──────────────────┐       │
    │                  └──────────────────┘                    │       │
    │                                                           │       │
    │                  ┌──────────────────┐                    │       │
    ├─────────────────►│Submit Feedback   │                    │       │
    │                  └──────────────────┘                    │       │
    │                                                           │       │
    │                  ┌──────────────────┐                    │       │
    ├─────────────────►│Receive           │                    │       │
    │                  │Notifications     │                    │       │
    │                  └──────────────────┘                    │       │
    │                                                           │       │
┌───────┐                 STAFF USE CASES                      │       │
│ Staff │                                                       │       │
└───┬───┘                                                       │       │
    │                  ┌──────────────────┐                    │       │
    ├─────────────────►│View Department   │                    │       │
    │                  │Complaints        │                    │       │
    │                  └──────────────────┘                    │       │
    │                                                           │       │
    │                  ┌──────────────────┐                    │       │
    ├─────────────────►│Assign to Worker  │                    │       │
    │                  └────────┬─────────┘                    │       │
    │                           │                              │       │
    │                           │ <<include>>                  │       │
    │                           ▼                              │       │
    │                  ┌──────────────────┐                    │       │
    │                  │Select Worker     │                    │       │
    │                  └──────────────────┘                    │       │
    │                                                           │       │
    │                  ┌──────────────────┐                    │       │
    ├─────────────────►│Update Status     │                    │       │
    │                  └────────┬─────────┘                    │       │
    │                           │                              │       │
    │                           │ <<include>>                  │       │
    │                           ▼                              │       │
    │                  ┌──────────────────┐                    │       │
    │                  │Add Timeline Event│                    │       │
    │                  └──────────────────┘                    │       │
    │                                                           │       │
    │                  ┌──────────────────┐                    │       │
    ├─────────────────►│Chat with Citizen │────────────────────┘       │
    │                  └──────────────────┘                            │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│View Analytics    │                            │
    │                  └──────────────────┘                            │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│Export Reports    │                            │
    │                  └──────────────────┘                            │
    │                                                                   │
┌───────┐                WORKER USE CASES                              │
│Worker │                                                               │
└───┬───┘                                                               │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│View Assigned     │                            │
    │                  │Tasks             │                            │
    │                  └──────────────────┘                            │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│Update Progress   │                            │
    │                  └────────┬─────────┘                            │
    │                           │                                      │
    │                           │ <<include>>                          │
    │                           ▼                                      │
    │                  ┌──────────────────┐                            │
    │                  │Upload Resolution │                            │
    │                  │Proof Images      │                            │
    │                  └──────────────────┘                            │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│View Complaint    │                            │
    │                  │Details           │                            │
    │                  └──────────────────┘                            │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│Receive Task      │                            │
    │                  │Notifications     │                            │
    │                  └──────────────────┘                            │
    │                                                                   │
┌───────┐                 ADMIN USE CASES                              │
│ Admin │                                                               │
└───┬───┘                                                               │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│Manage Users      │                            │
    │                  └────────┬─────────┘                            │
    │                           │                                      │
    │                           ├──►┌──────────────┐                  │
    │                           │   │Create User   │                  │
    │                           │   └──────────────┘                  │
    │                           │                                      │
    │                           ├──►┌──────────────┐                  │
    │                           │   │Edit User     │                  │
    │                           │   └──────────────┘                  │
    │                           │                                      │
    │                           └──►┌──────────────┐                  │
    │                               │Delete User   │                  │
    │                               └──────────────┘                  │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│Manage Departments│                            │
    │                  └────────┬─────────┘                            │
    │                           │                                      │
    │                           ├──►┌──────────────┐                  │
    │                           │   │Add Department│                  │
    │                           │   └──────────────┘                  │
    │                           │                                      │
    │                           └──►┌──────────────┐                  │
    │                               │Edit Department                  │
    │                               └──────────────┘                  │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│View All          │                            │
    │                  │Complaints        │                            │
    │                  └──────────────────┘                            │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│Generate System   │                            │
    │                  │Reports           │                            │
    │                  └──────────────────┘                            │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│Monitor System    │                            │
    │                  │Performance       │                            │
    │                  └──────────────────┘                            │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    ├─────────────────►│Configure System  │                            │
    │                  │Settings          │                            │
    │                  └──────────────────┘                            │
    │                                                                   │
    │                                                                   │
    │                  EXTERNAL ACTORS                                 │
    │                                                                   │
    │                  ┌──────────────────┐                            │
    │            ┌────►│Google Gemini AI  │                            │
    │            │     └──────────────────┘                            │
    │            │                                                      │
    │            │     ┌──────────────────┐                            │
    │            ├────►│Cloudinary        │                            │
    │            │     └──────────────────┘                            │
    │            │                                                      │
    │  <<uses>>  │     ┌──────────────────┐                            │
    │            └────►│Email Service     │                            │
    │                  └──────────────────┘                            │
    │                                                                   │
    └───────────────────────────────────────────────────────────────────┘
```

---

### 3.4.5 Flowchart Diagram

#### Complaint Submission Flowchart

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     COMPLAINT SUBMISSION FLOWCHART                         │
└────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────┐
                              │ START   │
                              └────┬────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  Citizen Logged In?  │
                        └──────────┬───────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                    NO                          YES
                     │                           │
                     ▼                           ▼
           ┌──────────────────┐      ┌──────────────────────┐
           │ Redirect to      │      │ Show Complaint       │
           │ Login Page       │      │ Submission Form      │
           └──────────────────┘      └──────────┬───────────┘
                     │                           │
                     │                           ▼
                     │              ┌──────────────────────┐
                     │              │ Enter Complaint      │
                     │              │ Details:             │
                     │              │ • Title              │
                     │              │ • Description        │
                     │              │ • Location           │
                     │              │ • Category (opt)     │
                     │              └──────────┬───────────┘
                     │                         │
                     │                         ▼
                     │              ┌──────────────────────┐
                     │              │ Upload Images?       │
                     │              └──────────┬───────────┘
                     │                         │
                     │              ┌──────────┴─────────┐
                     │              │                    │
                     │             YES                   NO
                     │              │                    │
                     │              ▼                    │
                     │   ┌──────────────────────┐       │
                     │   │ Select & Upload      │       │
                     │   │ Images (max 5)       │       │
                     │   └──────────┬───────────┘       │
                     │              │                    │
                     │              │ Validate:          │
                     │              │ • Max 5 images     │
                     │              │ • Size < 5MB each  │
                     │              │                    │
                     │              ▼                    │
                     │   ┌──────────────────────┐       │
                     │   │ Images Valid?        │       │
                     │   └──────────┬───────────┘       │
                     │              │                    │
                     │   ┌──────────┴─────────┐         │
                     │   │                    │         │
                     │  NO                   YES        │
                     │   │                    │         │
                     │   ▼                    │         │
                     │ ┌──────────────┐       │         │
                     │ │ Show Error   │       │         │
                     │ │ Message      │       │         │
                     │ └──────┬───────┘       │         │
                     │        │               │         │
                     │        └───────┐       │         │
                     │                │       │         │
                     │                └───────┴─────────┘
                     │                        │
                     │                        ▼
                     │             ┌──────────────────────┐
                     │             │ Click Submit         │
                     │             └──────────┬───────────┘
                     │                        │
                     │                        ▼
                     │             ┌──────────────────────┐
                     │             │ Validate Form Data   │
                     │             │ (Zod Schema)         │
                     │             └──────────┬───────────┘
                     │                        │
                     │             ┌──────────┴─────────┐
                     │             │                    │
                     │            NO                   YES
                     │             │                    │
                     │             ▼                    ▼
                     │   ┌──────────────────┐  ┌──────────────────────┐
                     │   │ Show Validation  │  │ Upload Images to     │
                     │   │ Errors           │  │ Cloudinary           │
                     │   └──────────────────┘  └──────────┬───────────┘
                     │             │                      │
                     │             │                      ▼
                     │             │           ┌──────────────────────┐
                     │             │           │ Call Google Gemini   │
                     │             │           │ AI for:              │
                     │             │           │ • Classification     │
                     │             │           │ • Dept Assignment    │
                     │             │           │ • Summarization      │
                     │             │           │ • Sentiment Analysis │
                     │             │           └──────────┬───────────┘
                     │             │                      │
                     │             │                      ▼
                     │             │           ┌──────────────────────┐
                     │             │           │ AI Successful?       │
                     │             │           └──────────┬───────────┘
                     │             │                      │
                     │             │           ┌──────────┴─────────┐
                     │             │           │                    │
                     │             │          NO                   YES
                     │             │           │                    │
                     │             │           ▼                    ▼
                     │             │  ┌──────────────────┐  ┌──────────────────┐
                     │             │  │ Use Default      │  │ Use AI Results   │
                     │             │  │ Category/Dept    │  │                  │
                     │             │  └──────────┬───────┘  └────────┬─────────┘
                     │             │             │                   │
                     │             │             └───────────────────┘
                     │             │                        │
                     │             │                        ▼
                     │             │             ┌──────────────────────┐
                     │             │             │ Save Complaint to DB │
                     │             │             └──────────┬───────────┘
                     │             │                        │
                     │             │                        ▼
                     │             │             ┌──────────────────────┐
                     │             │             │ Create Chat Thread   │
                     │             │             └──────────┬───────────┘
                     │             │                        │
                     │             │                        ▼
                     │             │             ┌──────────────────────┐
                     │             │             │ Create Notification  │
                     │             │             │ for Dept Staff       │
                     │             │             └──────────┬───────────┘
                     │             │                        │
                     │             │                        ▼
                     │             │             ┌──────────────────────┐
                     │             │             │ Send Email           │
                     │             │             │ Notification         │
                     │             │             └──────────┬───────────┘
                     │             │                        │
                     │             │                        ▼
                     │             │             ┌──────────────────────┐
                     │             │             │ Emit Socket Event    │
                     │             │             │ (Real-time Update)   │
                     │             │             └──────────┬───────────┘
                     │             │                        │
                     │             │                        ▼
                     │             │             ┌──────────────────────┐
                     │             │             │ Show Success Message │
                     │             │             │ with Complaint ID    │
                     │             │             └──────────┬───────────┘
                     │             │                        │
                     │             │                        ▼
                     │             │             ┌──────────────────────┐
                     │             │             │ Redirect to          │
                     │             │             │ Complaint Details    │
                     │             │             └──────────┬───────────┘
                     │             │                        │
                     └─────────────┴────────────────────────┘
                                                  │
                                                  ▼
                                            ┌──────────┐
                                            │   END    │
                                            └──────────┘
```

---

### 3.4.6 Sequence Diagram

#### Complaint Lifecycle Sequence Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        COMPLAINT LIFECYCLE SEQUENCE                        │
└────────────────────────────────────────────────────────────────────────────┘

Citizen    Frontend    Backend     Database   Gemini AI  Cloudinary  Email    Staff    Worker
   │           │           │           │           │           │        │        │        │
   │ Submit    │           │           │           │           │        │        │        │
   │ Complaint │           │           │           │           │        │        │        │
   ├──────────►│           │           │           │           │        │        │        │
   │           │ POST /api/│           │           │           │        │        │        │
   │           │ complaints│           │           │           │        │        │        │
   │           ├──────────►│           │           │           │        │        │        │
   │           │           │ Validate  │           │           │        │        │        │
   │           │           │ JWT Token │           │           │        │        │        │
   │           │           ├──────┐    │           │           │        │        │        │
   │           │           │      │    │           │           │        │        │        │
   │           │           │◄─────┘    │           │           │        │        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │ Upload    │           │           │        │        │        │
   │           │           │ Images    │           │           │        │        │        │
   │           │           ├───────────────────────────────────►        │        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │           │           │  Image URLs        │        │        │
   │           │           │◄──────────────────────────────────┤        │        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │ Classify  │           │           │        │        │        │
   │           │           │ Complaint │           │           │        │        │        │
   │           │           ├───────────────────────►           │        │        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │           │    Category, Dept,    │        │        │        │
   │           │           │           │    Summary, Sentiment │        │        │        │
   │           │           │◄──────────────────────┤           │        │        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │ Save      │           │           │        │        │        │
   │           │           │ Complaint │           │           │        │        │        │
   │           │           ├──────────►│           │           │        │        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │           │ Complaint │           │        │        │        │
   │           │           │           │  Saved    │           │        │        │        │
   │           │           │◄──────────┤           │           │        │        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │ Create    │           │           │        │        │        │
   │           │           │ Chat      │           │           │        │        │        │
   │           │           ├──────────►│           │           │        │        │        │
   │           │           │◄──────────┤           │           │        │        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │ Create    │           │           │        │        │        │
   │           │           │ Notification         │           │        │        │        │
   │           │           ├──────────►│           │           │        │        │        │
   │           │           │◄──────────┤           │           │        │        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │ Send Email│           │           │        │        │        │
   │           │           ├───────────────────────────────────────────►        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │ Socket.io │           │           │        │        │        │
   │           │           │ Emit      │           │           │        │        │        │
   │           │           ├────────────────────────────────────────────────────►        │
   │           │           │           │           │           │        │  Notification  │
   │           │           │           │           │           │        │   Received     │
   │           │           │           │           │           │        │        │        │
   │           │ Success   │           │           │           │        │        │        │
   │           │ Response  │           │           │           │        │        │        │
   │           │◄──────────┤           │           │           │        │        │        │
   │ Complaint │           │           │           │           │        │        │        │
   │  Created  │           │           │           │           │        │        │        │
   │◄──────────┤           │           │           │           │        │        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │           │           │           │        │  View  │        │
   │           │           │           │           │           │        │ Complaint      │
   │           │           │           │           │           │        ├───────►        │
   │           │           │◄──────────────────────────────────────────┤        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │           │           │           │        │ Assign │        │
   │           │           │           │           │           │        │ Worker │        │
   │           │           │ PUT /api/ │           │           │        ├───────►        │
   │           │           │ complaints│           │           │        │        │        │
   │           │           │ /:id/assign          │           │        │        │        │
   │           │           │◄──────────────────────────────────────────┤        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │ Update    │           │           │        │        │        │
   │           │           │ Complaint │           │           │        │        │        │
   │           │           ├──────────►│           │           │        │        │        │
   │           │           │◄──────────┤           │           │        │        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │ Notify    │           │           │        │        │        │
   │           │           │ Worker    │           │           │        │        │        │
   │           │           ├────────────────────────────────────────────────────────────►
   │           │           │           │           │           │        │        │  Task  │
   │           │           │           │           │           │        │        │ Assigned
   │           │           │           │           │           │        │        │        │
   │  Real-time│           │           │           │           │        │        │        │
   │  Status   │           │           │           │           │        │        │        │
   │  Update   │           │           │           │           │        │        │        │
   │◄──────────┤           │           │           │           │        │        │        │
   │  (Socket) │           │           │           │           │        │        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │           │           │           │        │        │ Upload │
   │           │           │           │           │           │        │        │ Resolution
   │           │           │           │           │           │        │        │ Proof  │
   │           │           │ PUT /api/ │           │           │        │        ├───────►
   │           │           │ complaints│           │           │        │        │        │
   │           │           │ /:id/resolve         │           │        │        │        │
   │           │           │◄─────────────────────────────────────────────────────────────
   │           │           │           │           │           │        │        │        │
   │           │           │ Upload    │           │           │        │        │        │
   │           │           │ Proof Imgs│           │           │        │        │        │
   │           │           ├───────────────────────────────────►        │        │        │
   │           │           │◄──────────────────────────────────┤        │        │        │
   │           │           │           │           │           │        │        │        │
   │           │           │ Update    │           │           │        │        │        │
   │           │           │ Status    │           │           │        │        │        │
   │           │           ├──────────►│           │           │        │        │        │
   │           │           │◄──────────┤           │           │        │        │        │
   │           │           │           │           │           │        │        │        │
   │  Email    │           │           │           │           │        │        │        │
   │ "Resolved"│           │           │           │           │        │        │        │
   │◄──────────────────────────────────────────────────────────┤        │        │        │
   │           │           │           │           │           │        │        │        │
   │  Socket   │           │           │           │           │        │        │        │
   │  Update   │           │           │           │           │        │        │        │
   │◄──────────┤           │           │           │           │        │        │        │
   │           │           │           │           │           │        │        │        │
   │ Rate      │           │           │           │           │        │        │        │
   │ Resolution│           │           │           │           │        │        │        │
   ├──────────►│           │           │           │           │        │        │        │
   │           │ POST /api/│           │           │           │        │        │        │
   │           │ feedback  │           │           │           │        │        │        │
   │           ├──────────►│           │           │           │        │        │        │
   │           │           ├──────────►│           │           │        │        │        │
   │           │           │◄──────────┤           │           │        │        │        │
   │  Feedback │           │           │           │           │        │        │        │
   │  Submitted│           │           │           │           │        │        │        │
   │◄──────────┤           │           │           │           │        │        │        │
   │           │           │           │           │           │        │        │        │
```

---

### 3.4.7 Data Model Diagram (ER Diagram)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    ENTITY-RELATIONSHIP DIAGRAM (ERD)                       │
│                          CivicMitra Database                               │
└────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────┐
│            USER                  │
├──────────────────────────────────┤
│ PK  _id: ObjectId                │
│     name: String                 │
│ UK  slug: String                 │
│ UK  email: String                │
│     phone: String                │
│     address: String              │
│     password: String (hashed)    │
│     role: Enum (citizen, staff,  │
│           admin, worker)         │
│ FK  department: ObjectId         │────────┐
│     workerId: String (UK)        │        │
│     specialization: String       │        │
│     experienceYears: Number      │        │
│     shiftPreference: String      │        │
│     vehicleNumber: String        │        │
│     licenseNumber: String        │        │
│     isActive: Boolean            │        │
│     createdAt: Date              │        │
└──────────────────────────────────┘        │
         │                                   │
         │ 1:N (citizenId)                   │
         │                                   │
         ▼                                   │
┌──────────────────────────────────┐        │
│          COMPLAINT               │        │
├──────────────────────────────────┤        │
│ PK  _id: ObjectId                │        │
│     title: String (max 100)      │        │
│     description: String (max 1K) │        │
│     category: Enum (Roads,       │        │
│               Water Supply, etc) │        │
│ FK  department: ObjectId         │────────┤
│ FK  chat: ObjectId               │        │
│     priority: Enum (Low, Med, Hi)│        │
│     location: String             │        │
│     attachments: [               │        │
│       {public_id, url}           │        │
│     ]                            │        │
│     status: Enum (Submitted,     │        │
│            In Progress, Resolved)│        │
│ FK  citizenId: ObjectId          │───┐    │
│ FK  departmentStaffId: ObjectId  │   │    │
│ FK  workerId: ObjectId           │   │    │
│     deadline: Date               │   │    │
│     timeline: [TimelineEvent]    │   │    │
│     aiClassification: {          │   │    │
│       confidence: Number,        │   │    │
│       reasoning: String,         │   │    │
│       aiClassified: Boolean      │   │    │
│     }                            │   │    │
│     aiSummary: {                 │   │    │
│       shortSummary: String,      │   │    │
│       keyPoints: [String],       │   │    │
│       sentiment: Enum            │   │    │
│     }                            │   │    │
│     resolutionProof: [           │   │    │
│       {public_id, url}           │   │    │
│     ]                            │   │    │
│     createdAt: Date              │   │    │
│     updatedAt: Date              │   │    │
└──────────────────────────────────┘   │    │
         │                             │    │
         │ 1:1                         │    │
         │                             │    │
         ▼                             │    │
┌──────────────────────────────────┐   │    │
│            CHAT                  │   │    │
├──────────────────────────────────┤   │    │
│ PK  _id: ObjectId                │   │    │
│ FK  complaintId: ObjectId        │───┘    │
│ FK  citizenId: ObjectId          │────────┘
│ FK  staffId: ObjectId            │
│     messages: [MessageSchema]    │
│       {                          │
│ FK      sender: ObjectId,        │
│         message: String,         │
│         timestamp: Date          │
│       }                          │
│     createdAt: Date              │
└──────────────────────────────────┘
         │
         │ N:1 (complaintId)
         │
         ▼
┌──────────────────────────────────┐
│          FEEDBACK                │
├──────────────────────────────────┤
│ PK  _id: ObjectId                │
│ FK  complaintId: ObjectId        │
│ FK  citizenId: ObjectId          │
│     rating: Number (1-5)         │
│     comments: String             │
│     createdAt: Date              │
└──────────────────────────────────┘


┌──────────────────────────────────┐
│         DEPARTMENT               │
├──────────────────────────────────┤
│ PK  _id: ObjectId                │
│ UK  name: String                 │◄───────┐
│ UK  slug: String                 │        │
│     description: String (max 500)│        │
│     createdAt: Date              │        │
└──────────────────────────────────┘        │
                                             │
                                             │ N:1
                                             │
┌──────────────────────────────────┐        │
│        NOTIFICATION              │        │
├──────────────────────────────────┤        │
│ PK  _id: ObjectId                │        │
│ FK  userId: ObjectId             │        │
│     title: String                │        │
│     message: String              │        │
│ FK  complaintId: ObjectId        │        │
│     read: Boolean                │        │
│     createdAt: Date              │        │
│ IDX (userId, createdAt)          │        │
└──────────────────────────────────┘        │
                                             │
                                             │
┌──────────────────────────────────┐        │
│        SYSTEMALERT               │        │
├──────────────────────────────────┤        │
│ PK  _id: ObjectId                │        │
│     type: String                 │        │
│     message: String              │        │
│ FK  department: ObjectId         │────────┘
│     severity: Enum (low, med,    │
│              high, critical)     │
│     resolved: Boolean            │
│     createdAt: Date              │
└──────────────────────────────────┘


RELATIONSHIPS:
═══════════════

1. USER (1) ──── (N) COMPLAINT
   • One user (citizen) can submit multiple complaints
   • Each complaint belongs to one citizen

2. USER (1) ──── (N) COMPLAINT (as staff)
   • One staff member can be assigned multiple complaints
   • Each complaint can have one assigned staff member

3. USER (1) ──── (N) COMPLAINT (as worker)
   • One worker can be assigned multiple complaints
   • Each complaint can have one assigned worker

4. DEPARTMENT (1) ──── (N) USER
   • One department has multiple staff/workers
   • Each staff/worker belongs to one department

5. DEPARTMENT (1) ──── (N) COMPLAINT
   • One department handles multiple complaints
   • Each complaint is assigned to one department

6. COMPLAINT (1) ──── (1) CHAT
   • Each complaint has one chat thread
   • Each chat thread is linked to one complaint

7. COMPLAINT (1) ──── (N) FEEDBACK
   • Each complaint can have multiple feedback entries (theoretically)
   • Typically 1:1 relationship in practice

8. USER (1) ──── (N) NOTIFICATION
   • One user receives multiple notifications
   • Each notification is for one user

9. COMPLAINT (1) ──── (N) NOTIFICATION
   • One complaint generates multiple notifications
   • Each notification can reference one complaint

10. DEPARTMENT (1) ──── (N) SYSTEMALERT
    • One department may have multiple system alerts
    • Each alert relates to one department


INDEXES:
════════
• User: email (unique), slug (unique), workerId (sparse unique)
• Department: name (unique), slug (unique)
• Complaint: citizenId, department, status, createdAt
• Notification: (userId, createdAt) compound index
• Chat: complaintId, citizenId
```

---

## 3.5 Risk Mitigation Monitoring and Management Plan

### 3.5.1 Risk Identification Matrix

| Risk ID | Risk Description | Category | Probability | Impact | Risk Level |
|---------|-----------------|----------|-------------|---------|------------|
| R1 | AI API rate limiting/downtime | Technical | Medium | High | **High** |
| R2 | Data breach/security vulnerability | Security | Low | Critical | **High** |
| R3 | Database performance degradation | Technical | Medium | High | **High** |
| R4 | Third-party service failures (Cloudinary, SMTP) | Technical | Medium | Medium | **Medium** |
| R5 | User adoption resistance | Business | Medium | High | **High** |
| R6 | Scalability issues during peak load | Technical | Medium | High | **High** |
| R7 | Inaccurate AI classification | Technical | High | Medium | **High** |
| R8 | Budget overruns | Financial | Low | Medium | **Low** |
| R9 | Staff training inadequacy | Operational | Medium | Medium | **Medium** |
| R10 | Legal/compliance issues (data privacy) | Legal | Low | Critical | **High** |
| R11 | Network connectivity issues | Infrastructure | Low | Medium | **Low** |
| R12 | Integration failures with external systems | Technical | Medium | High | **High** |

---

### 3.5.2 Risk Mitigation Strategies

#### R1: AI API Rate Limiting/Downtime
**Mitigation:**
- Implement fallback to manual categorization when AI fails
- Cache AI responses for similar complaints
- Use exponential backoff for API retries
- Implement queue system for AI processing
- Monitor API usage and set up alerts at 80% quota

**Contingency:**
- Manual complaint categorization workflow
- Pre-defined category rules engine as backup

---

#### R2: Data Breach/Security Vulnerability
**Mitigation:**
- Regular security audits (quarterly)
- Implement OWASP Top 10 security practices
- Use Helmet.js, CORS, rate limiting
- Encrypt sensitive data at rest
- Regular dependency updates (weekly automated scans)
- Implement role-based access control (RBAC)
- Enable HTTPS-only communication
- Regular penetration testing

**Contingency:**
- Incident response plan with clear escalation paths
- Data breach notification protocol
- Database rollback and recovery procedures

---

#### R3: Database Performance Degradation
**Mitigation:**
- Implement proper indexing (userId, complaintId, status, createdAt)
- Use MongoDB aggregation pipelines efficiently
- Implement pagination for large datasets
- Set up database monitoring (MongoDB Atlas/Prometheus)
- Regular query optimization reviews
- Archive old complaints (>2 years) to separate collection

**Contingency:**
- Database sharding strategy ready
- Read replicas for analytics queries
- Emergency database scaling plan

---

#### R4: Third-Party Service Failures
**Mitigation:**
- Implement circuit breaker patterns
- Use retry mechanisms with exponential backoff
- Monitor third-party service health
- Have backup SMTP providers configured
- Local image caching for Cloudinary

**Contingency:**
- Queue failed operations for retry
- Fallback to local storage temporarily
- Alternative email service provider (SendGrid → Amazon SES)

---

#### R5: User Adoption Resistance
**Mitigation:**
- Conduct user training sessions (staff, workers)
- Create video tutorials and documentation
- Implement intuitive UI/UX with user testing
- Gradual rollout with pilot departments
- Collect feedback and iterate quickly
- Provide 24/7 helpdesk support initially

**Contingency:**
- Extended training period
- On-site support staff for first month
- Parallel legacy system operation for transition period

---

#### R6: Scalability Issues During Peak Load
**Mitigation:**
- Load testing before deployment (1000+ concurrent users)
- Implement horizontal scaling with load balancers
- Use CDN for static assets
- Implement caching (Redis) for frequent queries
- Optimize database queries and indexes
- Use Socket.io clustering for WebSocket scalability

**Contingency:**
- Auto-scaling configured in cloud infrastructure
- Emergency rate limiting during DDoS
- Priority queue for critical operations

---

#### R7: Inaccurate AI Classification
**Mitigation:**
- Regular AI model evaluation and fine-tuning
- Implement confidence threshold (>70% for auto-classification)
- Allow manual override by staff
- Collect feedback on classification accuracy
- A/B testing for classification prompts
- Maintain audit log of AI decisions

**Contingency:**
- Manual review queue for low-confidence classifications
- Staff can reclassify complaints
- Periodic retraining with new data

---

#### R8: Budget Overruns
**Mitigation:**
- Detailed project budget with 20% contingency
- Weekly budget tracking and burn rate analysis
- Prioritize features using MoSCoW method
- Use open-source tools where possible
- Optimize cloud resource usage

**Contingency:**
- Descope non-critical features
- Extend timeline to distribute costs
- Seek additional funding if critical

---

#### R9: Staff Training Inadequacy
**Mitigation:**
- Comprehensive training program (3 days)
- Role-specific training materials
- Hands-on practice environment
- Post-training assessment
- Ongoing support and refresher sessions
- Create "super users" as internal champions

**Contingency:**
- Extended training period
- Additional on-site support
- Video library for self-paced learning

---

#### R10: Legal/Compliance Issues (Data Privacy)
**Mitigation:**
- Ensure GDPR/data protection compliance
- Implement data retention policies
- User consent mechanisms
- Right to deletion (RTBF) implementation
- Privacy policy and terms of service
- Regular legal review of data handling

**Contingency:**
- Legal counsel on retainer
- Data protection officer (DPO) assigned
- Compliance audit and remediation plan

---

#### R11: Network Connectivity Issues
**Mitigation:**
- Offline-first PWA capabilities (future enhancement)
- Clear error messages for network failures
- Automatic retry mechanisms
- Service status page

**Contingency:**
- Phone/SMS complaint submission fallback
- Manual data entry when system is down

---

#### R12: Integration Failures with External Systems
**Mitigation:**
- Comprehensive integration testing
- API versioning and backwards compatibility
- Contract testing with external services
- Monitoring and alerting for integration failures

**Contingency:**
- Manual processes for critical workflows
- Alternative service providers identified
- Graceful degradation of features

---

### 3.5.3 Risk Monitoring Plan

#### Monitoring Frequency:

| Risk Level | Review Frequency | Responsibility |
|------------|-----------------|----------------|
| Critical | Daily | Project Manager + Tech Lead |
| High | Weekly | Project Manager |
| Medium | Bi-weekly | Team Lead |
| Low | Monthly | Project Manager |

#### Key Performance Indicators (KPIs) for Risk Monitoring:

1. **System Uptime**: Target 99.5%
2. **API Response Time**: < 2 seconds (95th percentile)
3. **AI Classification Accuracy**: > 80%
4. **User Adoption Rate**: 70% of target users within 3 months
5. **Security Vulnerabilities**: 0 critical, < 3 high
6. **Database Query Performance**: < 500ms for 95% of queries
7. **Third-Party Service Uptime**: > 99%
8. **Budget Variance**: < 10%

---

### 3.5.4 Risk Management Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RISK MANAGEMENT WORKFLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

                           ┌──────────────────┐
                           │  Risk Identified │
                           └────────┬─────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │  Assess Risk     │
                           │  • Probability   │
                           │  • Impact        │
                           │  • Risk Level    │
                           └────────┬─────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
            ┌──────────────────┐          ┌──────────────────┐
            │  Low/Medium Risk │          │   High/Critical  │
            └────────┬─────────┘          │      Risk        │
                     │                    └────────┬─────────┘
                     │                             │
                     ▼                             ▼
            ┌──────────────────┐          ┌──────────────────┐
            │ Log in Risk      │          │  Immediate       │
            │ Register         │          │  Escalation to   │
            └────────┬─────────┘          │  Stakeholders    │
                     │                    └────────┬─────────┘
                     │                             │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │ Develop          │
                           │ Mitigation Plan  │
                           └────────┬─────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │ Implement        │
                           │ Mitigation       │
                           └────────┬─────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │ Monitor Risk     │
                           │ Status           │
                           └────────┬─────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
            ┌──────────────────┐          ┌──────────────────┐
            │  Risk Mitigated  │          │  Risk Persists   │
            └────────┬─────────┘          └────────┬─────────┘
                     │                             │
                     ▼                             │
            ┌──────────────────┐                   │
            │ Close Risk       │                   │
            │ in Register      │                   │
            └──────────────────┘                   │
                                                    │
                                    ┌───────────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │ Activate         │
                           │ Contingency Plan │
                           └──────────────────┘
```

---

### 3.5.5 Communication Plan for Risk Management

| Stakeholder | Communication Method | Frequency | Risk Level |
|------------|---------------------|-----------|------------|
| Project Sponsor | Status Report | Weekly | All |
| Municipal Management | Executive Summary | Bi-weekly | High/Critical |
| Development Team | Daily Standup | Daily | All |
| QA Team | Risk Log Review | Weekly | Medium/High |
| End Users | System Status Page | Real-time | Critical (downtime) |

---

## Conclusion

This design documentation provides a comprehensive blueprint for the CivicMitra complaint management system. The detailed diagrams and specifications ensure clear understanding of system architecture, data flows, user interactions, and risk management strategies. This document serves as the foundation for development, testing, deployment, and maintenance phases of the project.

---

**Document Version:** 1.0
**Last Updated:** 2025
**Prepared By:** CivicMitra Development Team
**Status:** Final
