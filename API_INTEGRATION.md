# PujaConnect API Integration Guide

## Overview

This guide explains how the PujaConnect application integrates with the backend API for authentication and OTP verification.

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Base URL
VITE_API_BASE_URL=http://115.187.62.16:8005/PujaConnectRestAPI/api

# Authorization Header for token generation
VITE_AUTH_HEADER=Basic YURtaW4jVG9rZW4kR2VOYVJhVGUyNjphZG1pbkAxMjM=

# LocalStorage key for storing tokens
VITE_TOKEN_STORAGE_KEY=puja_connect_auth_token

# Enable debug logging
VITE_DEBUG=false
```

### Configuration Files

- **`src/config/apiConfig.ts`** - Main API configuration
- **`src/services/authService.ts`** - Authentication service with token and OTP management

## API Flow

### 1. Token Generation

**Endpoint:** `POST /auth/generateToken`

**Headers:**
```
Authorization: Basic YURtaW4jVG9rZW4kR2VOYVJhVGUyNjphZG1pbkAxMjM=
Content-Type: application/json
```

**Response:**
```json
{
  "version": "1.0",
  "status": 0,
  "message": "Token generated successfully",
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiJ9...",
    "created_at": "2026-01-22 03:10:41",
    "expires_at": "2026-01-23 03:10:41"
  }
}
```

**Token Management:**
- Tokens are automatically generated when needed
- Tokens are cached in localStorage
- Automatic refresh when token expires
- Automatic token validation before API calls

### 2. Send OTP

**Endpoint:** `POST /auth/generate_otp`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: */*
```

**Request Body:**
```json
{
  "enc_data": "{\"mobile_number\":\"7980544903\"}"
}
```

**Response:**
```json
{
  "version": "1.0",
  "status": 0,
  "message": "OTP sent successfully",
  "data": "{\"user_name\":\"7980544903\",\"user_otp\":\"111111\"}"
}
```

**Usage in Code:**
```typescript
import { authService } from '../services/authService';

// Send OTP to phone number
try {
  const response = await authService.sendOTP('7980544903');
  console.log('OTP sent successfully');
} catch (error) {
  console.error('Failed to send OTP:', error);
}
```

### 3. Verify OTP

**Endpoint:** `POST /auth/verify_otp`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: */*
```

**Request Body:**
```json
{
  "enc_data": "{\"mobile_number\":\"7980544903\",\"otp\":\"111111\"}"
}
```

**Usage in Code:**
```typescript
import { authService } from '../services/authService';

// Verify OTP
try {
  const response = await authService.verifyOTP('7980544903', '111111');
  console.log('OTP verified successfully');
} catch (error) {
  console.error('Failed to verify OTP:', error);
}
```

### 4. Validate OTP (Get User Details)

**Endpoint:** `POST /auth/validate_otp`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: */*
```

**Request Body:**
```json
{
  "enc_data": "{\"mobile_number\":\"7980544903\",\"otp\":\"111111\"}"
}
```

**Response:**
```json
{
  "version": "1.0",
  "status": 0,
  "message": "OTP validated successfully",
  "data": "{\"user_id\":2,\"user_name\":\"7980544903\",\"user_type_id\":50,\"user_full_name\":\"Indranil\"}"
}
```

**Usage in Code:**
```typescript
import { authService, UserData } from '../services/authService';

