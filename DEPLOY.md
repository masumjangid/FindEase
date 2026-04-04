# Deploy FindEase

Deploy the **backend** first, then the **frontend**, and connect them with environment variables.

---

## 1. Push your code to GitHub

If you haven’t already:

```bash
cd N:\Findease
git init
git add .
git commit -m "FindEase initial"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub repo URL.

---

## 2. Deploy backend (Render)

1. Go to [render.com](https://render.com) and sign in (GitHub is fine).
2. **New** → **Web Service**.
3. Connect your GitHub account and select the FindEase repo.
4. Configure:
   - **Name:** `findease-api` (or any name).
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **Environment** (Add Environment Variable):
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a long random string (e.g. generate one)
   - `CLIENT_ORIGIN` = leave empty for now; you’ll set it after deploying the frontend (e.g. `https://your-app.vercel.app`)
   - `ADMIN_EMAIL` = `admin@poornima.edu.in` (or your choice)
   - `ADMIN_PASSWORD` = your chosen admin password
6. Click **Create Web Service**. Wait until the service is **Live**.
7. Copy the service URL, e.g. `https://findease-api.onrender.com` — this is your **API URL**.

---

## 3. Deploy frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub is fine).
2. **Add New** → **Project** → import your FindEase repo.
3. Configure:
   - **Root Directory:** `client` (click Edit, set to `client`)
   - **Framework Preset:** Vite (should be auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables** (add before deploying):
   - **Name:** `VITE_API_URL`
   - **Value:** your Render API URL from step 2, e.g. `https://findease-api.onrender.com`
5. Click **Deploy**. Wait until the deployment is done.
6. Copy your frontend URL, e.g. `https://findease-xxx.vercel.app`.

---

## 4. Connect frontend to backend (CORS)

1. In **Render** → your `findease-api` service → **Environment**.
2. Set **CLIENT_ORIGIN** to your Vercel URL, e.g. `https://findease-xxx.vercel.app` (no trailing slash).
   - To allow multiple origins, use a comma: `https://app1.vercel.app,https://app2.vercel.app`
3. **Save Changes**. Render will redeploy automatically.

---

## 5. MongoDB Atlas (network access)

If the backend can’t connect to MongoDB:

1. Open [MongoDB Atlas](https://cloud.mongodb.com) → your project → **Network Access**.
2. **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) so Render’s servers can connect.
3. Save.

---

## Summary

| What        | URL / value |
|------------|-------------|
| Frontend   | `https://your-project.vercel.app` |
| Backend API| `https://findease-api.onrender.com` |
| `VITE_API_URL` (Vercel) | Backend URL above |
| `CLIENT_ORIGIN` (Render) | Frontend URL above |
| `MONGODB_URI` (Render) | Your Atlas connection string |

After deployment, open the Vercel URL and use **Sign up** / **Log in** with an `@poornima.edu.in` email. The admin user is created on first backend start (use `ADMIN_EMAIL` and `ADMIN_PASSWORD` from Render env).

---

## Optional: deploy with Render Blueprint

If you use [Render Blueprint](https://render.com/docs/blueprint-spec), the repo’s `render.yaml` defines the backend service. When creating a new Blueprint, add `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, and `ADMIN_PASSWORD` in the Render dashboard for that service.
