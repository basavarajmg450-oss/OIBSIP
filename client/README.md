# CrustCraft - React Frontend Client

This is the frontend React client for CrustCraft, powered by Vite.

---

## 🛠️ Tech Stack & Features

- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Real-Time**: Socket.IO client (auto-reconnects on auth, joins user/order rooms)
- **Styling**: Pure CSS3 (comprehensive dark theme glassmorphism design system)
- **State Management**: React Context API (`AuthContext`, `CartContext`, `SocketContext`, `ToastContext`)
- **API Call Handler**: Axios instance with JWT interceptors (handles auto-redirects on 401s)
- **Payment**: Embedded Razorpay Checkout Widget

---

## 🚀 Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Development Mode
Start Vite dev server (runs on `http://localhost:5173` with proxy configuration routing `/api` and `/socket.io` requests to the backend server on port 5000):
```bash
npm run dev
```

### 3. Production Build
Compile optimized assets to `dist/`:
```bash
npm run build
```

Preview production build locally:
```bash
npm run preview
```

---

## ⚙️ Configuration (`vite.config.js`)

Vite is preconfigured with a dev proxy server:
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    },
    '/socket.io': {
      target: 'http://localhost:5000',
      ws: true
    }
  }
}
```
This avoids CORS issues during development, allowing the client to call API endpoints using relative paths (e.g. `/api/auth/login`).