// Validate OTP and get user details
try {
  const { userData, response } = await authService.validateOTP('7980544903', '111111');
  console.log('User ID:', userData.user_id);
  console.log('User Name:', userData.user_full_name);
  console.log('User Type:', userData.user_type_id);
  
  // Save user data for later use
  localStorage.setItem('puja_connect_user', JSON.stringify(userData));
} catch (error) {
  console.error('Failed to validate OTP:', error);
}
```

## AuthService Methods

### `generateToken(): Promise<string>`
Generates a new authentication token and stores it.

```typescript
const token = await authService.generateToken();
```

### `getValidToken(): Promise<string>`
Returns a valid token, refreshing if necessary.

```typescript
const token = await authService.getValidToken();
```

### `sendOTP(mobileNumber: string): Promise<OTPResponse>`
Sends OTP to the given mobile number.

```typescript
const response = await authService.sendOTP('7980544903');
```

### `verifyOTP(mobileNumber: string, otp: string): Promise<any>`
Verifies the OTP for the given mobile number.

```typescript
const response = await authService.verifyOTP('7980544903', '111111');
```

### `validateOTP(mobileNumber: string, otp: string): Promise<{ userData: UserData; response: ValidateOTPResponse }>`
Validates OTP and returns user details. **Use this method for login flow instead of verifyOTP.**

```typescript
const { userData, response } = await authService.validateOTP('7980544903', '111111');
// userData contains: user_id, user_name, user_type_id, user_full_name
localStorage.setItem('puja_connect_user', JSON.stringify(userData));
```

### `isTokenValid(): boolean`
Checks if the current token is valid.

```typescript
if (authService.isTokenValid()) {
  // Token is valid
}
```

### `getToken(): string | null`
Returns the current token or null if not available.

```typescript
const token = authService.getToken();
```

### `clearToken(): void`
Clears the token from storage and memory.

```typescript
authService.clearToken();
```

## Token Storage

Tokens are automatically stored in localStorage with the following structure:

```json
{
  "token": "eyJhbGciOiJSUzI1NiJ9...",
  "expiry": 1769161241000
}
```

The key used for storage is configurable via `VITE_TOKEN_STORAGE_KEY`.

## User Data Storage

After successful OTP validation, user data is stored in localStorage:

```json
{
  "user_id": 2,
  "user_name": "7980544903",
  "user_type_id": 50,
  "user_full_name": "Indranil"
}
```

The key used for storage is: `puja_connect_user`

## TypeScript Interfaces

### `UserData`
```typescript
interface UserData {
  user_id: number;
  user_name: string;
  user_type_id: number;
  user_full_name: string;
}
```

### `TokenResponse`
```typescript
interface TokenResponse {
  version: string;
  status: number;
  message: string;
  data: {
    access_token: string;
    created_at: string;
    expires_at: string;
  };
}
```

### `OTPResponse`
```typescript
interface OTPResponse {
  version: string;
  status: number;
  message: string;
  data: string; // JSON string with user_name and user_otp
}
```

### `ValidateOTPResponse`
```typescript
interface ValidateOTPResponse {
  version: string;
  status: number;
  message: string;
  data: string; // JSON string with user_id, user_name, user_type_id, user_full_name
}
```

## Error Handling

All API calls include error handling. Errors are caught and logged with meaningful messages:

```typescript
try {
  await authService.sendOTP('7980544903');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Unknown error');
}
```

## Debugging

Enable debug mode by setting `VITE_DEBUG=true` in your `.env` file to see detailed API logs.

```env
VITE_DEBUG=true
```

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage. Consider using a more secure storage method in production.
2. **HTTPS**: Always use HTTPS in production.
3. **Token Expiry**: Tokens automatically refresh before expiry.
4. **Mobile Number Validation**: Mobile numbers are validated before API calls.
5. **OTP Validation**: OTP length is validated (6 digits).

## Future Enhancements

- [ ] Implement proper data encryption for API requests
- [ ] Add refresh token support
- [ ] Implement biometric authentication
- [ ] Add SMS rate limiting
- [ ] Implement device fingerprinting
- [ ] Add call-based OTP fallback

## Troubleshooting

### Token Not Generating
1. Check if API_BASE_URL is correct
2. Check if AUTH_HEADER is correct
3. Verify network connectivity
4. Check browser console for detailed errors

### OTP Not Sending
1. Ensure token is valid
2. Verify mobile number format (10 digits)
3. Check if user has exceeded OTP request limit
4. Verify API endpoint is correct

### OTP Verification Fails
1. Check if OTP is exactly 6 digits
2. Verify OTP hasn't expired
3. Check if mobile number matches the one OTP was sent to
4. Check token validity
