# Production Deployment Guide

## Overview
The Room Booker application consists of:
- **Frontend**: React + TypeScript + Vite (served statically)
- **Backend**: FastAPI + Python (REST API)
- **Database**: SQLite (development) or PostgreSQL (production)

---

## Prerequisites

- Node.js 16+ (frontend build)
- Python 3.8+ (backend)
- A server or cloud platform (Heroku, AWS, Azure, DigitalOcean, Render, etc.)
- Domain name (optional but recommended)
- Gmail app password configured in `.env`

---

## Step 1: Prepare Backend for Production

### 1.1 Update `.env` for Production

```env
# Use PostgreSQL for production
DATABASE_URL=postgresql://username:password@your-postgres-host:5432/roomdb

# Strong secret key (use `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
SECRET_KEY=your-strong-secret-key-here

# Email configuration (Gmail with app password)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_TLS=True
```

### 1.2 Update `requirements.txt` for Production

Add production dependencies:

```txt
fastapi
uvicorn[standard]
sqlmodel
psycopg2-binary
python-dotenv
passlib[bcrypt]
PyJWT
gunicorn  # Production WSGI server
python-multipart
```

### 1.3 Create `wsgi.py` for Production Servers

```python
# backend/wsgi.py
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Step 2: Build Frontend for Production

```bash
cd /path/to/room-booker-simplified

# Install dependencies
npm install

# Create .env.local with production backend URL
echo "VITE_BACKEND_URL=https://your-backend-domain.com" > .env.local

# Build for production
npm run build

# Output will be in `dist/` directory
```

---

## Step 3: Deploy Backend

### Option A: Using Heroku (Recommended for Quick Start)

1. **Install Heroku CLI**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Create Heroku App**
   ```bash
   heroku create room-booker-api
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set DATABASE_URL=<from-heroku-postgres>
   heroku config:set SECRET_KEY=<your-secret-key>
   heroku config:set MAIL_USERNAME=your-email@gmail.com
   heroku config:set MAIL_PASSWORD=your-app-password
   heroku config:set MAIL_FROM=your-email@gmail.com
   ```

4. **Create `Procfile` in Backend**
   ```
   web: cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT main:app
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Option B: Using Railway

1. Connect GitHub repo to Railway
2. Add environment variables in Railway dashboard
3. Deploy - Railway auto-detects Python and creates Procfile

### Option C: Using Render

1. Create new Web Service on render.com
2. Connect GitHub repo
3. Set build command: `pip install -r backend/requirements.txt`
4. Set start command: `cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT main:app`
5. Add environment variables
6. Deploy

### Option D: Self-Hosted (VPS/AWS/DigitalOcean)

1. **SSH into server**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install dependencies**
   ```bash
   apt update && apt install -y python3 python3-pip postgresql
   ```

3. **Clone repo**
   ```bash
   git clone <your-repo-url>
   cd room-booker-simplified/backend
   ```

4. **Setup Python environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Setup PostgreSQL**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE roomdb;
   CREATE USER roomuser WITH PASSWORD 'strong-password';
   GRANT ALL PRIVILEGES ON DATABASE roomdb TO roomuser;
   ```

6. **Create `.env` file**
   ```bash
   nano .env
   # Add all configuration variables
   ```

7. **Use Systemd to Run Backend**
   ```bash
   sudo nano /etc/systemd/system/room-booker.service
   ```
   
   Add:
   ```ini
   [Unit]
   Description=Room Booker API
   After=network.target
   
   [Service]
   User=www-data
   WorkingDirectory=/path/to/backend
   Environment="PATH=/path/to/backend/venv/bin"
   ExecStart=/path/to/backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 main:app
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   Then:
   ```bash
   sudo systemctl enable room-booker
   sudo systemctl start room-booker
   ```

8. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install -y nginx
   sudo nano /etc/nginx/sites-available/room-booker
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
   
   Enable:
   ```bash
   sudo ln -s /etc/nginx/sites-available/room-booker /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Step 4: Deploy Frontend

### Option A: Netlify

1. **Connect GitHub repo to Netlify**
2. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment variables:**
   - `VITE_BACKEND_URL=https://your-backend-domain.com`
4. Deploy!

### Option B: Vercel

1. Import project from GitHub
2. Set environment variable: `VITE_BACKEND_URL`
3. Deploy!

### Option C: AWS S3 + CloudFront

1. **Build frontend**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Setup CloudFront distribution**
   - Origin: your S3 bucket
   - Default root object: `index.html`
   - Error pages: route `/` to `index.html`

---

## Step 5: Verify Deployment

### Test Backend API

```bash
# Replace with your domain
curl https://your-backend-domain.com/docs

# Should return Swagger UI
```

### Test Frontend

Visit `https://your-frontend-domain.com` and verify:
- Pages load correctly
- Booking form submits to backend
- Contact form submits to backend
- Admin login works

### Test Email Notifications

1. Submit a booking via frontend
2. Check email inbox for confirmation

---

## Step 6: Setup Domain & SSL

### Using Cloudflare (Recommended)

1. Update domain registrar nameservers to Cloudflare
2. Ensure SSL/TLS is set to "Full (strict)"
3. Enable "Always Use HTTPS"
4. Setup page rules for API subdomain

---

## Production Checklist

- [ ] PostgreSQL database created and configured
- [ ] Backend environment variables set
- [ ] Frontend `.env.local` points to production backend URL
- [ ] Frontend built with `npm run build`
- [ ] Backend running with Gunicorn/similar
- [ ] Nginx/reverse proxy configured
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Email service tested
- [ ] Admin user created
- [ ] Backup strategy implemented
- [ ] Monitoring/logging setup

---

## Monitoring & Maintenance

### Log Monitoring

```bash
# View backend logs
journalctl -u room-booker -f

# Or using Docker logs
docker logs -f room-booker-api
```

### Database Backups

```bash
# PostgreSQL backup
pg_dump roomdb > backup_$(date +%Y%m%d).sql

# Automated backup with cron
0 2 * * * pg_dump roomdb | gzip > /backups/roomdb_$(date +\%Y\%m\%d).sql.gz
```

### Monitoring Tools

- **Sentry**: Application error tracking
- **DataDog**: Performance monitoring
- **Uptime Robot**: Uptime monitoring
- **New Relic**: APM monitoring

---

## Troubleshooting

### Backend not starting
```bash
# Check logs
journalctl -u room-booker -n 50

# Verify database connection
python3 -c "from app.db_core import engine; engine.connect()"
```

### Frontend can't reach backend
- Check CORS settings in `backend/main.py`
- Verify `VITE_BACKEND_URL` is correct
- Check browser console for CORS errors

### Email not sending
- Verify Gmail app password is correct
- Check backend logs for email errors
- Ensure "Less secure app access" is enabled (if not using app password)

---

## Cost Estimates (Monthly)

- **Heroku**: $7 (Postgres hobby) + $7 (Dyno)
- **Railway**: $5-20 (pay-as-you-go)
- **Render**: Free tier available, $7+ for paid
- **DigitalOcean VPS**: $5-10 minimum
- **AWS**: ~$1-5 (free tier eligible)

---

## Questions?

For issues, check:
1. Backend logs: `journalctl` or platform logs
2. Frontend console: Browser DevTools
3. Database: Connect with `psql` and verify data

---

**Good luck with your launch! 🚀**
