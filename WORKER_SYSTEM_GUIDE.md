# CivicMitra - Worker System Quick Reference Guide

## 🎯 Quick Overview

The worker system enables field workers to manage their assignments and update progress on citizen complaints. Staff can assign workers to complaints and track their work.

---

## 👷 For Workers

### Getting Started

#### 1. Registration
**URL:** `/register/worker`

**Required Information:**
- Full Name
- Email Address
- Phone Number
- **Worker ID** (Unique identifier)
- **Department** (Select from dropdown)
- **Specialization** (Your area of expertise)
- Password

**Optional Information:**
- Years of Experience
- Shift Preference
- Vehicle Number
- License Number

#### 2. Login
**URL:** `/login`
- Use your registered email and password
- You'll be redirected to your Worker Dashboard

---

### Worker Dashboard Features

#### Main Dashboard (`/worker`)
**What You'll See:**
- **Performance KPIs:**
  - My Active Tasks
  - Resolved Today
  - Total Resolved

- **My Field Assignments:**
  - List of all complaints assigned to you
  - Quick info: Title, Location, Priority, Status
  - Citizen contact information

- **Quick Actions:**
  - Update Progress (opens form)
  - View Details (full complaint info)

#### All Assignments Page (`/worker/tasks`)
**Features:**
- Complete list of your assignments
- Filters: Status, Priority, Search
- Statistics dashboard
- Sortable by date, priority, location

---

### Updating Task Progress

#### Method 1: From Dashboard
1. Click **"Update Progress"** on any task card
2. Fill in the form:
   - **Status:** "In Progress" or "Resolved"
   - **Notes:** Describe work done
3. Click **"Save Update"**
4. ✅ Done! Timeline updated automatically

#### Method 2: From Task Details
1. Click **"Details"** on any task
2. Navigate to **"Update Progress"** tab
3. Fill in the form:
   - **Work Status:** In Progress / Resolved
   - **Work Details:** Field work description
4. Click **"Submit Progress Update"**
5. ✅ Automatically switches to "Work History" tab

**Important Notes:**
- ✅ All updates are visible to citizens
- ✅ Citizen receives notification immediately
- ✅ Updates appear in timeline with your name
- ✅ Timestamp recorded automatically

---

### Task Details Page (`/worker/tasks/:id`)

#### Tabs Available:

**1. Assignment Details**
- Issue description
- Field location (prominently displayed)
- Category and department
- Date assigned
- Citizen contact information (name, email, phone)
- Attachments/photos from citizen

**2. Update Progress**
- Status selection dropdown
- Notes text area
- Submission button
- Helpful tips and guidelines

**3. Work History**
- Complete timeline of all updates
- Color-coded status indicators
- Your updates highlighted
- Timestamps for all events

---

### Best Practices for Workers

#### Progress Updates
✅ **Do:**
- Be specific about work done
- Mention any issues encountered
- Include next steps if work is ongoing
- Update status accurately
- Provide estimated completion if "In Progress"

❌ **Don't:**
- Leave notes field empty
- Use vague descriptions
- Forget to update when work is complete
- Mark as "Resolved" if issues remain

#### Example Good Updates:
```
"Inspected drainage system. Found blockage at junction point.
Cleared debris and tested flow. Issue resolved. No further action needed."

"Started road repair work. Removed damaged asphalt section.
Prepared base layer. Will apply new asphalt tomorrow morning.
Expected completion: Next day by 2 PM."

"Water pipe replacement completed. Tested for leaks.
System working normally. Advised citizen to monitor for 24 hours."
```

---

## 👔 For Staff

### Worker Management

#### Accessing Worker Management
**URL:** `/:departmentSlug/staff/workers` (e.g., `/water/staff/workers`)

**Navigation:** Click **"Workers"** in sidebar

---

### Viewing Workers

**Worker List Shows:**
- Worker Name and ID
- Contact Information (email, phone)
- Specialization
- Years of Experience
- Active/Inactive Status

**Actions Available:**
- **Assign Task** - Quick assignment to worker
- **Refresh** - Update worker list

---

### Assigning Workers to Complaints

#### Method 1: From Worker Management Page

