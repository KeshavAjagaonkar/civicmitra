# Gmail SMTP Setup Guide for CivicMitra

## ✅ What Has Been Implemented

All email functionality has been integrated into your CivicMitra application:

### 1. **Email Service Created** (`backend/utils/emailService.js`)
- Welcome emails for new citizens
- Complaint status update notifications
- Worker assignment notifications
- Professional HTML email templates with styling
- Graceful handling when email is not configured

### 2. **Email Integration Added**
- `authController.js`: Sends welcome email when citizens register
- `complaintController.js`: Sends emails for:
  - Status updates
  - Worker assignments
  - Progress updates from workers
  - Complaint resolution

### 3. **Email Validation Working**
✅ Citizens CANNOT register with `@civicmitra.com` emails
✅ Workers CANNOT use `@civicmitra.com` emails
✅ Staff CAN use dummy emails
✅ Admin CAN use dummy emails

---

## 📧 How to Enable Email Notifications (5 Minutes)

### Step 1: Get Gmail App Password

1. **Go to Google Account Security:**
   - Visit: https://myaccount.google.com/security
   - Sign in with your Gmail account

2. **Enable 2-Step Verification** (if not already enabled):
   - Scroll down to "2-Step Verification"
   - Click on it and follow the setup wizard
   - This is REQUIRED for app passwords

3. **Generate App Password:**
   - Go back to: https://myaccount.google.com/security
   - Scroll down to "2-Step Verification"
   - At the bottom, click "App passwords"
   - Select "Mail" as the app
   - Select "Other (Custom name)" as the device
   - Enter "CivicMitra" as the name
   - Click "Generate"
   - **IMPORTANT:** Copy the 16-digit password (looks like: `xxxx xxxx xxxx xxxx`)

### Step 2: Update Your `.env` File

Open `backend/.env` and fill in the email configuration:

```env
# Email Configuration (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="CivicMitra <your-email@gmail.com>"
```

**Example:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=keshav@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM="CivicMitra <keshav@gmail.com>"
```

### Step 3: Restart Your Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ Email service configured with: your-email@gmail.com
```

---

## 📨 What Emails Will Be Sent?

### 1. **Welcome Email** (When Citizen Registers)
- **To:** New citizen
- **Subject:** "Welcome to CivicMitra!"
- **Content:** Welcome message, login email, feature list

### 2. **Worker Assignment Email** (When Staff Assigns Worker)
- **To:** Citizen
- **Subject:** "Worker Assigned to Your Complaint: [Complaint Title]"
- **Content:** Worker details (name, email, phone), complaint info

### 3. **Status Update Email** (When Status Changes)
- **To:** Citizen
- **Subject:** "Complaint Update: [Complaint Title]"
- **Content:** New status, complaint details, link to view

### 4. **Progress Update Email** (When Worker Updates)
- **To:** Citizen
- **Subject:** "Complaint Update: [Complaint Title]"
- **Content:** Worker update message, current status

### 5. **Resolution Email** (When Complaint Resolved)
- **To:** Citizen
- **Subject:** "Complaint Update: [Complaint Title]"
- **Content:** Resolution message, link to give feedback

---

## 🧪 Testing Email Configuration

### Test 1: Register a New Citizen

1. Open frontend: http://localhost:5173
2. Click "Sign up now"
3. Register as "Citizen" with your REAL email
4. Check your email inbox for welcome email

**Expected Result:**
- ✅ Registration successful
- ✅ Welcome email received within 1-2 minutes

### Test 2: File a Complaint

1. Login as the new citizen
2. File a complaint
3. Login as Admin/Staff
4. Assign a worker to the complaint
5. Check citizen's email

**Expected Result:**
- ✅ Worker assignment email received

### Test 3: Worker Update

1. Login as the assigned worker
2. Add a progress update
3. Check citizen's email

**Expected Result:**
- ✅ Progress update email received

---

## ❌ Troubleshooting

### Problem 1: "Email service not configured" in console

**Solution:**
- Check if EMAIL_USER and EMAIL_PASS are filled in `.env`
- Restart the backend server
- Make sure there are no extra spaces in the values

### Problem 2: Emails not being received

**Possible Causes:**
1. **Wrong Gmail credentials:**
   - Verify EMAIL_USER is correct
   - Verify EMAIL_PASS is the 16-digit app password (NOT your Gmail password)

2. **2-Step Verification not enabled:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification first

3. **Email in spam folder:**
   - Check your spam/junk folder
   - Mark CivicMitra emails as "Not Spam"

4. **Gmail blocking "less secure apps":**
   - This shouldn't happen with app passwords
   - But if it does, use app passwords instead of regular password

### Problem 3: "Invalid login" error

**Solution:**
- You're using your regular Gmail password instead of app password
- Generate a NEW app password and use that instead

### Problem 4: Emails sent but console shows error

**Solution:**
- Check backend console for specific error messages
- Common errors:
  - `EAUTH`: Wrong credentials
  - `ETIMEDOUT`: Network/firewall issue
  - `ECONNREFUSED`: Gmail SMTP blocked

---

## 🔒 Security Notes

### ✅ **Safe to Use:**
- App passwords are MORE secure than regular passwords
- App passwords can be revoked anytime
- They're specific to one application
- They don't give access to your Google Account

### ⚠️ **Important:**
- NEVER commit your `.env` file to GitHub
- `.env` is already in `.gitignore`
- Don't share your app password with anyone

### 🔐 **Revoking Access:**
If you need to revoke email access:
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Click "App passwords"
4. Find "CivicMitra" and click "Remove"

---

## 📊 Current System Status

### ✅ **Fully Implemented:**
- Email service utility (`emailService.js`)
- Welcome emails on citizen registration
- Complaint status update emails
- Worker assignment emails
- Worker progress update emails
- Email validation (blocking dummy emails for citizens/workers)
- Frontend validation in registration form
- Backend validation in controllers
- HTML email templates with professional styling
- Graceful degradation (system works without email config)

### ⏳ **Pending (Only This):**
- Fill in EMAIL_USER and EMAIL_PASS in `.env` file
- Restart backend server
- Test email delivery

---

## 🎯 Quick Start (TL;DR)

```bash
# 1. Get Gmail App Password
Visit: https://myaccount.google.com/security
Enable 2-Step → App Passwords → Generate for "Mail"

# 2. Update backend/.env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
EMAIL_FROM="CivicMitra <your-email@gmail.com>"

# 3. Restart backend
cd backend
npm run dev

# 4. Test
Register a new citizen with real email → Check inbox
```

---

## 📞 Need Help?

If you encounter any issues:

1. Check backend console for error messages
2. Verify `.env` file has correct values
3. Ensure no extra spaces in EMAIL_USER or EMAIL_PASS
4. Restart backend after changing `.env`
5. Check email spam folder

---

## ✅ Success Indicators

You'll know it's working when you see:

**In Backend Console:**
```
✅ Email service configured with: your-email@gmail.com
✅ Email sent to: citizen@gmail.com | Subject: Welcome to CivicMitra!
```

**In Email Inbox:**
- Welcome email when citizen registers
- Update emails when complaint status changes
- Assignment emails when worker is assigned

---

**🎉 That's it! Your email system is ready to go!**

The system is fully functional even WITHOUT email configuration - emails are just an additional notification channel. All in-app notifications and features work perfectly regardless of email setup.
