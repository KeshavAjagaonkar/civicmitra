🌐 Entities in CivicMitra

Citizen (User) → files and tracks complaints.

Staff (Department Staff) → manages complaints of one assigned department.

Worker → field staff assigned to resolve complaints.

Admin → system owner, manages users, departments, and analytics.

Complaint → the main object (created by citizen, handled by staff, worked on by workers).

Chat → communication between citizen and staff.

Timeline/Track → step-by-step updates on complaint resolution.


🏗️ Interaction Workflow
1. Citizen Side

Registers / Logs in → (role = Citizen).

Files Complaint:

Inputs: {title, description, category, location, priority, attachments}.

Complaint auto-assigned to the relevant Department (via category → department mapping).

Status set to Submitted.

Tracks Complaint:

Views list (MyComplaints).

Opens details → sees timeline + status.

Chat Support:



If unresolved → escalates to Staff of that department.

Messages saved as {sender, message, timestamp} linked to complaint.

Feedback:

Once resolved → fills feedback (rating + comments).

2. Staff Side (Department Staff)

Logs in → redirected to Department Dashboard.

Views Complaints of their department only.

Complaints are sorted by priority (High first → red, then amber, then green).

Actions Staff Can Take:

Assign complaint → Worker (available from their department pool).

Respond to Citizen chat (escalated conversations).

Monitor progress timeline.

Complaint status updates: In Progress once assigned.

3. Worker Side

Logs in → redirected to Worker Dashboard.

Sees only complaints assigned to them.

Updates Progress (Timeline):

Adds step with: {action, remarks, media, date}.

E.g., “Inspection Done”, “Work Started”, “Completed”.

Status transitions (updated automatically):

After final update → set to Resolved.

4. Admin Side

Logs in 

Manages Entities:

Users → Add/Edit/Delete staff & workers (assign departments).

Departments → Manage available departments (Water, Roads, etc.).

Complaints → Can view all complaints globally.

Analytics Dashboard:

Total complaints, status breakdown, department performance.

Avg resolution time.

Worker performance (resolved count).

Export Reports → CSV/PDF with complaint analytics.



🔄 End-to-End Workflow Example

Citizen files complaint:

Citizen → FileComplaint form.

Complaint created with status Submitted, mapped to department.

Staff of that department sees it in their dashboard.

Staff assigns worker:
4. Staff reviews → assigns complaint to Worker.
5. Complaint status becomes In Progress.
6. Worker gets notification on Worker Dashboard.

Worker updates progress:
7. Worker performs actions → updates timeline.
8. Citizen can see progress in ComplaintDetails (read-only).

Citizen chats:
9. Citizen opens chat → if bot can’t resolve, escalated to staff.
10. Staff responds via StaffDashboard chat panel.

Complaint resolved:
11. Worker finalizes → adds “Resolved” step in timeline.
12. Complaint status auto-set to Resolved.
13. Citizen gets notification + asked for feedback.

Feedback loop:
14. Citizen submits feedback.
15. Feedback visible to staff/admin (for quality).

Admin oversight:
16. Admin can view metrics → export monthly reports.

📊 Data Flow Between Entities

User (Citizen)
↔ creates Complaint
↔ reads Timeline (read-only)
↔ chats with Staff

Staff
↔ manages Complaints (assigns Workers, updates status)
↔ chats with Citizen
↔ oversees Timeline (not editing, just monitoring)

Worker
↔ updates Timeline
↔ indirectly communicates with Citizen (via progress updates, not chat)

Admin
↔ manages Users (Staff + Workers)
↔ manages Departments
↔ sees all Complaints
↔ generates Reports & Analytics

🔐 Role-Based Access Summary

Citizen → File complaint, track status, chat, feedback.

Staff → Department complaints only, assign workers, chat, monitor.

Worker → Assigned complaints only, update timeline.

Admin → Full system access (users, depts, analytics).