**Steps:**
1. Go to Workers page (`/:departmentSlug/staff/workers`)
2. Find the worker you want to assign
3. Click **"Assign Task"** button
4. **Assignment Dialog Opens:**
   - Shows worker details (name, specialization, experience)
   - Lists all unassigned complaints in your department
   - Each complaint shows: Title, Location, Priority, Status
5. Select a complaint from dropdown
6. Click **"Assign Task"**
7. ✅ Success! Both worker and citizen notified

**Benefits:**
- Choose worker first (based on specialization)
- See worker details before assignment
- Quick for assigning multiple tasks to same worker

---

#### Method 2: From Complaints Table

**Steps:**
1. Go to Complaints page (`/:departmentSlug/staff/complaints`)
2. Find complaint without assigned worker
3. Click **"Assign"** button in the table
4. **Assignment Page Opens:**
   - Shows complaint details
   - Lists available workers from your department
5. Select worker from dropdown
6. Click **"Confirm Assignment"**
7. ✅ Success! Redirected to complaints list

**Benefits:**
- Choose complaint first (urgent/priority-based)
- See complaint details before assignment
- Quick for processing complaints in queue

---

### Assignment Rules

**Complaints Eligible for Assignment:**
- ✅ Status: "Submitted" or "In Progress"
- ✅ No worker currently assigned
- ✅ Belongs to your department
- ✅ Not "Resolved" or "Closed"

**Workers Eligible for Assignment:**
- ✅ Active status
- ✅ Belongs to your department
- ✅ Registered as worker role

---

### Tracking Worker Progress

#### From Complaint Details:
1. Open any complaint
2. View **Timeline** section
3. See all worker updates with:
   - Worker name
   - Update timestamp
   - Status changes
   - Progress notes

#### Worker Performance:
- View in Dashboard (coming soon: analytics)
- Check individual worker task completion rates
- Monitor response times

---

## 🔄 Complete Workflow Example

### Scenario: Broken Water Pipe

#### Step 1: Citizen Files Complaint
- Title: "Broken Water Pipe on Main Street"
- Location: "123 Main Street, Near Post Office"
- Priority: High
- Department: Water Supply
- Status: **Submitted**

#### Step 2: Staff Assigns Worker
**Staff (Water Department):**
1. Logs in → Goes to Workers page
2. Finds "John Smith" (Specialization: Plumbing, 5 years exp)
3. Clicks **"Assign Task"**
4. Selects "Broken Water Pipe on Main Street"
5. Confirms assignment

**System Actions:**
- ✅ Status changes: Submitted → **In Progress**
- ✅ Worker receives notification: "New Task Assigned: Broken Water Pipe on Main Street"
- ✅ Citizen receives notification: "A worker is now assigned to your complaint"
- ✅ Timeline entry: "Assigned to Worker by [Staff Name]"

#### Step 3: Worker Receives & Reviews
**Worker (John Smith):**
1. Logs in → Sees new task in dashboard
2. Opens task details
3. Reviews:
   - Location: 123 Main Street
   - Citizen: Jane Doe (jane@email.com, 555-1234)
   - Issue description
   - Photos attached

#### Step 4: Worker Performs Field Work
**Day 1:**
1. John arrives at location
2. Inspects the pipe
3. Opens app → Updates progress:
   - Status: "In Progress"
   - Notes: "Inspected site. Major leak found at main junction. Ordered replacement parts. Expected arrival tomorrow."

**System Actions:**
- ✅ Timeline entry created
- ✅ Citizen notified: "Progress Update posted"
- ✅ Staff can view update

**Day 2:**
1. John completes repair
2. Tests water flow
3. Updates progress:
   - Status: "Resolved"
   - Notes: "Pipe replaced and sealed. System tested. No leaks detected. Work completed successfully."

**System Actions:**
- ✅ Status changes: In Progress → **Resolved**
- ✅ Timeline entry: "Resolved by John Smith"
- ✅ Citizen notified: "Your complaint has been resolved"

#### Step 5: Citizen Verification
**Citizen (Jane Doe):**
1. Receives notification
2. Checks complaint timeline
3. Sees all updates:
   - Assignment notification
   - Day 1 inspection update
   - Day 2 resolution update
4. Can provide feedback or confirm resolution

---

## 🎨 Interface Navigation

