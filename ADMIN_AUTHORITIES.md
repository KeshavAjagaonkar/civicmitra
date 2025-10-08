# Admin Authorities & Capabilities

## Complete Admin Control Panel Documentation

**System:** CivicMitra Complaint Management
**Updated:** 2025-10-08
**Admin Role:** Full Database & System Authority

---

## 1. USER MANAGEMENT AUTHORITY

### ✅ Create Users
**Endpoint:** `POST /api/admin/users`
**Frontend:** Admin > User Management > Add New User

**Capabilities:**
- Create users with any role (Admin, Staff, Worker, Citizen)
- Assign department to Staff and Workers
- Set initial credentials (email, password)
- Provide contact details (phone, address)

**Example Request:**
```json
{
  "name": "John Doe",
  "email": "john@department.com",
  "password": "securePassword123",
  "role": "staff",
  "department": "departmentId",
  "phone": "1234567890",
  "address": "City Office Building"
}
```

---

### ✅ View All Users
**Endpoint:** `GET /api/admin/users`
**Frontend:** Admin > User Management

**Capabilities:**
- View complete user database
- Filter by role (admin, staff, worker, citizen)
- Filter by department
- See user status (active/inactive)
- View user details (email, phone, address, join date)

**Query Parameters:**
```
?role=staff
?department=departmentId
?role=worker&department=departmentId
```

---

### ✅ Update User Information
**Endpoint:** `PUT /api/admin/users/:id`
**Frontend:** Admin > User Management > Edit User

**Capabilities:**
- Update name, email, phone, address
- Change user role
- Reassign department
- Activate/deactivate user account

**Example Request:**
```json
{
  "name": "John Doe Updated",
  "email": "newemail@department.com",
  "role": "worker",
  "department": "newDepartmentId",
  "isActive": true
}
```

---

### ✅ Change User Roles
**Endpoint:** `PUT /api/admin/users/:id/role`
**Frontend:** Admin > User Management > Dropdown Menu

**Capabilities:**
- Promote Citizen to Worker
- Promote Worker to Staff
- Promote Staff to Admin
- Demote users between roles

**Example Request:**
```json
{
  "role": "admin"
}
```

---

### ✅ Delete Users (Single)
**Endpoint:** `DELETE /api/admin/users/:id`
**Frontend:** Admin > User Management > Delete User

**Capabilities:**
- Delete individual users from the database
- Permanent deletion (cannot be undone)
- Protection: Cannot delete own account

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### ✅ Bulk Delete Users
**Endpoint:** `POST /api/admin/users/bulk-delete`
**Frontend:** Admin > User Management > Select Multiple > Bulk Delete

**Capabilities:**
- Delete multiple users at once
- Select users via checkboxes
- Efficient mass removal
- Protection: Cannot delete own account

**Example Request:**
```json
{
  "userIds": ["userId1", "userId2", "userId3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 user(s) deleted successfully",
  "data": { "deletedCount": 3 }
}
```

---

## 2. COMPLAINT MANAGEMENT AUTHORITY

### ✅ View All Complaints
**Endpoint:** `GET /api/complaints/all`
**Frontend:** Admin > Complaint Management

**Capabilities:**
- Access entire complaint database
- See complaints from all departments
- View all statuses and priorities
- Filter and search across all data

---

### ✅ Update Complaints (Full Override)
**Endpoint:** `PUT /api/admin/complaints/:id`
**Frontend:** Admin > Complaint Management > Edit Complaint

**Capabilities:**
- Change complaint title and description
- Modify category and priority
- Update status (Submitted, In Progress, Resolved, Closed)
- Reassign to different department
- Reassign to different worker
- Override any citizen-submitted data

**Example Request:**
```json
{
  "title": "Updated complaint title",
  "description": "Updated description",
  "category": "Water Supply",
  "priority": "High",
  "status": "In Progress",
  "department": "newDepartmentId",
  "workerId": "newWorkerId"
}
```

---

### ✅ Update Complaint Status
**Endpoint:** `PATCH /api/complaints/:id/status`
**Frontend:** Admin > Complaint Management > Status Dropdown

**Capabilities:**
- Quick status updates
- Mark as Resolved/Closed
- Reopen closed complaints
- Override worker status updates

---

### ✅ Delete Complaints (Single)
**Endpoint:** `DELETE /api/admin/complaints/:id`
**Frontend:** Admin > Complaint Management > Delete

