# CivicMitra Frontend Routes

## Current Route Structure

### Public Routes (No Authentication Required)
- `/` - Landing Page
- `/login` - User Login (Citizen, Staff, Worker)
- `/register` - Citizen Registration
- `/admin-login` - Admin Login
- `/forgot-password` - Password Recovery

### Citizen Routes (Protected)
- `/dashboard` - Citizen Dashboard
- `/complaints` - My Complaints List
- `/complaints/create` - File New Complaint
- `/complaints/:id` - Complaint Details
- `/complaints/:id/feedback` - Leave Feedback
- `/feedback` - General Feedback

### Admin Routes (Protected)
- `/admin` - Admin Dashboard
- `/admin/users` - User Management
- `/admin/users/create` - Create User
- `/admin/users/:id` - Edit User
- `/admin/departments` - Department Management
- `/admin/departments/create` - Create Department
- `/admin/departments/:id` - Edit Department
- `/admin/complaints` - Complaint Management
- `/admin/complaints/create` - Create Complaint
- `/admin/complaints/:id` - Edit Complaint
- `/admin/complaints/:id/edit` - Edit Complaint Form
- `/admin/complaints/:id/assign` - Assign Complaint
- `/admin/reports` - Reports
- `/admin/analytics` - System Analytics
- `/admin/settings` - Admin Settings
- `/admin/profile` - Admin Profile

### Staff Routes (Protected)
- `/staff` - Staff Dashboard
- `/staff/complaints` - Staff Complaints
- `/staff/complaints/create` - Create Complaint
- `/staff/complaints/:id` - View Complaint
- `/staff/complaints/:id/edit` - Edit Complaint
- `/staff/complaints/:id/assign` - Assign Worker
- `/staff/complaints/:id/chat` - Chat with Citizen
- `/staff/workers` - Manage Workers
- `/staff/workers/create` - Add Worker
- `/staff/workers/:id` - Edit Worker
- `/staff/assign-worker` - Assign Worker to Complaint
- `/staff/chat` - Staff Chat
- `/staff/profile` - Staff Profile

### Worker Routes (Protected)
- `/worker` - Worker Dashboard
- `/worker/tasks` - Assigned Tasks
- `/worker/tasks/:id` - Task Details
- `/worker/tasks/:id/update` - Update Task Progress
- `/worker/profile` - Worker Profile
- `/worker/reports` - Worker Reports

### Legacy Routes (Backward Compatibility)
- `/my-complaints` - My Complaints (maps to `/complaints`)
- `/file-complaint` - File Complaint (maps to `/complaints/create`)
- `/staff-dashboard` - Staff Dashboard (maps to `/staff`)
- `/department-complaints` - Department Complaints
- `/worker-dashboard` - Worker Dashboard (maps to `/worker`)
- `/worker/assigned-tasks` - Assigned Tasks (maps to `/worker/tasks`)
- `/worker/task-details/:taskId` - Task Details

### Test Routes (Development)
- `/test-routes` - Route Testing Page

## Route Testing

### Access the Route Test Page
Navigate to: `http://localhost:5173/test-routes`

This page provides links to test all available routes and shows the current path.

## Common Issues & Solutions

### 1. Routes Not Loading
**Problem**: Pages show blank or don't load
**Solutions**:
- Check if the development server is running: `npm run dev`
- Verify the route exists in `App.jsx`
- Check browser console for JavaScript errors
- Ensure all imported components exist

### 2. 404 Errors
**Problem**: Getting "Not Found" pages
**Solutions**:
- Verify the exact route path
- Check for typos in URLs
- Ensure route is defined in `App.jsx`
- Check if route is protected by authentication

### 3. Authentication Issues
**Problem**: Redirected to login or access denied
**Solutions**:
- Currently no authentication guard is implemented
- All routes under `Layout` are accessible
- Check if user role detection works in Sidebar

### 4. Component Import Errors
**Problem**: "Module not found" errors
**Solutions**:
- Verify component files exist in correct paths
- Check import statements in `App.jsx`
- Ensure all dependencies are installed: `npm install`

## Development URLs

### Local Development
- **Frontend**: http://localhost:5173
- **Route Test**: http://localhost:5173/test-routes

### Quick Access URLs
```
# Landing & Auth
http://localhost:5173/
http://localhost:5173/login
http://localhost:5173/register
http://localhost:5173/admin-login

# Citizen
http://localhost:5173/dashboard
http://localhost:5173/complaints
http://localhost:5173/complaints/create

# Admin
http://localhost:5173/admin
http://localhost:5173/admin/users
http://localhost:5173/admin/complaints

# Staff
http://localhost:5173/staff
http://localhost:5173/staff/complaints

# Worker
http://localhost:5173/worker
http://localhost:5173/worker/tasks
```

## Route Protection Status

### Currently Implemented
- ✅ Route definitions in `App.jsx`
- ✅ Layout components (Navbar, Sidebar)
- ✅ Role-based sidebar navigation
- ✅ Responsive design

### Not Yet Implemented
- ❌ Authentication guards
- ❌ Role-based route protection
- ❌ Login/logout functionality
- ❌ Session management
- ❌ Route-based redirects

## Next Steps for Route Protection

1. **Implement Authentication Context**
2. **Create Protected Route Component**  
3. **Add Login/Logout Logic**
4. **Implement Role-Based Guards**
5. **Add Route Redirects**

## Debugging Commands

```bash
# Start development server
npm run dev

# Check for build errors
npm run build

# Check routes in browser
# Navigate to: http://localhost:5173/test-routes
```

## Route Structure Notes

- Routes are grouped by user role for better organization
- Legacy routes maintain backward compatibility
- All authenticated routes use the `Layout` wrapper
- Authentication routes use `AuthLayout`
- Landing page uses `LandingPageLayout`