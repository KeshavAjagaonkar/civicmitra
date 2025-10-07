# CivicMitra - Complete System Workflow

## System Overview

CivicMitra is a municipal complaint management system with 4 user roles: **Citizen**, **Worker**, **Staff**, and **Admin**.

---

## User Roles & Access

### 1. **Citizen** (Can Register Publicly)
- **Registration**: `/auth` → Select "Citizen" → Fill details
- **Dashboard**: `/dashboard`
- **Capabilities**:
  - File complaints
  - Track complaint status
  - View timeline (read-only)
  - Chat with staff
  - Give feedback when resolved

### 2. **Worker** (Can Register Publicly)
- **Registration**: `/auth` → Select "Field Worker" → Choose Department → Fill details
- **Dashboard**: `/worker`
- **Capabilities**:
  - View complaints assigned to them ONLY
  - Update timeline with progress photos
  - Mark complaints as resolved

### 3. **Staff** (Created by Admin ONLY - 1 per Department)
- **Login**: `staff.water@civicmitra.com` / `staff123` (example)
- **Dashboard**: `/water-supply/staff` (department-based URL)
- **Capabilities**:
  - View complaints from their department ONLY
  - Assign workers to complaints
  - Respond to citizen chats
  - Monitor progress timeline
  - Update complaint status

### 4. **Admin** (1 Seeded Account)
- **Login**: `admin@civicmitra.com` / `admin123`
- **Dashboard**: `/admin`
- **Capabilities**:
  - View ALL complaints globally
  - Create/Edit/Delete Staff and Worker accounts
  - Manage departments
  - View analytics & export reports
  - Reassign complaints

---

## Complete Workflow Example

### Step 1: Citizen Files Complaint

**Actor**: Citizen (Rahul Sharma)

1. Citizen logs in → Dashboard
2. Clicks "File New Complaint"
3. Fills form:
   - Title: "Water pipe leakage near A-Block"
   - Description: "Leaking pipe since 2 days"
   - Category: "Water"
   - Location: Address + coordinates
   - Attachments: Photos of leakage
4. Submits complaint

**Backend Processing**:
```javascript
// Auto-classification by AI
classification = AI.classify(title, description)
// Creates complaint
complaint = {
  title, description, category,
  department: classification.department || userSelected,
  priority: classification.priority || 'Medium',
  status: 'Submitted', // Initial status
  citizenId: req.user.id,
  timeline: [{ action: 'Complaint Submitted', status: 'Submitted' }]
}

// Auto-assign to department staff
staff = find_staff_by_department(complaint.department)
complaint.staffId = staff._id
notify(staff, 'New Complaint Assigned')

// Create chat
chat = create_chat(complaint._id, citizen._id)
chat.messages.push({ sender: bot, message: 'Welcome!' })
```

**Result**:
- Complaint created with status = "Submitted"
- Assigned to Water Supply Department
- Staff (Ramesh Kumar) gets notification
- Chat created with bot welcome message
- Citizen can track complaint

---

### Step 2: Staff Views & Assigns Worker

**Actor**: Staff (Ramesh Kumar - Water Supply Dept)

1. Staff logs in → Redirected to `/water-supply/staff`
2. Dashboard shows:
   - **ONLY Water Supply department complaints**
   - Sorted by priority (High→Red, Medium→Amber, Low→Green)
   - Complaint: "Water pipe leakage near A-Block" (Priority: High, Status: Submitted)
3. Staff clicks on complaint → Views details
4. Clicks "Assign Worker" → Selects worker from dropdown
5. Assigns to Worker: "Mohan Yadav" (registered worker in Water Supply)

**Backend Processing**:
```javascript
// Assign worker
complaint.workerId = workerId
if (complaint.status === 'Submitted') {
  complaint.status = 'In Progress' // Status changes
}
complaint.timeline.push({
  action: 'Assigned to Worker',
  status: 'In Progress',
  notes: 'Assigned to field worker'
})

// Notifications
notify(worker, 'New Task Assigned')
notify(citizen, 'Worker Assigned to your complaint')
```

**Result**:
- Status changes: "Submitted" → "In Progress"
- Worker gets notification
- Citizen gets notification
- Timeline updated

---

### Step 3: Worker Updates Progress

**Actor**: Worker (Mohan Yadav)

1. Worker logs in → Dashboard
2. Sees **ONLY complaints assigned to him**
3. Views complaint: "Water pipe leakage near A-Block"
4. Clicks "Add Update" → Timeline Update Form:
   - Action: "Inspection Done"
   - Remarks: "Found damaged pipe section, replacement needed"
   - Attaches: Before photos
   - Date: Auto-filled
5. Submits update

**Later Updates**:
- "Work Started" + photo
- "Pipe Replaced" + photo
- "Testing Completed" + after photo
- Final: "Work Completed" → Status = "Resolved"

**Backend Processing**:
```javascript
// Worker update
if (complaint.workerId !== req.user.id) {
  return error('Not authorized')
}

complaint.timeline.push({
  action: req.body.action,
  status: req.body.status || complaint.status,
  notes: req.body.notes,
  media: req.body.media,
  updatedBy: req.user.id
})

if (req.body.status === 'Resolved') {
  complaint.status = 'Resolved'
}

// Notify citizen & staff
notify(citizen, 'Progress Update on your complaint')
notify(staff, 'Worker updated timeline')
```

**Result**:
- Timeline updated with progress photos
- Citizen sees updates (read-only)
- Staff monitors progress
- Status = "Resolved" after final update

---

### Step 4: Citizen Chats with Staff

**Actor**: Citizen

1. Citizen opens complaint details
2. Clicks "Chat" button
3. Bot responds with FAQ:
   - "Your complaint is assigned to Water Supply Department"
   - "Expected resolution: 2-3 days"