**Capabilities:**
- Permanently delete complaints
- Remove spam or duplicate entries
- Clean up database
- Cannot be undone

**Response:**
```json
{
  "success": true,
  "message": "Complaint deleted successfully"
}
```

---

### ✅ Bulk Delete Complaints
**Endpoint:** `POST /api/admin/complaints/bulk-delete`
**Frontend:** Admin > Complaint Management > Select Multiple > Bulk Delete

**Capabilities:**
- Delete multiple complaints at once
- Mass cleanup operations
- Remove old/resolved complaints
- Efficient database maintenance

**Example Request:**
```json
{
  "complaintIds": ["id1", "id2", "id3", "id4", "id5"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "5 complaint(s) deleted successfully",
  "data": { "deletedCount": 5 }
}
```

---

## 3. DEPARTMENT MANAGEMENT AUTHORITY

### ✅ Create Departments
**Endpoint:** `POST /api/departments`
**Frontend:** Admin > Department Management > Add Department

**Capabilities:**
- Create new departments
- Set department name and description
- Organize workflow structure

---

### ✅ Update Departments
**Endpoint:** `PUT /api/departments/:id`
**Frontend:** Admin > Department Management > Edit

**Capabilities:**
- Modify department details
- Update descriptions
- Restructure organization

---

### ✅ Delete Departments
**Endpoint:** `DELETE /api/departments/:id`
**Frontend:** Admin > Department Management > Delete

**Capabilities:**
- Remove departments
- Clean up unused departments
- Reorganize structure

---

## 4. SYSTEM MONITORING AUTHORITY

### ✅ Advanced Analytics
**Endpoint:** `GET /api/admin/analytics`
**Frontend:** Admin > System Analytics

**Capabilities:**
- View system-wide statistics
- Monitor complaint trends
- Track worker performance
- Analyze department efficiency
- View category distribution
- Monitor resolution times

---

### ✅ Dashboard Statistics
**Endpoint:** `GET /api/admin/dashboard/stats?period=`
**Frontend:** Admin > Dashboard

**Capabilities:**
- Filter by time period (This Month, Last Month, This Year)
- Total complaints count
- Resolution rates
- Active user counts
- Department performance
- Average resolution times

---

### ✅ Department Performance Stats
**Endpoint:** `GET /api/admin/dashboard/department-stats`
**Frontend:** Admin > Dashboard, Reports

**Capabilities:**
- View all department metrics
- Compare efficiency rates
- Monitor workload distribution
- Track resolved vs pending ratios

---

### ✅ System Alerts Management
**Endpoint:** `GET /api/admin/dashboard/alerts`
**Frontend:** Admin > Dashboard

**Capabilities:**
- View critical system alerts
- Monitor high-priority issues
- Track unassigned complaints
- See overdue deadlines

---

### ✅ Create System Alerts
**Endpoint:** `POST /api/admin/alerts`
**Frontend:** Admin Dashboard (programmatic)

**Capabilities:**
- Create custom alerts
- Notify specific roles
- Set expiration times
- System-wide announcements

---

## 5. REPORTING AUTHORITY

### ✅ Comprehensive Reports
**Frontend:** Admin > Reports

**Export Capabilities:**

1. **Comprehensive PDF Report (3 pages)**
   - System overview with KPIs
   - Department performance analysis
   - User statistics by role
   - Complaints by status
   - Color-coded efficiency metrics

2. **Complaints Report (Excel)**
   - All complaint details
   - Status, priority, assignments
   - Timestamps and tracking
   - Filterable data

3. **Department Performance (PDF)**
   - Efficiency ratings
   - Workload distribution
   - Resolution statistics
   - Color-coded metrics

4. **User Activity (Excel)**
   - Complete user list
   - Role distribution
   - Department assignments
   - Join dates and status

**Period Filtering:**
- This Month
- Last Month
- This Year

---

## 6. ASSIGNMENT AUTHORITY

### ✅ Assign Complaints
**Endpoint:** `PATCH /api/complaints/:id/assign-worker`
**Frontend:** Admin > Complaint Details > Assign

**Capabilities:**
- Assign complaints to any worker
- Reassign active complaints
- Override existing assignments
- Cross-department assignments

---

### ✅ Update Assignments
**Endpoint:** `PATCH /api/complaints/:id/update-assignment`
**Frontend:** Admin > Complaint Management

