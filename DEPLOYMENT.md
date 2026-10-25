# 🌐 EcoPulse Public Web Link & Deployment Guide

## 1. 🚀 Active Live Public Link (Instant Access)

The application is currently live and tunneled securely through Cloudflare's Global Edge Network:

### 👉 **Live Web Link**: [https://throughout-ridge-proposals-magazine.trycloudflare.com](https://throughout-ridge-proposals-magazine.trycloudflare.com)

- **Works Across All Platforms**: iOS, Android, macOS, Windows, Linux, Tablets.
- **Works on Any Network**: Any Wi-Fi, 4G, 5G cellular network worldwide without port-forwarding or local restrictions.
- **SSL / HTTPS Encrypted**: Full Cloudflare TLS certificate (`https://`).
- **Full-Stack Integrated**: Both the React 19 Frontend and the FastAPI Backend are connected and operational.

---

## 2. ☁️ Permanent 24/7 Cloud Deployment (Never Shuts Down)

Because a local tunnel depends on this Mac remaining awake, the repository is already pre-configured for **100% permanent cloud deployment** on free cloud hosts.

The codebase is hosted at: **[https://github.com/panchmisareen/HACKATHON](https://github.com/panchmisareen/HACKATHON)**

### Option A: Render.com (Recommended Free Cloud Hosting)
1. Go to [https://render.com](https://render.com) and sign in with GitHub.
2. Click **New +** > **Blueprint**.
3. Select the `panchmisareen/HACKATHON` repository.
4. Render will automatically detect the [`render.yaml`](./render.yaml) file and provision:
   - **`ecopulse-backend`** (FastAPI Python web service on `https://ecopulse-backend.onrender.com`)
   - **`ecopulse-frontend`** (React Vite static site on `https://ecopulse-web.onrender.com`)
5. Click **Apply**. Within ~2 minutes, your permanent `.onrender.com` link is live 24/7 forever.

### Option B: Vercel (1-Click Frontend Deployment)
1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** > **Project**.
3. Select `panchmisareen/HACKATHON`.
4. Set **Root Directory** to `frontend`.
5. Under **Environment Variables**, set:
   - `VITE_API_URL` = your live backend URL (or the active Cloudflare tunnel URL).
6. Click **Deploy**. Your permanent `https://<your-project>.vercel.app` domain is issued instantly.

---

## 3. 🧪 Verification & Health Check
- Health check endpoint: `https://throughout-ridge-proposals-magazine.trycloudflare.com/api/health`
- Thrift Club: `https://throughout-ridge-proposals-magazine.trycloudflare.com/app/thrift`
- Login & Register: `https://throughout-ridge-proposals-magazine.trycloudflare.com/login`
- Carbon Engine: `https://throughout-ridge-proposals-magazine.trycloudflare.com/app/calculator`
