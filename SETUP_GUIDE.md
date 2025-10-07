# CivicMitra - Complete Setup & Troubleshooting Guide

## 🎯 Project Overview
CivicMitra is a full-stack MERN complaint management system for Indian Municipal Corporations featuring:
- **AI-powered complaint classification** using Google Gemini API
- **Role-based access control** (Citizen, Worker, Department Staff, Admin)
- **Real-time notifications** via Socket.IO
- **File uploads** with Cloudinary
- **Modern React frontend** with shadcn/ui components

## 🚀 Quick Start

### Method 1: Using the Startup Script (Recommended)
```powershell
# Run this command from the project root directory
.\start.ps1
```

### Method 2: Manual Start (Two Terminals)
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## ⚙️ Environment Configuration

### 🔑 Important: Get Your Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Replace `your_gemini_api_key_here` in `backend\.env` with your actual key

### Backend (.env) - ✅ Already Configured
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://...  # ✅ Already connected
JWT_SECRET=...               # ✅ Already set
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=...    # ✅ Already configured
CLOUDINARY_API_KEY=...       # ✅ Already configured  
CLOUDINARY_API_SECRET=...    # ✅ Already configured
GEMINI_API_KEY=your_gemini_api_key_here  # ⚠️ REPLACE THIS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env) - ✅ Already Configured
```env
VITE_BACKEND_URL=http://localhost:5000
```

## 🔧 Features Status

### ✅ Fully Working Features
- **Database Connection**: MongoDB connected successfully
- **Backend Server**: Express.js server running on port 5000
- **Frontend Server**: Vite React app running on port 5173
- **Socket.IO**: Real-time notifications and chat working
- **File Uploads**: Cloudinary integration ready
- **Authentication**: JWT-based auth system
- **AI Classification**: Implemented with Gemini API (needs API key)
- **Role-based Access**: All roles implemented (Citizen, Worker, Staff, Admin)

### 🔑 Requires Your Action
- **Gemini API Key**: Replace placeholder in backend/.env with real key
- **Initial Data**: Run `npm run seed` in backend to populate sample data

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Citizen registration  
- `POST /api/auth/login` - User login (all roles)
- `GET /api/auth/me` - Get current user

### Complaints  
- `POST /api/complaints` - Create complaint (with AI classification)
- `GET /api/complaints/my` - Get user's complaints
- `GET /api/complaints` - Get complaints (role-scoped)
- `PATCH /api/complaints/:id/status` - Update status
- `PUT /api/complaints/:id/timeline` - Update timeline

### Real-time Features
- `GET /api/notifications` - Get notifications
- `GET /api/chats` - Chat messages
- Socket events: `join_notifications`, `send_message`, `receive_message`

## 🏗️ System Architecture

### AI-Powered Complaint Classification
```javascript
// When citizen submits complaint:
1. Title + Description → Gemini AI → Category + Priority + Department
2. Fallback to rule-based classification if AI unavailable
3. Results stored with confidence score and reasoning
```

### Status Flow
```
Submitted → In Progress → Under Review → Resolved → Closed
```

### Role-Based Access
- **Citizen**: File complaints, track status, chat with staff
- **Worker**: Update timeline, manage assigned tasks
- **Department Staff**: Manage department complaints, assign workers
- **Admin**: Full system oversight, user management, analytics

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### 1. Backend Won't Start
```bash
# Check if MongoDB is accessible
cd backend && npm run dev

# Look for: "MongoDB Connected..." in console
# If connection fails, check MONGO_URI in .env
```

#### 2. Frontend Won't Start  
```bash
cd frontend && npm run dev

# If Vite fails, try:
npm install
npm run dev
```

#### 3. AI Classification Not Working
- Replace `your_gemini_api_key_here` in backend/.env with real API key
- Check console for "Gemini API key not configured" warning
- AI will fallback to rule-based classification without key

#### 4. File Upload Issues
- Cloudinary credentials are already configured
- Files fallback to local storage if Cloudinary fails
- Check `backend/uploads/` folder for local files

#### 5. Socket.IO Not Connecting
- Ensure both servers are running
- Check browser console for Socket.IO errors
- Verify FRONTEND_URL in backend/.env matches frontend port

### Development Commands

```bash
# Backend Development
cd backend
npm install          # Install dependencies
npm run dev         # Start with nodemon
npm run seed        # Populate sample data  
npm run seed:destroy # Remove sample data

# Frontend Development
cd frontend  
npm install         # Install dependencies
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 📱 Testing the Application

### 1. Start Both Servers
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### 2. Create Test Data
```bash
cd backend
npm run seed
```

### 3. Test User Roles
- Register as Citizen
- Login with different roles
- Test complaint submission
- Verify AI classification in console logs

### 4. Test Real-time Features  
- Submit complaint
- Check notifications
- Test chat functionality

## 🎨 UI Components

The app uses **shadcn/ui** components with **Glassmorphism** design:
- Transparent backgrounds with blur effects
- Gradient buttons and cards
- Mobile-responsive design
- Dark/light theme support

## 🔐 Security Features

- JWT authentication with secure cookies
- Password hashing with bcryptjs
- Rate limiting (100 requests per 10 minutes)
- CORS protection
- Helmet security headers
- File upload validation
- Role-based authorization

## 📈 Monitoring & Logs

- Morgan HTTP request logging (development)
- Custom error handling middleware
- Socket.IO connection logging
- AI classification result logging

## 🚀 Next Steps

1. **Replace Gemini API Key**: Essential for AI features
2. **Test Complete Workflow**: Citizen → Staff → Worker → Resolution
3. **Customize Departments**: Add your municipal departments
4. **Deploy to Production**: Follow deployment guide in warp.md
5. **Add Custom Features**: Extend based on your needs

---

**🎉 Your CivicMitra system is ready to go! All major features are implemented and working.**

For questions or issues, check the console logs and refer to this troubleshooting guide.