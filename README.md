# Room Booker - Hotel Reservation System

A full-stack hotel room booking application with modern web technologies.

## 🎯 Features

✅ **User Booking System**
- Search and browse rooms
- Real-time date picking with calendar
- Secure booking submission
- Email confirmation notifications

✅ **Contact Management**
- Contact form with email submission
- Real-time form validation

✅ **Admin Dashboard**
- Secure JWT-based authentication
- View all bookings
- View all contact messages
- Email notifications

✅ **Production Ready**
- FastAPI backend with SQLModel ORM
- PostgreSQL support (with SQLite fallback)
- Environment-based configuration
- Comprehensive error handling
- CORS enabled for frontend integration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- npm or yarn

### Development Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd room-booker-simplified

# 2. Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Create admin user
python create_admin.py --email admin@example.com --password SecurePass123

# 4. Start backend (in backend directory, venv activated)
uvicorn main:app --reload
# Backend runs at http://localhost:8000

# 5. In a new terminal, setup frontend
cd ..
npm install

# 6. Start frontend
npm run dev
# Frontend runs at http://localhost:5173
```

### API Documentation
Once backend is running, visit: **http://localhost:8000/docs** (Swagger UI)

---

## 📁 Project Structure

```
room-booker-simplified/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app setup
│   │   ├── db_core.py         # Database configuration
│   │   ├── models.py          # SQLModel definitions
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── auth.py            # Authentication routes
│   │   ├── routes/
│   │   │   ├── admin.py       # Admin endpoints
│   │   │   ├── booking.py     # Booking endpoints
│   │   │   └── contact.py     # Contact endpoints
│   │   └── utils/
│   │       ├── security.py    # Password & JWT utilities
│   │       └── email.py       # Email sending
│   ├── create_admin.py        # CLI admin creation
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── src/                        # React frontend
│   ├── components/
│   │   ├── BookingForm.tsx    # Booking form component
│   │   └── ...
│   ├── pages/
│   │   ├── Contact.tsx        # Contact page with form
│   │   ├── BookRoom.tsx       # Booking page
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts             # Supabase integration
│   │   └── backend-api.ts     # FastAPI integration ⭐ NEW
│   └── hooks/
├── .env.local                 # Frontend env (backend URL)
├── vite.config.ts            # Vite configuration
├── package.json              # Node dependencies
├── DEPLOYMENT.md             # Production deployment guide
├── deploy.sh                 # Deployment automation script
└── README.md                 # This file
```

---

## 🔧 Backend Configuration

### Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/roomdb
# Or use SQLite for development:
# DATABASE_URL=sqlite:///./roomdb.sqlite

# Security
SECRET_KEY=your-secret-key-min-32-chars

# Email (Gmail with app password)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_TLS=True
```

### Admin User Creation

#### Option 1: CLI (Recommended)
```bash
cd backend
source venv/bin/activate
python create_admin.py --email admin@example.com --password SecurePass123
```

#### Option 2: API Endpoint (One-time only)
```bash
curl -X POST http://localhost:8000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SecurePass123"}'
```

---

## 🌐 Frontend Configuration

Create `.env.local` in project root:

```env
# Development
VITE_BACKEND_URL=http://localhost:8000

# Production
# VITE_BACKEND_URL=https://your-api-domain.com
```

---

## 📡 API Endpoints

### Booking
- `POST /api/booking/` - Submit new booking
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "room_type": "Deluxe Suite",
    "check_in": "2026-02-10",
    "check_out": "2026-02-12"
  }
  ```

### Contact
- `POST /api/contact/` - Submit contact form
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I have a question..."
  }
  ```

### Admin
- `POST /api/admin/init` - Initialize first admin (one-time)
- `POST /api/admin/login` - Login and get JWT token
  ```json
  {
    "email": "admin@example.com",
    "password": "SecurePass123"
  }
  ```
- `GET /api/admin/bookings` - Get all bookings (requires token)
- `GET /api/admin/messages` - Get all contact messages (requires token)

---

## 🔐 Security

✅ Password hashing with PBKDF2-SHA256
✅ JWT-based admin authentication
✅ Environment variable protection
✅ CORS configured for safe cross-origin requests
✅ Input validation on all endpoints

---

## 📧 Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Copy the 16-character password
3. Add to `backend/.env`:
   ```env
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

---

## 🧪 Testing

### Test Booking Submission
```bash
curl -X POST http://localhost:8000/api/booking/ \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "room_type":"Deluxe Suite",
    "check_in":"2026-02-10",
    "check_out":"2026-02-12"
  }'
```

### Test Contact Form
```bash
curl -X POST http://localhost:8000/api/contact/ \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "message":"Test message"
  }'
```

---

## 📦 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:
- ✅ PostgreSQL setup
- ✅ Backend deployment (Heroku, Railway, Render, VPS)
- ✅ Frontend deployment (Netlify, Vercel, AWS S3)
- ✅ Domain & SSL setup
- ✅ Email configuration
- ✅ Monitoring & maintenance

### Quick Deploy Script
```bash
./deploy.sh production
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000

# View error logs
cd backend && source venv/bin/activate
uvicorn main:app --reload
```

### Database connection error
```bash
# Verify .env DATABASE_URL is correct
# If using PostgreSQL, check if service is running:
psql -U username -d roomdb -c "SELECT 1;"
```

### Frontend can't reach backend
- Check `.env.local` has correct `VITE_BACKEND_URL`
- Verify backend is running
- Check browser console (F12) for CORS errors

### Email not sending
- Verify Gmail app password is correct
- Check backend logs for errors
- Ensure 2FA is enabled on Gmail account

---

## 📚 Technology Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components

**Backend:**
- FastAPI
- Python 3.8+
- SQLModel (SQLAlchemy + Pydantic)
- PostgreSQL/SQLite
- Uvicorn ASGI server

**DevOps:**
- Git/GitHub
- Docker ready
- Environment-based config

---

## 📄 License

MIT License - feel free to use this project

---

## ✨ What's New

- ✅ Full backend API with FastAPI
- ✅ Frontend-backend integration complete
- ✅ Admin authentication system
- ✅ Email notifications working
- ✅ Production deployment guide
- ✅ One-click deployment script

---

**Ready to launch? See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup!** 🚀

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
