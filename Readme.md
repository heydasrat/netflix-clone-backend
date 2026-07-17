# 🔐 Advanced Authentication System

A secure and scalable authentication REST API built with **Node.js**, **Express.js**, and **MongoDB**.

This project implements a complete JWT-based authentication system with email OTP verification, refresh token authentication, password recovery, profile management, and secure user account management following modern backend development practices.

---

## ✨ Features

- User Registration
- Email OTP Verification
- Secure Login
- Logout
- JWT Access Token Authentication
- Refresh Token Authentication
- Forgot Password
- OTP Verification for Password Reset
- Reset Password
- Change Password
- Change Email
- Update User Details
- Upload & Update Profile Image
- Password Hashing with bcrypt
- Secure HTTP-only Cookies
- Cloudinary Image Upload
- Environment Variable Validation
- Modular Project Structure
- Centralized Error Handling

---

## 🛠️ Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication

- JWT (Access & Refresh Tokens)
- bcrypt
- Cookie Parser

### File Upload

- Multer
- Cloudinary

### Email Service

- Nodemailer
- Gmail SMTP

### Other Packages

- dotenv
- cors
- nodemon

---

## 📂 Project Structure

```
src/
│
├── config/
├── controllers/
├── database/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── validations/
└── index.js
```

---

## ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/your-username/advanced-auth-system.git
```

Move into the project

```bash
cd advanced-auth-system
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=
MONGODB_URI=
CORS_ORIGIN=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=

RESET_TOKEN_SECRET=
RESET_TOKEN_EXPIRY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_USER_ACCOUNT=
```

Run the server

```bash
npm run dev
```

---

## 🔑 Authentication Flow

### Registration

```
Register
      ↓
Generate OTP
      ↓
Send Email
      ↓
Verify OTP
      ↓
Account Verified
```

---

### Login

```
Login
   ↓
Verify Credentials
   ↓
Generate Access Token
Generate Refresh Token
   ↓
Store Refresh Token
   ↓
Authenticated
```

---

### Password Reset

```
Forgot Password
        ↓
Generate OTP
        ↓
Send Email
        ↓
Verify OTP
        ↓
Reset Password
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register` | Register User |
| POST | `/verify-otp` | Verify Registration OTP |
| POST | `/login` | Login User |
| POST | `/logout` | Logout User |
| POST | `/refresh-token` | Generate New Access Token |
| POST | `/forget-password` | Send Password Reset OTP |
| POST | `/verify-otp-to-reset-password` | Verify Reset OTP |
| PATCH | `/reset-password` | Reset Password |
| PATCH | `/change-password` | Change Password |
| PATCH | `/change-email` | Change Email |
| PATCH | `/change-user-details` | Update User Details |
| PATCH | `/update-profile-image` | Upload Profile Image |

---

## 🔒 Security Features

- JWT Authentication
- Refresh Token Mechanism
- Password Hashing using bcrypt
- HTTP-only Cookies
- OTP Email Verification
- Secure Password Reset Flow
- Environment Variable Validation
- Centralized Error Handling

---

## 🚀 Future Improvements

- Google OAuth
- GitHub OAuth
- Two-Factor Authentication (2FA)
- Role-Based Access Control (RBAC)
- Session Management
- Login History
- Rate Limiting
- Email Change Verification
- Account Locking
- Docker Support
- Unit & Integration Testing
- Swagger API Documentation

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Developed by **Dasrat**

If you found this project helpful, consider giving it a ⭐.