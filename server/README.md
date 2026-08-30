# CrustCraft - Backend API Server

This is the Node.js/Express backend server for CrustCraft, incorporating MongoDB, Mongoose, Socket.IO, node-cron, and Razorpay integrations.

---

## 🛠️ Tech Stack & Services

- **Server Runtime**: Node.js + Express.js
- **Database**: MongoDB (with automated `mongodb-memory-server` local fallback)
- **Real-Time API**: Socket.IO for status updates in user/order rooms (`user:${userId}`, `order:${orderId}`)
- **Security Check**: JWT (jsonwebtoken) and password hashing via `bcryptjs`
- **Rate-Limiter**: express-rate-limit to protect endpoints from DDoS
- **Cron Jobs**: node-cron (runs every 30 minutes, checks inventory, sends low-stock email alert)
- **Payment Verification**: Razorpay SDK signature validation via HMAC SHA256

---

## 🚀 Getting Started

### 1. Installation
Install server dependencies:
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in custom settings.
If `MONGODB_URI` is left blank, the server automatically boots an in-memory MongoMemoryServer database, allowing immediate running without a local MongoDB service.

### 3. Run Development Server
Runs with `nodemon` for auto-reloading:
```bash
npm run dev
```

### 4. Run Production Server
```bash
npm start
```

### 5. Seeding DB Manually
(Note: Seeding runs automatically on startup if the database has 0 pizzas). To force seed:
```bash
npm run seed
```

---

## 💳 Razorpay Test Mode Setup

To enable payments checkout:
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com) and switch to **Test Mode** (sandbox).
2. Go to **Settings** ➔ **API Keys** ➔ **Generate Key**.
3. Save `Key ID` and `Key Secret` into `server/.env` as:
   - `RAZORPAY_KEY_ID=rzp_test_...`
   - `RAZORPAY_KEY_SECRET=...`
4. The client uses Visa Test Cards (e.g. `4111 1111 1111 1111`) to submit mock transactions. The backend verifies HMAC signature hashes using the key secret to confirm order payment status as `PAID`.

---

## ✉️ Nodemailer Ethereal Testing

If SMTP environment variables are left blank in `.env`, the server automatically initializes an **Ethereal Mail** test account. Ethereal is a mock SMTP service that catches outgoing emails.
- When an email is dispatched (registration token link, forgot password reset link, low stock alert), check the server console.
- It will print a URL like:
  `✉️ Email sent. Preview URL: https://ethereal.email/message/UX68A34...`
- Click the URL to inspect the fully-designed HTML email in your browser.
- This allows testing the registration verification flow, password resets, and low stock cron alerts out-of-the-box without configuring real email accounts.
