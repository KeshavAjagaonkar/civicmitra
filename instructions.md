1. https://dribbble.com/shots/18469102-GBL-Complaint-Management-System?utm_source=Clipboard_Shot&utm_campaign=shahinsrowar&utm_content=GBL%20-%20Complaint%20Management%20System&utm_medium=Social_Share&utm_source=Clipboard_Shot&utm_campaign=shahinsrowar&utm_content=GBL%20-%20Complaint%20Management%20System&utm_medium=Social_Share.

above is the link of some random design on the internate for complaint management system.
i dont want exact color scheme like that but the structure is good and best.
add best color scheme to make attractive and visualy appealing.

2.now the usermanagement route is showing invalid , and admin/departments this is also invalid , taking that into consideration and think for while by yourself for proper desinging thiking add this part too , and make sure that you in future is going to make backend too , so for now just focus on frontend building different pages needed with proper ui for each pages.

3.add differnt color for priority icon for each complaint in the table.

4. now add pages for user all necessary pages for user should be added in this step.
you can think yourself , what are necessary pages required for user.Login / Register
CitizenDashboard FileComplaint MyComplaints ComplaintDetails (with Timeline + Chat) Feedback this are needed pages according to me , add remove by yourself , think from yourside too , what to add and what dont.

5. the admin pages are not linked to admin navbar , meaning the navbar of admin is same as user so make changes to make it admin navbar.
and you add the notification , but when i click the notification the ui of notification is transperant so whatever underneath of it is visible.make changes to that.

6 .GOALS (AUTH + INFO ONLY){
=========================
1) Build a professional **landing page** that explains CivicMitra clearly.
2) Redesign **Login** and **Register (Citizen only)** using shadcn/ui with a clean AuthLayout.
3) Add must-have legal/info sections (T&C, Privacy, Help) in the footer.
4) Make it responsive, accessible (a11y), mobile-first, and production-ready.
5) Use **dummy/static data** where needed. No backend calls yet.

=========================
STYLE & UX PRINCIPLES
=========================
- Modern SaaS look; draw light inspiration from: 
  - the provided Dribbble reference; do NOT copy it.
- Design language:
  - Glassmorphism cards (transparent bg + subtle blur + soft shadows).
  - Gradient action buttons (Blue→Green, Orange→Red).
  - Deep navy gradient topbar (used only on landing, not on auth form panel).
  - Clean sans-serif typography; comfortable spacing.
- Dark mode ready (but OK to ship light-first with neutral tokens).
- Use shadcn/ui components: Card, Button, Input, Label, Select, Badge, Tabs, Accordion, Dialog, Sheet, Separator, Tooltip, Avatar, DropdownMenu.
- Keep bundle lean: no heavy animations; use small, tasteful transitions.

=========================
PAGES TO IMPLEMENT (ROUTES)
=========================
- `/` (Landing)
- `/login` (Auth page)
- `/register` (Citizen registration only)
- `/admin-login` (Admin only, simple form, no register link)

=========================
LANDING PAGE CONTENT (REQUIRED)
=========================
Hero (top):
- Title: “CivicMitra — Smart Complaint Management for Your City”
- Subtitle: “File issues in minutes. Track progress. Get notified.”
- Primary CTA: “Login” and Secondary CTA: “Register as Citizen”
- Optional illustration area (use a neutral SVG/shape; no stock photos)

Value Cards (3–6):
- “File a Complaint Easily” — guided form with location & attachments
- “Transparent Tracking” — live status & timeline
- “Priority Handling” — High/Medium/Low with clear SLAs
- “Department Routing” — Water, Roads, Waste, Electricity…
- “Chat & Feedback” — get answers, rate resolutions
- “Secure & Private” — your data is protected

How It Works (3 steps with icons):
1) Submit your issue (title, description, category, location, priority)
2) Track status & chat with staff
3) Resolution updates & feedback

Departments (grid with icons + labels):
- Water, Roads, Waste Management, Electricity, Streetlights, Drainage

Why CivicMitra (bullets):
- Faster response times, transparent process, citizen-first design

FAQ (Accordion):
- “Who can register?” → Citizens only.
- “How long does resolution take?” → Depends on priority & department.
- “How do I track my complaint?” → Dashboard → My Complaints → Details.
- “Is my data secure?” → Stored securely; see Privacy Policy.

Footer (must-have links):
- About | Contact/Help | Privacy Policy | Terms & Conditions | Accessibility | Language switcher (EN/HI/MR)
- Disclaimer: “CivicMitra is a platform to submit and track municipal complaints. Emergency issues? Call your local helpline.”

=========================
AUTH EXPERIENCE (REQUIRED)
=========================
Shared AuthLayout:
- Two-panel layout:
  - Left: Info panel (brand, 1–2 benefits, small illustration, app screenshots placeholders)
  - Right: Form panel (Card with form, title, description)
- On mobile: stack vertically (Form first).
- Add a compact footer (links to Privacy, Terms, Help)

Login (`/login`):
- Fields: email, password
- Buttons: “Login”, “Forgot password?” (placeholder link), “Register as Citizen”
- No role selector here; staff/worker use shared login later; Admin uses `/admin-login`.
- Copy suggestions:
  - Title: “Welcome back to CivicMitra”
  - Subtitle: “Sign in to file, track, and manage your complaints.”

Register (`/register`, Citizen only):
- Fields: name, email, password, confirm password, optional phone
- Checkbox: “I agree to the Terms & Privacy Policy”
- After submit: show success toast + route to `/login` (no backend call now)
- Copy:
  - Title: “Create your Citizen Account”
  - Subtitle: “Start filing complaints in minutes.”

Admin Login (`/admin-login`):
- Separate route with minimal form (email, password)
- No link to register; Admin accounts are created during system setup.

=========================
FORMS — UX & VALIDATION
=========================
- Use floating labels or clear labels + placeholders.
- Real-time client-side validation:
  - Email format
  - Password ≥ 6 chars; match confirm
  - Terms checkbox required on register
- Error states: inline messages + aria-live region (a11y)
- Disable submit while “processing”
- Show success/failure toasts (use shadcn toast)

=========================
ACCESSIBILITY (A11Y)
=========================
- Keyboard navigable; visible focus rings
- Proper `label` ↔ `input` linking; `aria-describedby` for errors
- Sufficient color contrast; support prefers-reduced-motion
- Language switcher accessible via button with menu

=========================
INFORMATION TO OMIT / DO NOT ADD
=========================
- No backend/API calls, no axios/fetch.
- No admin/staff/worker public registration.
- No ads, no tracking pixels/analytics.
- No lorem ipsum—use the copy provided here. If missing, use short, meaningful placeholders.
- No heavy animations, parallax, or large images.
- Do not change routing outside the three routes listed (plus `/admin-login`).
}


7.Background color of the form should be different from body background.
  inside the form when i click any input field the border of it get disappeared , i dont want such behaviour.
  header should take full width and the navbar which contains dashboard , complaints , etc should be below the header and form should look like in theme of mycomplaints table where the complaint table stand out or look different from other background color.
  next changes is in priority button all buttons should be equal lenght and content in it should be cerntralised.   

