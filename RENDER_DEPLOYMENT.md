# Deploying Room Booker to Render

Render is a modern cloud platform with a free tier. This guide will get your app live in ~15 minutes.

## Step 1: Prepare Your Repository

### 1.1 Create/Update `backend/requirements.txt`

Ensure gunicorn is included for production:

```bash
cd /home/aboby/room-booker-simplified/backend
cat requirements.txt
```

If `gunicorn` is not listed, add it.

### 1.2 Update `backend/.env` for Production

Set strong values:

```bash
# Generate a strong SECRET_KEY
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"

# Then update backend/.env with:
DATABASE_URL=postgresql://user:password@your-db.render.com/roomdb
SECRET_KEY=<generated-key-above>
MAIL_USERNAME=valentineagaba16@gmail.com
MAIL_PASSWORD=<your-gmail-app-password>
MAIL_FROM=valentineagaba16@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_TLS=True
```

### 1.3 Build Frontend

```bash
cd /home/aboby/room-booker-simplified
npm install
npm run build
```

This creates a `dist/` folder with your static frontend.

### 1.4 Push to GitHub

```bash
git add .
git commit -m "prep: prepare for Render deployment"
git push origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create PostgreSQL Database on Render

1. Go to [render.com](https://render.com) and sign up
2. Click **New +** → **PostgreSQL**
3. Fill in:
   - **Name**: `room-booker-db`
   - **Database**: `roomdb`
   - **User**: `roomdb`
   - **Region**: Choose closest to you
   - **Plan**: Free tier (for testing)
4. Click **Create Database**
5. Copy the **Internal Database URL** (you'll need this)
   - Format: `postgresql://user:password@host:5432/roomdb`

### 2.2 Create Web Service for Backend

1. Click **New +** → **Web Service**
2. Select **Deploy from a Git repository**
3. Connect your GitHub account and select `room-booker-simplified`
4. Fill in:
   - **Name**: `room-booker-api`
   - **Environment**: `Python 3`
   - **Region**: Same as database (important!)
   - **Branch**: `main`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT main:app`
   - **Plan**: Free (or Starter)

5. Click **Advanced** and add environment variables:
   ```
   DATABASE_URL = postgresql://user:password@host:5432/roomdb
   SECRET_KEY = <generated-key-from-step-1>
   MAIL_USERNAME = valentineagaba16@gmail.com
   MAIL_PASSWORD = <your-gmail-app-password>
   MAIL_FROM = valentineagaba16@gmail.com
   MAIL_SERVER = smtp.gmail.com
   MAIL_PORT = 587
   MAIL_TLS = True
   ```

6. Click **Create Web Service**
7. Wait for deployment to complete (2-3 minutes)
8. Your API will be at: `https://room-booker-api.onrender.com`

### 2.3 Initialize Admin User

Once deployed, create your admin account:

```bash
# Get your API URL from Render dashboard
API_URL="https://room-booker-api.onrender.com"

curl -X POST "$API_URL/api/admin/init" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "valentineagaba16@gmail.com",
    "password": "YourSecurePassword123"
  }'
```

You should get: `"Admin created successfully"`

---

## Step 3: Deploy Frontend to Render (Static Site)

### 3.1 Create Static Site on Render

1. Click **New +** → **Static Site**
2. Connect your GitHub repo
3. Fill in:
   - **Name**: `room-booker-web`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. Click **Create Static Site**
5. Wait for deployment (2-3 minutes)
6. Your frontend will be at: `https://room-booker-web.onrender.com`

---

## Step 4: Connect Frontend to Backend

### 4.1 Update Frontend Environment

1. In VS Code, update `.env.local`:
   ```
   VITE_BACKEND_URL=https://room-booker-api.onrender.com
   ```

2. Commit and push:
   ```bash
   git add .env.local
   git commit -m "config: update backend URL for Render"
   git push origin main
   ```

3. Render will auto-redeploy your frontend

### 4.2 Test Your App

Visit: `https://room-booker-web.onrender.com`

- Try booking a room
- Try contact form
- Login as admin with your created account

---

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain to Frontend

1. In Render dashboard, select your static site
2. Go to **Settings** → **Custom Domains**
3. Add your domain
4. Update DNS:
   - Add CNAME: `room-booker-web.onrender.com`

### 5.2 Add Domain to Backend API

1. In Render dashboard, select your web service
2. Go to **Settings** → **Custom Domains**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Update DNS similarly

---

## Troubleshooting

### Issue: "Module not found" error

**Solution**: Ensure `backend/requirements.txt` includes all dependencies:
```bash
cd backend
pip freeze > requirements.txt
git push
```

### Issue: Database connection error

**Solution**: 
1. Go to PostgreSQL database on Render
2. Copy the **Internal Database URL**
3. Update environment variable `DATABASE_URL` in web service
4. Redeploy

### Issue: Email not sending

**Solution**:
1. Verify Gmail app password in `.env`
2. Check spam folder
3. Ensure TLS is enabled (MAIL_TLS=True)

### Issue: 502 Bad Gateway

**Solution**: Check logs in Render dashboard → **Logs** tab
- Might be database connection issue
- Or missing environment variables

---

## Monitoring

### Check Logs

1. Go to web service on Render
2. Click **Logs** tab
3. View real-time application logs

### Check Metrics

1. Click **Metrics** tab
2. Monitor CPU, memory, and requests
3. Set up alerts if needed

---

## Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| PostgreSQL | Free | $0 |
| Web Service (Backend) | Free | $0 (for testing) |
| Static Site (Frontend) | Free | $0 |
| **Total** | | **$0 (free tier)** |

For production with reliability:
- PostgreSQL Pro: $10/month
- Web Service Starter: $7/month
- Static Site: Free
- **Total**: ~$17/month

---

## Next Steps

1. ✅ Deploy backend
2. ✅ Deploy frontend
3. ✅ Test on Render
4. ✅ Add custom domain
5. Monitor and scale as needed

**Your app is now live!** Share the URL: `https://room-booker-web.onrender.com`
