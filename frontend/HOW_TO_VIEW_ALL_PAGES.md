# How to View All Pages - CivicMitra Frontend

## 🎯 **Quick Answer**

**Visit `/dev` for the main development navigation**, or use these direct routes:

- **`/showcase`** - Browse ALL pages in one interface (recommended)
- **`/test-login`** - Quick login to test protected routes
- **`/debug`** - See authentication status and system info

## 🚀 **Step-by-Step Guide**

### Method 1: Using the Page Showcase (Recommended)

1. **Start the development server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open your browser and visit:**
   ```
   http://localhost:5173/showcase
   ```

3. **You'll see a comprehensive interface with:**
   - ✅ **All 25+ pages** in one place
   - ✅ **Search functionality** to find specific pages
   - ✅ **Category filtering** (Public, Auth, Citizen, Admin, Staff, Worker, Utility)
   - ✅ **Live preview** of each page
   - ✅ **No authentication required**

### Method 2: Using Development Navigation

1. **Visit the dev hub:**
   ```
   http://localhost:5173/dev
   ```

2. **This gives you:**
   - Quick access to all development tools
   - Overview of all route structures
   - Links to each testing utility
   - Visual guide to the application structure

### Method 3: Testing Protected Routes

1. **Visit the test login page:**
   ```
   http://localhost:5173/test-login
   ```

2. **Login as different roles:**
   - **Citizen** - Access `/dashboard`, `/complaints/*`
   - **Admin** - Access `/admin/*` routes
   - **Staff** - Access `/staff/*` routes  
   - **Worker** - Access `/worker/*` routes

3. **Navigate to role-specific pages after logging in**

## 📋 **Complete Page List**

### 🌐 Public Pages (No Auth Required)
```
/                     - Landing Page
/login               - User Login
/register            - User Registration
/admin-login         - Admin Login
/forgot-password     - Password Recovery
```

### 👤 Citizen Pages (Role: citizen)
```
/dashboard                    - Citizen Dashboard
/complaints                   - My Complaints List
/complaints/create            - File New Complaint
/complaints/:id               - Complaint Details
/complaints/:id/feedback      - Provide Feedback
```

### 👑 Admin Pages (Role: admin)
```
/admin                        - Admin Dashboard
/admin/users                  - User Management
/admin/users/create           - Create User
/admin/users/:id              - View/Edit User
/admin/users/:id/edit         - Edit User
/admin/departments            - Department Management
/admin/departments/create     - Create Department
/admin/departments/:id        - View/Edit Department
/admin/departments/:id/edit   - Edit Department
/admin/complaints             - All Complaints
/admin/complaints/:id         - View Complaint
/admin/complaints/:id/edit    - Edit Complaint
/admin/complaints/:id/assign  - Assign Complaint
/admin/reports                - System Reports
/admin/analytics              - System Analytics
/admin/profile                - Admin Profile
```

### 👥 Staff Pages (Role: staff)
```
/staff                          - Staff Dashboard
/staff/complaints               - Department Complaints
/staff/complaints/:id           - View Complaint
/staff/complaints/:id/edit      - Edit Complaint
/staff/complaints/:id/assign    - Assign to Worker
/staff/complaints/:id/chat      - Chat with Citizen
/staff/workers                  - Worker Management
/staff/workers/create           - Create Worker
/staff/workers/:id              - View Worker
/staff/profile                  - Staff Profile
```

### 🔧 Worker Pages (Role: worker)
```
/worker                    - Worker Dashboard
/worker/tasks              - Assigned Tasks
/worker/tasks/:id          - Task Details
/worker/tasks/:id/update   - Update Task Progress
/worker/reports            - Work Reports
/worker/profile            - Worker Profile
```

### 🛠️ Development Pages
```
/dev                       - Development Navigation Hub
/showcase                  - View All Pages Interface
/debug                     - Authentication & System Debug
/test-login               - Mock Login for All Roles
```

## 🎨 **Page Showcase Features**

The `/showcase` route provides:

### Search & Filter
- **Search by name**: "Dashboard", "Complaint", etc.
- **Search by route**: "/admin", "/worker", etc.
- **Search by description**: "authentication", "management", etc.

### Category Filtering
- **Public Pages** - No authentication needed
- **Authentication** - Login/register pages
- **Citizen Pages** - Citizen user interfaces
- **Admin Pages** - Administrative interfaces
- **Staff Pages** - Department staff interfaces
- **Worker Pages** - Field worker interfaces
- **Utility Pages** - Development and error pages

### Live Preview
- **Click any page** in the sidebar to see it instantly
- **Full page rendering** with all components
- **Interactive elements** work normally
- **No authentication barriers**

## 🔧 **Development Workflow**

### For UI Development:
1. Use `/showcase` to quickly find and preview any page
2. Make changes to components
3. Refresh to see updates instantly
4. Test across different page types

### For Authentication Testing:
1. Use `/test-login` to quickly switch between user roles
2. Test protected routes for each role
3. Use `/debug` to verify authentication state
4. Log out and test public routes

### For Route Testing:
1. Use `/dev` to see all available routes
2. Click direct links to test navigation
3. Verify protected routes work correctly
4. Test 404 handling with invalid routes

## ⚡ **Pro Tips**

1. **Bookmark `/dev`** for quick access to all development tools
2. **Use `/showcase`** when you want to browse UI components
3. **Use `/test-login`** when you need to test role-based features
4. **Use `/debug`** when troubleshooting authentication issues
5. **Keep the browser console open** to see debug logs

## 🚨 **Troubleshooting**

### If pages appear blank:
1. Check browser console for errors
2. Visit `/debug` to see authentication status
3. Use `/test-login` to authenticate if needed
4. Verify the page exists in `/showcase`

### If protected routes don't work:
1. Use `/test-login` to log in with appropriate role
2. Check `/debug` for authentication status
3. Verify role permissions in the console logs

### If components don't render:
1. Check for JavaScript errors in console
2. Verify all imports are working
3. Check if components are properly exported

## 🎉 **Summary**

**The easiest way to view all pages:**
1. **Start dev server**: `npm run dev`
2. **Visit**: `http://localhost:5173/showcase`
3. **Browse all pages** without any authentication barriers!

This comprehensive system allows you to view, test, and develop all parts of your CivicMitra application efficiently! 🚀