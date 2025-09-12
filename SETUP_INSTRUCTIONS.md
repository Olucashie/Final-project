# Hostel Finder - Setup Instructions

## New Features Implemented

### 1. Loading States
- Added loading spinners to signin and signup buttons
- Visual feedback during authentication processes

### 2. Email Verification System
- Users must verify their email before logging in
- 6-digit verification codes sent via email
- 10-minute expiration for verification codes
- Resend verification code functionality

### 3. Enhanced Agent Registration
- CAC URL validation for agent registration
- Hostel document verification requirements
- Contact information fields (WhatsApp, Telegram)
- URL validation for all document links

### 4. Improved Property Details
- Shows actual hostel information instead of placeholder data
- Displays price, bedrooms, bathrooms, location, amenities
- Verification status indicator
- Multiple contact methods for owners

### 5. Contact Integration
- WhatsApp integration for direct messaging
- Telegram integration for direct messaging
- Phone call functionality
- Email contact form

## Backend Setup

### 1. Install Dependencies
```bash
cd api
npm install nodemailer crypto
```

### 2. Environment Variables
Create a `.env` file in the `api` directory with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/hostel-finder

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES=7d

# Email Configuration (Gmail example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=5000
NODE_ENV=development

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Email Setup (Optional)
**For Development (No Email Setup Required):**
- Verification codes will be displayed in the console/terminal
- No email configuration needed for testing

**For Production (Gmail Setup):**
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in EMAIL_PASS
3. Set environment variables:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### 4. Start the Backend
```bash
cd api
npm run dev
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Start the Frontend
```bash
cd client
npm run dev
```

## New API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email verification
- `POST /api/auth/login` - Login (requires email verification)
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/resend-verification` - Resend verification code

### Hostels
- `GET /api/hostels/:id` - Get hostel details with contact info
- `POST /api/hostels` - Create hostel with verification documents

## Database Schema Updates

### User Model
- Added email verification fields
- Added contact information (WhatsApp, Telegram)
- Added verification status fields

### Hostel Model
- Added verification status
- Added contact information per hostel
- Added verification documents array

## Features Overview

### For Students
- Browse verified hostels
- View detailed property information
- Contact owners via multiple channels
- See verification status of properties

### For Agents
- Register with CAC verification
- Add hostels with document verification
- Provide multiple contact methods
- Track verification status

### For Admins
- Manage user verifications
- Approve hostel listings
- Monitor system activity

## Security Features
- Email verification required for all users
- URL validation for all external links
- Document verification for agents
- JWT-based authentication
- Input validation and sanitization

## Contact Methods Supported
- Phone calls
- WhatsApp messaging
- Telegram messaging
- Email contact forms
- In-app messaging system

## Verification Process
1. User registers with email
2. Verification code sent to email
3. User enters code to verify email
4. Agent provides CAC and hostel documents
5. Admin reviews and approves listings
6. Verified properties show verification badge
