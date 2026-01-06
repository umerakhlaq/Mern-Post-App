# 🚀 Deployment Guide

Follow these steps to deploy your PostApp for free.

## 1. Prepare Database (MongoDB Atlas)
*If you already have a MongoDB URL, skip this.*

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in.
2.  Create a **Cluster** (Free Tier).
3.  In **Network Access**, add IP Address `0.0.0.0/0` (Allows access from anywhere).
4.  In **Database Access**, create a user (remember username & password).
5.  Click **Connect** -> **Drivers** -> Copy the connection string.
    *   It looks like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`

---

## 2. Deploy Backend (Render)

1.  Push your code to **GitHub**.
2.  Go to [Render.com](https://render.com/) and create a **Web Service**.
3.  Connect your GitHub repository.
4.  **Root Directory**: `backend` (Important!)
5.  **Build Command**: `npm install`
6.  **Start Command**: `node src/app.js`
7.  **Environment Variables (Add these):**
    *   `MONGO_URI`: (Paste your MongoDB connection string here)
    *   `JWT_SECRET`: (Any secret text, e.g., `mysecretkey123`)
    *   `FRONTEND_URL`: (Leave empty for now, we will update it later)
8.  Click **Deploy**.
9.  Once deployed, Copy the **Backend URL** (e.g., `https://postapp-backend.onrender.com`).

---

## 3. Deploy Frontend (Vercel)

1.  Go to [Vercel.com](https://vercel.com/) and log in.
2.  Click **Add New Project**.
3.  Select your GitHub repository.
4.  **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables:**
    *   `VITE_API_URL`: (Paste your **Render Backend URL** here, e.g., `https://postapp-backend.onrender.com`)
6.  Click **Deploy**.
7.  Once deployed, Vercel will give you a **Frontend URL** (e.g., `https://postapp-frontend.vercel.app`).

---

## 4. Final Connection

1.  Go back to **Render** (Backend).
2.  Go to **Environment Variables**.
3.  Add/Update `FRONTEND_URL` with your **Vercel Frontend URL** (e.g., `https://postapp-frontend.vercel.app`).
    *   *Note: Do not add a trailing slash `/` at the end.*
4.  Save changes. Render will restart the server.

**🎉 Done! Your app is now live!**