4. Citizen asks: "Can this be done faster?"
5. Bot: "Would you like to speak with a staff member?"
6. Citizen: "Yes"
7. **Chat escalated to Staff**

**Actor**: Staff (Ramesh Kumar)

1. Staff sees escalated chat notification
2. Opens chat panel in dashboard
3. Responds: "We're working on it. Worker has started replacement today."
4. Messages saved in chat history

**Backend Processing**:
```javascript
// Chat message
chatMessage = {
  complaintId: complaint._id,
  senderId: req.user.id,
  senderRole: req.user.role, // 'citizen' or 'staff'
  message: message,
  escalatedToStaffId: staff._id // if escalated
}

// Notify other party
notify(staff_or_citizen, 'New message in chat')
```

---

### Step 5: Citizen Gives Feedback

**Actor**: Citizen

1. Complaint status = "Resolved"
2. Citizen gets notification: "Please provide feedback"
3. Opens complaint → "Give Feedback" button appears
4. Fills feedback form:
   - Rating: 5 stars
   - Comment: "Excellent work, very quick response"
5. Submits feedback

**Backend Processing**:
```javascript
feedback = {
  complaintId: complaint._id,
  citizenId: req.user.id,
  rating: 5,
  comment: 'Excellent work...',
  createdAt: Date.now()
}

complaint.status = 'Closed' // Optional: mark as closed
```

**Result**:
- Feedback visible to Staff and Admin
- Used for quality metrics
- Worker performance tracked

---

### Step 6: Admin Oversight

**Actor**: Admin

1. Admin logs in → `/admin`
2. **Dashboard shows**:
   - Total complaints: 156
   - Resolved: 128 (82% resolution rate)
   - Pending: 28
   - Average resolution time: 2.5 days
3. **Department Performance**:
   - Water Supply: 45 complaints, 38 resolved
   - Sanitation: 32 complaints, 28 resolved
   - Road Maintenance: 29 complaints, 22 resolved
4. **Worker Performance**:
   - Mohan Yadav: 15 completed, 4.8 rating
   - Suresh Gupta: 12 completed, 4.5 rating
5. Admin can:
   - Create new Staff account for new department
   - Reassign complaints
   - Export reports (CSV/PDF)
   - View audit logs

---

## Data Flow Summary

```
┌─────────────┐
│   Citizen   │  Files Complaint
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Complaint Created  │  Status: Submitted
│  Auto-assigned to   │  Department: Water Supply
│  Department         │  Staff: Ramesh Kumar
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│    Staff    │  Views Complaint
└──────┬──────┘  Assigns Worker
       │
       ▼
┌─────────────────────┐
│  Worker Assigned    │  Status: In Progress
│  Worker: Mohan      │  Notification sent
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│   Worker    │  Updates Timeline
└──────┬──────┘  Progress photos
       │
       ▼
┌─────────────────────┐
│  Timeline Updates   │  Citizen sees (read-only)
│  Visible to all     │  Staff monitors
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Work Completed     │  Status: Resolved
│  Worker marks done  │  Citizen notified
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│   Citizen   │  Gives Feedback
└──────┬──────┘  Rating + Comments
       │
       ▼
┌─────────────────────┐
│  Complaint Closed   │  Feedback stored
│  Analytics updated  │  Worker rated
└─────────────────────┘
```

---

## Role-Based Complaint Visibility

### Citizen
- **Sees**: Only their own complaints
- **Query**: `{ citizenId: req.user.id }`

### Worker
- **Sees**: Only complaints assigned to them
- **Query**: `{ workerId: req.user.id }`

### Staff
- **Sees**: Only complaints in their department
- **Query**: `{ department: req.user.department._id }`

### Admin
- **Sees**: ALL complaints globally
- **Query**: `{}` (empty = all)

---

## Status Transitions

```
Submitted (Citizen files)
    ↓
In Progress (Staff assigns worker)
    ↓
Resolved (Worker completes work)
    ↓
Closed (After citizen feedback - optional)
```

---

## Priority Color Coding

- **High**: 🔴 Red (Urgent issues like water supply failure)
- **Medium**: 🟡 Amber (Important but not urgent)
- **Low**: 🟢 Green (Minor issues)

**Sorted by Priority**: High complaints appear first on Staff dashboard

---

## Chat Escalation Flow

```
Citizen opens chat
    ↓
Bot responds with FAQ
    ↓
Citizen: "I need help"
    ↓
Bot: "Would you like to speak with staff?"
    ↓
Citizen: "Yes"
    ↓
Chat escalated → Staff notified
    ↓
Staff responds in real-time
    ↓
Messages saved in database
```

---

## Timeline Read-Only vs Editable

### Citizen (Read-Only)
- ✅ Can VIEW timeline
- ❌ Cannot EDIT timeline
- ✅ Sees all updates from Worker

### Worker (Editable)
- ✅ Can ADD timeline entries
- ✅ Can upload progress photos
- ❌ Cannot edit past entries

### Staff (Monitor)
- ✅ Can VIEW timeline
- ❌ Cannot directly edit timeline
- ✅ Can see all worker updates

### Admin (Full Access)
- ✅ Can VIEW all timelines
- ✅ Can potentially edit (system-level)

---

## Summary

The system is **fully implemented** according to systembehaviour.md specifications:

✅ Citizen workflow: Register → File complaint → Track → Chat → Feedback
✅ Staff workflow: Login → View dept complaints → Assign worker → Monitor
✅ Worker workflow: Login → View assigned → Update timeline → Resolve
✅ Admin workflow: Manage all → Analytics → Export reports

All role-based access controls are correctly implemented in the backend.
