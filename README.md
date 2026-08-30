# CrustCraft - Premium Artisan Pizza Delivery Full-Stack Application

CrustCraft is a production-ready, feature-rich full-stack pizza delivery web application built from scratch. It features user registration with email token verification, JWT authentication, password recovery, an interactive custom pizza builder with live inventory checks, Razorpay test mode payment verification, Socket.IO live order tracking, and an extensive admin management panel with real-time analytics and automatic node-cron inventory low-stock alerts.

This project is submitted as a requirement for the **Oasis Infobyte Web Development Level 3 Internship Project**.

---

## 🚀 Key Features

### 🍕 Customer Features
1. **Registration & Verification**: Secure registration sending a verification token link via Nodemailer (using Ethereal/Mailtrap). Active account validation prevents logins before email verification.
2. **JWT Login & Auth**: Bulletproof route protection and JWT parsing securely stored on client and verified on the server.
3. **Password Recovery**: Secure forgot/reset password email loop with token expiry (1 hour) and hash updates.
4. **Curated Catalogue**: Browse popular items (Margherita, Pepperoni, Veggie Supreme, Farmhouse, Cheese Burst, Spicy Paneer, BBQ Chicken) with category filters (Veg/Non-Veg) and real-time search debouncing.
5. **Custom Pizza Builder**: Choose from:
   - **6 Crusts** (Thin, Thick, Cheese Burst, Pan, Wheat, Gluten-Free)
   - **6 Sauces** (Classic Tomato, BBQ, Spicy Peri Peri, Garlic Cream, Pesto, Buffalo)
   - **4 Cheeses** (Mozzarella, Cheddar, Parmesan, Gouda)
   - **10 Veg/Meat Toppings** (Mushrooms, Olives, Bell Peppers, Jalapeños, Corn, Onions, Pepperoni, Chicken, Tikka, Sausage)
   - Live price updates with backend price recalculation and stock validation.
6. **Robust Cart & Checkout**: Interactive quantity adjustments, GST tax (18%) and subtotal calculation, delivery addresses, and payment integration.
7. **Razorpay TEST MODE Payment**: Complete mock checkout using Razorpay Checkout SDK. The backend verifies signature using SHA-256 HMAC for secure order completion.
8. **Real-time Order Tracking**: Live tracking dashboard connecting to Socket.IO. Shows order journey timeline from *Order Received* ➔ *In Kitchen* ➔ *Sent to Delivery* ➔ *Delivered*.

### ⚙️ Admin Features
1. **Secure Admin Account**: Initialized securely via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) using a seed script.
2. **Dashboard Analytics**: Real-time stats widgets displaying Total Revenue, Total Orders, Pending Orders, Completed Orders, and Low Stock Alerts count.
3. **Inventory Management**: View list of ingredients, adjust stock counts inline (+5 / -5 / edit details), set custom low-stock thresholds, and compute custom pizza additions.
4. **Order Live Management**: List incoming orders, view items, addresses, payment status, and change tracking status via dropdown, immediately triggering live updates to clients.
5. **Low Stock Cron Alerting**: Node-cron runs a job every 30 minutes. If stock drops below threshold, Nodemailer sends a structured HTML notification to the admin with restock suggestions, automatically deduplicated once per 12 hours.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Socket.IO client, Lucide Icons, Vanilla CSS3 (Custom Design System with dark glassmorphism).
- **Backend**: Node.js, Express.js, Socket.IO, node-cron, Nodemailer, Razorpay SDK, bcryptjs, jsonwebtoken.
- **Database**: MongoDB, Mongoose (with automated **MongoMemoryServer** fallback for zero-setup execution).

---

## 📂 Project Structure

```
OIBSIP/
└── WebDev-L3-PizzaDelivery/
    ├── client/                 # React Frontend
    │   ├── dist/               # Production Build Output
    │   ├── src/
    │   │   ├── assets/         # App icons & SVGs
    │   │   ├── components/     # Reusable modules (Common, Pizza, Cart, Order, Admin)
    │   │   ├── context/        # Auth, Cart, Socket, Toast contexts
    │   │   ├── hooks/          # React hooks consumption wrappers
    │   │   ├── layouts/        # Main & Admin layout wrappers
    │   │   ├── pages/          # 19 pages representing client routing
    │   │   ├── services/       # Axios API layer calls
    │   │   └── utils/          # Formatting & validation helper functions
    │   ├── package.json
    │   └── vite.config.js
    ├── server/                 # Express Backend API
    │   ├── src/
    │   │   ├── config/         # Database, Nodemailer, Razorpay connections
    │   │   ├── controllers/    # API controllers
    │   │   ├── middleware/     # Auth, admin, error handlers, rate-limiters
    │   │   ├── models/         # Mongoose User, Pizza, Inventory, Order models
    │   │   ├── routes/         # Express endpoint routing
    │   │   ├── services/       # Inventory, Email, and Payment sub-services
    │   │   ├── jobs/           # cron job schedules
    │   │   ├── sockets/        # Socket.IO handlers
    │   │   ├── utils/          # Tokens, custom errors helper
    │   │   ├── validators/     # Registration/Order inputs schema validator
    │   │   └── seed/           # Seeding setup
    │   ├── package.json
    │   └── server.js
    └── README.md
```