**Capabilities:**
- Modify worker assignments
- Change priority levels
- Update deadlines
- Add notes and instructions

---

## 7. DATABASE AUTHORITY SUMMARY

### Full CRUD Operations

| Entity | Create | Read | Update | Delete | Bulk Delete |
|--------|--------|------|--------|--------|-------------|
| Users | ✅ | ✅ | ✅ | ✅ | ✅ |
| Complaints | ❌* | ✅ | ✅ | ✅ | ✅ |
| Departments | ✅ | ✅ | ✅ | ✅ | ❌ |
| Alerts | ✅ | ✅ | ❌ | ❌ | ❌ |

*Citizens create complaints, admin can update/delete

---

## 8. SECURITY CONTROLS

### ✅ Self-Protection
- **Cannot delete own account** (prevents lockout)
- **Cannot bulk delete own account** (safety check)

### ✅ Role Verification
- All endpoints protected with JWT
- `authorize('admin')` middleware on sensitive routes
- Admin-only access enforced

### ✅ Audit Trail
- All operations logged
- Timestamps on modifications
- User tracking on changes

---

## 9. FRONTEND INTEGRATION

### Admin UI Features

**User Management:**
```jsx
// Available functions from useUserManagement hook
const {
  users,
  loading,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  bulkDeleteUsers,
  refetch
} = useUserManagement();
```

**Complaint Management:**
```jsx
// Available functions from useComplaintManagement hook
const {
  complaints,
  loading,
  updateComplaint,
  updateComplaintStatus,
  deleteComplaint,
  bulkDeleteComplaints,
  refetch,
  stats
} = useComplaintManagement();
```

---

## 10. USAGE EXAMPLES

### Example 1: Create Staff Member with Department
```javascript
// Frontend
const result = await createUser({
  name: "Jane Smith",
  email: "jane@water.dept.com",
  password: "SecurePass123!",
  role: "staff",
  department: "6523abc123def456",
  phone: "9876543210",
  address: "Water Department HQ"
});

if (result.success) {
  toast({ title: 'Staff member created successfully' });
}
```

### Example 2: Bulk Delete Old Complaints
```javascript
// Frontend
const oldComplaintIds = [
  "complaint1",
  "complaint2",
  "complaint3"
];

const result = await bulkDeleteComplaints(oldComplaintIds);

if (result.success) {
  toast({
    title: `${result.deletedCount} complaints deleted`,
    description: 'Database cleaned successfully'
  });
}
```

### Example 3: Update User Role and Department
```javascript
// Promote worker to staff and change department
const result = await updateUser(userId, {
  role: "staff",
  department: newDepartmentId
});

if (result.success) {
  toast({ title: 'User promoted to Staff' });
}
```

---

## 11. API ENDPOINT REFERENCE

### Complete Admin API List

```
GET    /api/admin/analytics
GET    /api/admin/users
POST   /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id
PUT    /api/admin/users/:id/role
DELETE /api/admin/users/:id
POST   /api/admin/users/bulk-delete

GET    /api/admin/dashboard/stats
GET    /api/admin/dashboard/recent-complaints
GET    /api/admin/dashboard/department-stats
GET    /api/admin/dashboard/alerts
POST   /api/admin/alerts

DELETE /api/admin/complaints/:id
PUT    /api/admin/complaints/:id
POST   /api/admin/complaints/bulk-delete
```

---

## 12. BEST PRACTICES

### When to Use Admin Authorities

✅ **DO:**
- Clean up duplicate or spam complaints
- Remove inactive user accounts
- Reorganize departments
- Fix data entry errors
- Generate compliance reports
- Monitor system health

❌ **DON'T:**
- Delete complaints without proper review
- Remove users without notification
- Override worker assignments arbitrarily
- Delete your own admin account

---

## CONCLUSION

**Admin has COMPLETE authority over:**
- ✅ All users (create, read, update, delete, bulk operations)
- ✅ All complaints (read, update, delete, bulk operations)
- ✅ All departments (create, read, update, delete)
- ✅ System monitoring and analytics
- ✅ Report generation and exports
- ✅ Assignment and workflow management

**System Status:** **FULLY AUTHORIZED** 🛡️

The admin role has unrestricted access to all database operations with appropriate safety controls to prevent self-lockout and maintain system integrity.

---

**Document Version:** 1.0
**Last Updated:** 2025-10-08
**Maintained By:** System Administrator
