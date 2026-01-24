# 🎯 Admin Dashboard - Priest Management System

## Overview

A comprehensive priest management dashboard with statistics, search, and CRUD operations for priest onboarding and approval workflow.

## Features

### 📊 Dashboard Statistics
- **Total Priests Onboarded** - Count of all priests added by agents
- **Pending Approval** - Priests waiting for admin review
- **Approved Priests** - Active priests on the platform

Each stat card includes:
- Large, easy-to-read numbers
- Emoji icons for visual appeal
- Helpful descriptions
- Color-coded cards (Blue, Yellow, Green)

### 🔍 Search & Filter
- **Search Bar** - Search by priest name, phone, or email
- **Status Filter** - Filter by: All, Approved, Pending, Rejected
- **Real-time Updates** - Results update as you type

### ➕ Add New Priest
Modal form with fields:
- Full Name (required)
- Phone Number (required)
- Email (required)
- Years of Experience
- Specializations (comma-separated)
- Default Status: Pending

### 👁️ View Priest Details
Modal displays:
- Complete priest information
- Specializations as colored badges
- Current approval status
- Delete button

### ✏️ Edit Priest
Toggle edit mode to modify:
- Name, phone, email
- Experience level
- Specializations
- Approval status

### 🗑️ Delete Priest
Safe deletion with confirmation prompt

## How to Access

### From User Dashboard
1. Login with any credentials (test: 9876543210, OTP: 111111)
2. You'll see "Go to Priest Management" button if user_type_id = 50
3. Click to access admin dashboard

### Direct URL
```
http://localhost:5173/admin/dashboard
```

## User Interface Components

### Priest Table
Professional table layout showing:
- Priest Name & Specializations
- Phone & Email
- Experience (years)
- Status Badge (Approved/Pending/Rejected)
- Date Added
- Action Buttons (View, Edit, Delete)

### Status Badges
- ✅ **Approved** - Green with checkmark icon
- ⏳ **Pending** - Yellow with clock icon
- ❌ **Rejected** - Red with alert icon

### Action Buttons
- 👁️ **View** - View details (read-only)
- ✏️ **Edit** - Modify priest information
- 🗑️ **Delete** - Remove from system

## Data Structure

### Priest Object
```typescript
interface Priest {
  id: number;
  name: string;
  phone: string;
  email: string;
  experience: number;
  specialization: string[];
  status: 'approved' | 'pending' | 'rejected';
  approvedBy?: string;
  dateAdded: string;
  updatedAt: string;
}
```

### Dashboard Stats Object
```typescript
interface DashboardStats {
  totalOnboarded: number;
  pendingApproval: number;
  approved: number;
}
```

## Test Data Included

Mock priests pre-loaded:
1. **Pandit Sharma** - 15 years, Approved
2. **Priest Gupta** - 8 years, Pending
3. **Pandit Mishra** - 20 years, Approved
4. **Priest Patel** - 5 years, Pending

## Color Scheme

- **Primary**: Orange/Red gradient (branding)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)
- **Info**: Blue (#3b82f6)

## Key Features

✅ Add new priests with validation
✅ Search by name, phone, or email
✅ Filter by approval status
✅ View complete priest details
✅ Edit priest information
✅ Delete priests with confirmation
✅ Real-time statistics updates
✅ Status badge indicators
✅ Responsive design (mobile, tablet, desktop)
✅ Beautiful gradient backgrounds
✅ Smooth transitions and hover effects

## Responsive Design

- **Mobile** (< 768px): Single column, stacked layout
- **Tablet** (768px - 1024px): 2-3 column grid
- **Desktop** (> 1024px): Full layout with horizontal scrolling table

## Navigation

From Admin Dashboard:
- Click "Logout" to return to login
- Click "PujaConnect" logo to go home (via header)

From User Dashboard:
- Click "Go to Priest Management" button
- Requires user_type_id = 50 (Priest type)

## Features Ready for API Integration

Current features use mock data. Ready to integrate:
- ✅ Priest List - GET /api/priests
- ✅ Add Priest - POST /api/priests
- ✅ Update Priest - PUT /api/priests/{id}
- ✅ Delete Priest - DELETE /api/priests/{id}
- ✅ Search Priests - GET /api/priests/search?q=name

## Next Steps

1. **Backend Integration** - Connect to API endpoints
2. **Authentication** - Add role-based access control
3. **Pagination** - Handle large priest lists
4. **Bulk Actions** - Approve multiple priests at once
5. **Export** - Export priest list to CSV/PDF
6. **Analytics** - Add charts for approval trends
7. **Email Notifications** - Notify priests of status changes
8. **Image Upload** - Add priest profile photos

## Technical Details

### Built With
- React 19 with TypeScript
- Tailwind CSS v3
- Lucide React Icons
- React Router DOM

### File Structure
- `/src/pages/AdminDashboard.tsx` - Main component (450+ lines)
- Components: AddPriestModal, ViewEditPriestModal, getStatusColor helper

### State Management
- useState for local state
- useEffect for initialization
- localStorage for persistence

### Performance
- Optimized for 100+ priests
- Real-time search and filter
- Memoized status functions
- Efficient re-renders
