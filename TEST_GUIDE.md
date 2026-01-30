# PujaConnect Testing Guide

## Quick Start Testing

### Prerequisites
- Application running: `npm run dev`
- Browser open at: http://localhost:5173
- Network access to: http://115.187.62.16:8005/PujaConnectRestAPI/api

## Test Scenarios

### Scenario 1: Test OTP Flow
**Duration:** ~5 minutes

1. **Navigate to Login**
   - Click "Get Started" on landing page
   - Should see login screen with phone input

2. **Send OTP**
   - Enter mobile number: `9876543210` (or any 10-digit number)
   - Click "Get OTP"
   - Expected: 
     - Loading spinner appears
     - Success alert: "OTP Sent Successfully!" (green)
     - Alert auto-dismisses after 2 seconds
     - Phone input becomes disabled
     - OTP input field appears

3. **Verify OTP**
   - Enter OTP: `111111` (6 digits, default test OTP)
   - Click "Verify OTP"
   - Expected:
     - Loading spinner appears
     - Success screen appears with Om symbol (ॐ)
     - "Blessed!" message displayed
     - Prayer hands emoji (🙏) visible
     - Auto-redirect to dashboard after 3 seconds

4. **Dashboard**
   - Should see welcome message: "Welcome, Priest!"
   - Should see navigation back to home

### Scenario 2: Test Error Handling

**Test Invalid Phone Number**
1. Enter mobile: `123` (less than 10 digits)
2. Click "Get OTP"
3. Expected: Error message "Please enter a valid 10-digit mobile number"

**Test Invalid OTP**
1. Enter mobile: `9876543210`
2. Click "Get OTP"
3. Wait for success alert
4. Enter OTP: `123456` (random wrong OTP)
5. Click "Verify OTP"
6. Expected: Error message from API (invalid OTP)

### Scenario 3: Test Browser Console Logs

Enable debug mode:
```
Edit .env:
VITE_DEBUG=true
```

Then check browser console (F12) for:
- Token generation requests
- OTP requests
- Response data
- Token expiry times

### Scenario 4: Test Token Persistence

1. Complete OTP flow successfully (reach dashboard)
2. Open browser DevTools → Application → LocalStorage
3. Look for key: `puja_connect_auth_token`
4. Should see JSON with `token` and `expiry` fields
5. Refresh page (F5)
6. Token should be retrieved from localStorage
7. User should still be on dashboard

### Scenario 5: Test Image Carousel

1. Go back to login screen
2. Wait and observe background images
3. Should see:
   - Image change every 5 seconds
   - Smooth fade transition between images
   - Dot indicators at bottom showing current image
   - Click dots to manually navigate

### Scenario 6: Test Responsive Design

Test on different screen sizes:

**Mobile (375px width)**
1. Resize browser to 375px
2. Verify:
   - Form inputs are readable
   - Buttons are touchable (48px+ height)
   - Text is not truncated
   - Images load properly

**Tablet (768px width)**
1. Resize browser to 768px
2. Verify layout adjustments

**Desktop (1024px+ width)**
1. Verify full layout with proper spacing

## API Testing

### Test Token Generation
```bash
curl -X POST http://115.187.62.16:8005/PujaConnectRestAPI/api/auth/generateToken \
  -H "Authorization: Basic YURtaW4jVG9rZW4kR2VOYVJhVGUyNjphZG1pbkAxMjM=" \
  -H "Content-Type: application/json"
```

### Test Send OTP
```bash
# First get token from previous command
TOKEN="your_token_here"

curl -X POST http://115.187.62.16:8005/PujaConnectRestAPI/api/auth/generate_otp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enc_data": "{\"mobile_number\":\"9876543210\"}"
  }'
```

### Test Verify OTP
```bash
TOKEN="your_token_here"

curl -X POST http://115.187.62.16:8005/PujaConnectRestAPI/api/auth/verify_otp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enc_data": "{\"mobile_number\":\"9876543210\",\"otp\":\"111111\"}"
  }'
```

## Common Test Data

**Valid Test Credentials:**
- Mobile: Any 10-digit number (e.g., `9876543210`)
- OTP: `111111` (default test OTP from API)

**Invalid Test Data:**
- Mobile: `123` (invalid length)
- OTP: `000000` (should fail verification)

## Debugging Checklist

- [ ] Clear browser cache and localStorage before testing
- [ ] Check that `.env` file has correct API_BASE_URL
- [ ] Verify API_BASE_URL is accessible (try in browser)
- [ ] Check browser console for JavaScript errors (F12)
- [ ] Check Network tab in DevTools for API requests/responses
- [ ] Verify token is being stored in localStorage
- [ ] Check if token expiry time is in the future
- [ ] Test with network throttling enabled (Chrome DevTools)

## Performance Metrics

Expected load times:
- Landing page: < 2 seconds
- Login page: < 1 second
- OTP send: 2-5 seconds (network dependent)
- OTP verify: 2-5 seconds (network dependent)
- Dashboard: < 1 second

## Issues & Solutions

### Issue: "Cannot GET /api/auth/generateToken"
- **Solution**: Check API_BASE_URL in .env file
- **Verify**: Test API endpoint manually with curl

### Issue: OTP not sending
- **Solution**: Ensure token is generated successfully first
- **Check**: Network tab to see actual request/response

### Issue: Carousel images not loading
- **Solution**: Ensure image files exist in `/public/images/temples/`
- **Files needed**: `Durga.png`, `Kali.png`, `Lakshmi.png`

### Issue: Tailwind styles not applying
- **Solution**: Run `npm run build` to verify compilation
- **Check**: Browser cache (Ctrl+Shift+Delete)

### Issue: Token not persisting
- **Solution**: Check localStorage permissions
- **Verify**: DevTools → Application → LocalStorage → check for token key

## Reporting Test Results

When reporting issues, include:
1. What step failed (e.g., "OTP send")
2. Expected vs actual behavior
3. Mobile number tested (sanitized)
4. Browser and OS
5. Network error (if any) from console
6. Response from API (from Network tab)
7. localStorage contents (if applicable)
