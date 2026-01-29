# CivicMitra - Login Credentials

## System Structure

**Registration Entities (Public):**
- ✅ **Citizens** - Can register publicly at `/auth`
- ✅ **Workers** - Can register publicly at `/auth` (must select department)
- ❌ **Staff** - CANNOT register (created only by Admin)
- ❌ **Admin** - CANNOT register (1 seeded admin account only)

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

Workers can register themselves at `/auth` by:
1. Selecting "Field Worker" role
2. Choosing their department from the dropdown

**No pre-seeded worker accounts** - Workers register themselves with their department details.

---

## How to Register

### For Citizens:
1. Go to `/auth`
2. Click "Register"
3. Select "Citizen" role
4. Fill in details (name, email, phone, address, password)
5. Submit

### For Workers:
1. Go to `/auth`
2. Click "Register"
3. Select "Field Worker" role
4. Choose your department (Water Supply, Sanitation, etc.)
5. Fill in details (name, email, phone, address, password)
6. Submit

### For Staff:
Staff accounts are created by Admin only. Contact the system administrator.

---

## Role-Based Access

- **Citizen**: File complaints, track status, chat with staff, give feedback
- **Worker**: View assigned complaints, update timeline with progress photos
- **Staff**: View department complaints, assign workers, respond to chats, monitor progress
- **Admin**: Full system access - manage users, departments, view analytics, export reports