### Worker Navigation Menu
```
📊 Dashboard         → /worker
📋 All Assignments   → /worker/tasks
👤 Profile          → /worker/profile
📈 My Reports       → /worker/reports
```

### Staff Navigation Menu
```
📊 Dashboard         → /:dept/staff
📝 Complaints        → /:dept/staff/complaints
👷 Workers          → /:dept/staff/workers
💬 Chat             → /:dept/staff/chat
```

---

## 🔔 Notification System

### Workers Receive Notifications For:
1. ✅ New task assigned
2. ✅ Complaint updated by citizen
3. ✅ Staff comments/messages

### Citizens Receive Notifications For:
1. ✅ Worker assigned to complaint
2. ✅ Worker progress updates
3. ✅ Status changes
4. ✅ Staff messages

### Staff Receive Notifications For:
1. ✅ New complaints in department
2. ✅ Worker updates on complaints
3. ✅ Citizen messages

---

## 🛠️ Troubleshooting

### Issue: Worker Can't See Assigned Tasks

**Possible Causes:**
1. Not logged in with worker account
2. Not assigned to any department
3. No complaints assigned yet

**Solutions:**
1. Verify login with worker credentials
2. Contact admin to assign department
3. Wait for staff to assign tasks

---

### Issue: Staff Can't Assign Worker

**Possible Causes:**
1. Worker not in same department
2. Worker inactive
3. Complaint already assigned

**Solutions:**
1. Select worker from your department only
2. Check worker status (must be active)
3. Verify complaint has no existing worker

---

### Issue: Update Not Saving

**Possible Causes:**
1. Notes field empty
2. Network connection issue
3. Session expired

**Solutions:**
1. Always fill in progress notes
2. Check internet connection
3. Refresh page and login again

---

## 📊 Data Privacy & Security

### Worker Access:
- ✅ Can view: Own assigned complaints only
- ✅ Can update: Own assigned complaints only
- ❌ Cannot view: Other workers' assignments
- ❌ Cannot view: All complaints in department

### Staff Access:
- ✅ Can view: All complaints in their department
- ✅ Can view: All workers in their department
- ✅ Can assign: Workers from their department only
- ❌ Cannot view: Other departments' data

---

## 📱 Mobile Responsiveness

### Optimized For:
- ✅ Desktop (primary interface)
- ✅ Tablet (full functionality)
- ✅ Mobile (responsive layout)

**Mobile-Friendly Features:**
- Touch-optimized buttons
- Responsive tables
- Simplified navigation
- Quick actions accessible

---

## 🎓 Training Checklist

### For New Workers:
- [ ] Complete registration with all required fields
- [ ] Login and explore dashboard
- [ ] Review assigned tasks section
- [ ] Practice viewing task details
- [ ] Understand update progress form
- [ ] Submit test progress update
- [ ] Review timeline/work history

### For Staff:
- [ ] Access worker management page
- [ ] Review worker list and details
- [ ] Practice assigning from worker management
- [ ] Practice assigning from complaints table
- [ ] Track worker progress updates
- [ ] Understand notification system

---

## 📞 Support Contacts

### Technical Issues:
- Email: support@civicmitra.com
- Documentation: /docs

### System Feedback:
- GitHub Issues: [Repository URL]
- Feature Requests: [Feature Request Form]

---

## 🚀 Quick Tips

### For Maximum Efficiency:

**Workers:**
1. Check dashboard daily for new assignments
2. Update progress immediately after field work
3. Be detailed in your notes
4. Mark as "Resolved" only when complete
5. Keep citizen contact info handy

**Staff:**
1. Assign based on worker specialization
2. Monitor high-priority complaints first
3. Review worker performance regularly
4. Use both assignment methods as needed
5. Communicate with workers via chat

---

## 📈 Performance Metrics

### Worker Performance Indicators:
- Active tasks count
- Tasks resolved today
- Total resolved tasks
- Average resolution time (coming soon)
- Citizen satisfaction rating (coming soon)

### Staff Dashboard Metrics:
- Total workers in department
- Active workers count
- Unassigned complaints
- Average assignment time (coming soon)

---

*Last Updated: October 7, 2025*
*Version: 1.1.0*

For detailed technical documentation, see [CHANGELOG.md](./CHANGELOG.md)
