# PujaConnect Quick Start Guide

## What Was Just Implemented

### ✅ Complete OTP Validation Flow
The application now has a fully integrated authentication system with user profile retrieval:

```
Phone Input → Send OTP → Verify OTP → Validate OTP & Get User Data → Dashboard
```

## How to Use

### 1. Start Development Server
```bash
npm run dev
```
Application runs at: http://localhost:5173

### 2. Test the Login Flow
```
Step 1: Click "Get Started" button on landing page
Step 2: Enter mobile number: 9876543210
Step 3: Click "Send OTP" (you'll get success alert)
Step 4: Enter test OTP: 111111
Step 5: Click "Verify & Login"
Step 6: See success screen with Om symbol
Step 7: Dashboard loads with user profile info
```

## Key Features Implemented

### Authentication Service (`src/services/authService.ts`)
- ✅ Token generation and automatic refresh
- ✅ OTP sending to mobile numbers
- ✅ OTP validation and verification
- ✅ User data retrieval from backend
- ✅ Secure token storage in localStorage
- ✅ Automatic token expiry handling

### Login Screen (`src/pages/LoginScreen.tsx`)
- ✅ Two-step mobile verification (phone → OTP)
- ✅ 6-digit OTP input with validation
- ✅ Beautiful gradient background with image carousel
- ✅ Success/error alerts with auto-dismiss
- ✅ Success screen with religious symbols (Om ॐ, Prayer hands 🙏)

### Dashboard (`src/pages/Dashboard.tsx`)
- ✅ User profile display with name, phone, ID
- ✅ Account type detection (Priest/User)
- ✅ Quick action buttons (Browse Temples, Services, Bookings)
- ✅ Logout functionality with data cleanup
- ✅ Responsive design for all devices

## Data Stored

### Token Storage (localStorage)
```json
{
  "puja_connect_auth_token": {
    "token": "eyJhbGc...",
    "expiry": 1769161241000
  }
}
```

### User Data Storage (localStorage)
```json
{
  "puja_connect_user": {
    "user_id": 2,
    "user_name": "7980544903",
    "user_type_id": 50,
    "user_full_name": "Indranil"
  }
}
```

## API Endpoints Used

| Endpoint | Purpose | Headers |
|----------|---------|---------|
| `POST /auth/generateToken` | Get auth token | Basic auth |
| `POST /auth/generate_otp` | Send OTP to phone | Bearer token |
| `POST /auth/validate_otp` | Validate OTP & get user data | Bearer token |

## Code Examples

### Sending OTP
```typescript
import { authService } from '../services/authService';

try {
  await authService.sendOTP('9876543210');
  console.log('OTP sent successfully');
} catch (error) {
  console.error('Error:', error.message);
}
```

### Validating OTP & Getting User Data
```typescript
try {
  const { userData } = await authService.validateOTP('9876543210', '111111');
  console.log('User:', userData.user_full_name);
  console.log('Phone:', userData.user_name);
  
  // Store for dashboard
  localStorage.setItem('puja_connect_user', JSON.stringify(userData));
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

### Getting User Data in Components
```typescript
const [userData, setUserData] = useState<UserData | null>(null);

useEffect(() => {
  const stored = localStorage.getItem('puja_connect_user');
  if (stored) {
    setUserData(JSON.parse(stored));
  }
}, []);

// Use userData.user_full_name, userData.user_id, etc.
```

## Environment Configuration

File: `.env`
```env
VITE_API_BASE_URL=http://115.187.62.16:8005/PujaConnectRestAPI/api
VITE_AUTH_HEADER=Basic YURtaW4jVG9rZW4kR2VOYVJhVGUyNjphZG1pbkAxMjM=
VITE_TOKEN_STORAGE_KEY=puja_connect_auth_token
VITE_DEBUG=false
```

Change `VITE_DEBUG=true` to see detailed API logs in browser console.

## Build & Deploy

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## File Structure

```
src/
├── pages/
│   ├── LandingPage.tsx      # Home page with features
│   ├── LoginScreen.tsx       # OTP login form
│   └── Dashboard.tsx         # User profile & quick actions
├── services/
│   └── authService.ts        # API service with token & OTP
├── components/
│   ├── ImageCarousel.tsx     # Background image slider
│   ├── AlertMessage.tsx      # Success/error alerts
│   └── OTPSuccessScreen.tsx  # Success modal with Om symbol
├── config/
│   └── apiConfig.ts          # API configuration
├── App.tsx                   # Router setup
├── index.css                 # Global styles
└── App.css                   # Animations
```

## Debugging Tips

### Check Token in Console
```javascript
// In browser console:
const stored = localStorage.getItem('puja_connect_auth_token');
console.log(JSON.parse(stored));
```

### Check User Data in Console
```javascript
// In browser console:
const user = localStorage.getItem('puja_connect_user');
console.log(JSON.parse(user));
```

### Enable API Logging
Change in `.env`:
```env
VITE_DEBUG=true
```
Then check browser DevTools → Console for detailed logs.

## Next Steps

1. ✅ **Authentication**: Complete (token generation, OTP validation)
2. ⏭️ **Temple Management**: Add temple listing and filtering
3. ⏭️ **Booking System**: Implement booking calendar
4. ⏭️ **Priest Profile**: Profile editing and service management
5. ⏭️ **Payment**: Add payment gateway integration
6. ⏭️ **Reviews**: Add ratings and reviews system

## Support

For API integration questions, see: `API_INTEGRATION.md`
For testing guide, see: `TEST_GUIDE.md`
For implementation details, see: `IMPLEMENTATION_SUMMARY.md`

---

**Application Status**: ✅ Ready for Testing
**Build Status**: ✅ Successful
**TypeScript Compilation**: ✅ No Errors
**Browser Compatibility**: ✅ All Modern Browsers
