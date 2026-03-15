# CivicMitra - Login Credentials

## System Structure

**Registration Entities (Public):**
- ✅ **Citizens** - Can register publicly at `/auth`
- ❌ **Workers** - CANNOT register publicly (created only by Admin via `/api/admin/users`)
- ❌ **Staff** - CANNOT register publicly (created only by Admin via `/api/admin/users`)
- ❌ **Admin** - CANNOT register (1 seeded admin account only)

> **Note:** Public registration at `/auth` always creates **citizen** accounts. All staff and worker accounts must be created by the Admin from the Admin Dashboard.

---

## Admin Account (Seeded)

**Email:** admin@civicmitra.com
**Password:** admin123
**Dashboard:** `/admin`

**Note:** There is only ONE admin account. Admin manages the entire system, creates staff accounts, and oversees all departments.

---

## Department Staff (1 Staff per Department)

Staff accounts are created ONLY by the Admin. Staff cannot register themselves.

### Water Supply Department
**Email:** staff.water@civicmitra.com
**Password:** staff123
**Dashboard:** `/water-supply/staff`

### Sanitation Department
**Email:** staff.sanitation@civicmitra.com
**Password:** staff123
**Dashboard:** `/sanitation/staff`

### Road Maintenance Department
**Email:** staff.roads@civicmitra.com
**Password:** staff123
**Dashboard:** `/road-maintenance/staff`

### Street Lighting Department
**Email:** staff.lighting@civicmitra.com
**Password:** staff123
**Dashboard:** `/street-lighting/staff`

### Health & Hygiene Department
**Email:** staff.health@civicmitra.com
**Password:** staff123
**Dashboard:** `/health-hygiene/staff`

### Parks & Gardens Department
**Email:** staff.parks@civicmitra.com
**Password:** staff123
**Dashboard:** `/parks-gardens/staff`

---

## Sample Citizen Accounts

Citizens can register at `/auth` by selecting "Citizen" role.

### Citizen 1 - Rahul Sharma
**Email:** citizen@civicmitra.com
**Password:** citizen123
**Dashboard:** `/dashboard`

### Citizen 2 - Anjali Verma
**Email:** citizen2@civicmitra.com
**Password:** citizen123
**Dashboard:** `/dashboard`

---

## Worker Accounts

Worker accounts are created by the Admin only (same as Staff).
Admin creates workers via the Admin Dashboard → User Management → Create User → Select "Worker" role + Department.

**No pre-seeded worker accounts** — Admin creates them as needed.

---

## How to Register

### For Citizens:
1. Go to `/auth`
2. Click "Register"
3. Fill in details (name, email, phone, address, password)
4. Submit

### For Workers & Staff:
Worker and Staff accounts are created by the Admin only.
1. Admin logs in at `/admin`
2. Goes to User Management
3. Clicks "Create User"
4. Selects role (Staff or Worker) and assigns a Department
5. Fills in user details and submits

---

## Role-Based Access

- **Citizen**: File complaints, track status, chat with staff, give feedback
- **Worker**: View assigned complaints, update timeline with progress photos
- **Staff**: View department complaints, assign workers, respond to chats, monitor progress
- **Admin**: Full system access - manage users, departments, view analytics, export reports