---

## 🔑 Environment Variables

To configure and run the application, copy the example variables in the server project root:

```bash
# Create a .env file inside server directory
cd server
copy .env.example .env
```

### Options (`server/.env`):
- `PORT` (Default: `5000`): Port for the API server.
- `MONGODB_URI`: Connection string (e.g. `mongodb://localhost:27017/crustcraft`). If left blank, server falls back to an in-memory MongoMemoryServer database.
- `JWT_SECRET`: Random hash to sign tokens.
- `JWT_EXPIRES_IN` (Default: `7d`): Lifetime of tokens.
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: Credentials for administrative access.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: Test keys generated in Razorpay Dashboard.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: SMTP credentials. If left blank, server uses an auto-generated Ethereal test inbox.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (version 16 or higher)
- npm (installed with Node)

### 2. Installation
Install dependencies for both folders:
```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 3. Running the Application
The backend features an auto-seeding routine that runs on startup if it detects an empty database. It will seed the Admin user, basic pizzas, and customize items.

```bash
# Run Backend API Server (starts on http://localhost:5000)
cd server
npm start

# Run Frontend React Client (starts on http://localhost:5173)
cd ../client
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Admin Credentials (Seeded by default)
- **Email**: `admin@crustcraft.com`
- **Password**: `Admin@123456`

---

## 💳 Razorpay Test Mode Setup

To test payment checkouts:
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com) (sign up for a free sandbox/testing account).
2. Go to **Settings** ➔ **API Keys** ➔ **Generate Key** (make sure you are in **Test Mode**).
3. Copy the `Key ID` and `Key Secret` into your `server/.env`.
4. Run the checkout process. When the Razorpay modal opens, use the following card details:
   - **Card Number**: `4111 1111 1111 1111` (Razorpay Test Visa Card)
   - **Expiry**: Any future date (e.g., `12/30`)
   - **CVV**: Any 3 digits (e.g. `123`)
   - **OTP**: Any 6 digits (e.g. `123456` or click "Success" on Razorpay screen)

---

## ✉️ Email Test Setup (Ethereal / Mailtrap)

By default, if you don't provide SMTP credentials in `server/.env`, the server dynamically runs:
```javascript
nodemailer.createTestAccount();
```
This spins up a mock **Ethereal Mail** inbox. When verification/password-reset emails or low stock cron notifications are sent, the server console prints a URL:
`✉️ Email sent. Preview URL: https://ethereal.email/message/...`
You can click this link to view the fully rendered HTML verification email directly in your browser.

To use **Mailtrap**:
1. Log in to [Mailtrap](https://mailtrap.io).
2. In **Email Testing** ➔ **Inboxes** ➔ **SMTP Settings**, copy host, port, user, and password into `server/.env`.
3. Check the inbox for incoming logs.

---

## 📝 API Endpoints Summary

### Auth (`/api/auth`)
- `POST /register`: Registers user & sends verification mail.
- `GET /verify-email`: Verifies account using token.
- `POST /login`: Logs in user & issues JWT.
- `POST /forgot-password`: Generates reset token & sends email.
- `POST /reset-password`: Resets password using valid token.

### User (`/api/users`)
- `GET /me`: Returns currently logged in user info.
- `PUT /me`: Updates user name/address.

### Pizzas (`/api/pizzas`)
- `GET /`: Returns pizza catalog (supports category/search queries).
- `GET /custom-options`: Returns categorized inventory items for customization.
- `GET /:id`: Returns single pizza.

### Orders (`/api/orders`)
- `POST /`: Places pending order after checking stock.
- `GET /`: Returns customer's orders history.
- `GET /:id`: Returns single order.

### Payments (`/api/payments`)
- `POST /create-order`: Requests Razorpay order creation.
- `POST /verify`: Verifies Razorpay SHA256 signature, updates order status to "PAID", and deducts inventory.

### Admin (`/api/admin`)
- `POST /login`: Administrative login.
- `GET /dashboard`: Fetches global dashboard stats.
- `GET /orders`: Returns all customer orders.
- `PUT /orders/:id/status`: Mutates tracking state & triggers Socket.IO live alerts.
- `GET /inventory`: Lists ingredient stocks.
- `POST /inventory`: Adds new stock item.
- `PUT /inventory/:id`: Edits stock quantity/threshold.
- `DELETE /inventory/:id`: Removes ingredient from database.

---

## 👤 Author & Attribution
Built as part of Oasis Infobyte Web Development Internship (Level 3 - Task 1). Submitted for evaluation.
