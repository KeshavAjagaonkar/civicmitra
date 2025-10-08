# Staff Dashboard and Navigation Fixes

## Issues Fixed

### 1. Staff Dashboard - "Failed to load dashboard data" Error ✅

**Problem:**
The staff dashboard was trying to fetch data from non-existent API endpoints, causing the entire dashboard to fail.

**Root Cause:**
- `useStaffData.js` was calling `/api/users/workers/performance` (doesn't exist)
- `useStaffData.js` was calling `/api/users/department/alerts` (doesn't exist)

**Solution:**
Updated `frontend/src/hooks/useStaffData.js` to use existing endpoints:

1. **Worker Performance:**
   - Now fetches all complaints via `/api/complaints/all`
   - Fetches workers via `/api/admin/users?role=worker&department={id}`
   - Calculates performance metrics (assigned tasks, completed tasks, efficiency) client-side

2. **Department Alerts:**
   - Now generates smart alerts based on complaint data
   - Alerts for:
     - Unassigned complaints
     - High priority complaints needing attention
     - Overdue complaints (past deadline)

3. **Recent Complaints:**
   - Already using correct endpoint `/api/complaints/recent`
   - No changes needed

4. **Added proper user dependency:**
   - Both hooks now wait for `user` to be available before fetching
   - Prevents API calls with undefined department IDs

### 2. Staff Complaint Management - Navigation Issues ✅

**Problem:**
In the staff complaints page, clicking on "Reassign Worker" or "Chat" buttons showed "Page Not Found" error.

**Root Cause:**
Navigation paths didn't include the department slug prefix (e.g., `/water-supply/staff/...`)

**Solution:**
Updated `frontend/src/pages/staff/ComplaintManagement.jsx`:

1. **Added department slug-aware base path:**
   ```javascript
   const departmentSlug = user?.department?.slug;
   const basePath = departmentSlug ? `/${departmentSlug}/staff` : '/staff';
   ```

2. **Fixed all navigation buttons:**
   - **View Details:** `${basePath}/complaints/${complaint._id}`
   - **Assign Worker:** `${basePath}/complaints/${complaint._id}/assign`
   - **Reassign Worker:** `${basePath}/complaints/${complaint._id}/edit-assignment`
   - **Chat:** `${basePath}/chat?complaintId=${complaint._id}`

3. **Improved Reassign button:**
   - Changed route from `/assign` to `/edit-assignment`
   - Now opens the dedicated edit assignment page with both worker and deadline modification

### 3. Stats Page Added to Navigation ✅

**Problem:**
The new Statistics page wasn't accessible from the staff sidebar navigation.

**Solution:**
Updated `frontend/src/components/layout/Sidebar.jsx`:
- Added "Statistics" menu item with BarChart3 icon
- Route: `/staff/stats` (automatically adapts to department slug)

## Files Modified

### Frontend Files:
1. `frontend/src/hooks/useStaffData.js` - Complete rewrite to use existing endpoints
2. `frontend/src/hooks/useDashboardStats.js` - Added user dependency check
3. `frontend/src/pages/staff/ComplaintManagement.jsx` - Fixed navigation paths
4. `frontend/src/components/layout/Sidebar.jsx` - Added stats menu item

## Testing Checklist

- [x] Staff dashboard loads without errors
- [x] Worker performance displays correctly
- [x] Department alerts show relevant warnings
- [x] Recent complaints display
- [x] View Details button works
- [x] Assign Worker button works
- [x] Reassign Worker button works
- [x] Chat button works
- [x] Statistics page accessible from sidebar

## Current Staff Navigation

The staff sidebar now includes:
1. Dashboard
2. Complaints
3. Workers
4. **Statistics** (NEW)
5. Chat

## Features Now Working

### Staff Dashboard:
- ✅ Total complaints, resolved, pending stats
- ✅ Recent complaints list
- ✅ Worker performance with efficiency metrics
- ✅ Department alerts (unassigned, high priority, overdue)
- ✅ Navigate to complaint details
- ✅ Navigate to worker management

### Staff Complaints Page:
- ✅ View all department complaints
- ✅ Filter by status, priority, worker
- ✅ Search complaints
- ✅ View complaint details
- ✅ Assign workers to complaints
- ✅ Reassign workers and modify deadlines
- ✅ Access chat for each complaint

### Staff Statistics Page:
- ✅ Department overview metrics
- ✅ Worker status with active task counts
- ✅ Recent complaints summary
- ✅ Export to Excel
- ✅ Export to PDF

## Notes

- All navigation now properly includes department slugs
- Error handling improved with graceful fallbacks
- Performance metrics calculated efficiently client-side
- Smart alerts generated based on real-time data
