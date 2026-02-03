# 📋 Quick Reference Card

## 🏃 Quick Start (Copy & Paste)

```bash
# Backend
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python create_admin.py --email admin@example.com --password SecurePass123
uvicorn main:app --reload  # http://localhost:8000

# Frontend (new terminal)
npm install && npm run dev  # http://localhost:5173
```

---

## 🔑 Admin Credentials

| Field | Value |
|-------|-------|
| Email | `valentineagaba16@gmail.com` |
| Password | `SecurePass123` |

---

## 📍 URLs

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | `http://localhost:5173` | React app |
| Backend API | `http://localhost:8000` | FastAPI |
| API Docs | `http://localhost:8000/docs` | Swagger UI |
| API ReDoc | `http://localhost:8000/redoc` | Alternative docs |

---

## 🔌 Key API Endpoints

```bash
# Create booking
POST /api/booking/
{
  "name": "John",
  "email": "john@example.com",
  "room_type": "Deluxe Suite",
  "check_in": "2026-02-10",
  "check_out": "2026-02-12"
}

# Submit contact
POST /api/contact/
{
  "name": "John",
  "email": "john@example.com",
  "message": "Hello"
}

# Admin login
POST /api/admin/login
{
  "email": "valentineagaba16@gmail.com",
  "password": "SecurePass123"
}
# Returns: {"access_token": "...", "token_type": "bearer"}

# Get bookings (with token)
GET /api/admin/bookings
Header: Authorization: Bearer <token>

# Get messages (with token)
GET /api/admin/messages
Header: Authorization: Bearer <token>
```

---

## 📁 Key Files

| File | Purpose | Edit When |
|------|---------|-----------|
| `backend/.env` | Backend config | Changing DB or email |
| `.env.local` | Frontend config | Changing API URL |
| `backend/app/routes/booking.py` | Booking logic | Adding features |
| `backend/app/routes/contact.py` | Contact logic | Adding features |
| `src/components/BookingForm.tsx` | Booking UI | Changing form |
| `src/pages/Contact.tsx` | Contact UI | Changing form |
| `src/lib/backend-api.ts` | API integration | Changing API calls |

---

## 🔧 Common Commands

```bash
# Backend
python create_admin.py --email admin@example.com --password Pass123
sqlite3 backend/roomdb.sqlite ".tables"  # View tables
sqlite3 backend/roomdb.sqlite ".schema booking"  # View schema

# Frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview build

# Git
git status         # Check changes
git add .          # Stage changes
git commit -m "msg"  # Commit
git push           # Push to GitHub
```

---

## 🧪 Test Commands

```bash
# Test booking
curl -X POST http://localhost:8000/api/booking/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","room_type":"Suite","check_in":"2026-02-10","check_out":"2026-02-12"}'

# Test contact
curl -X POST http://localhost:8000/api/contact/ \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","message":"Test"}'

# Test admin login
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"valentineagaba16@gmail.com","password":"SecurePass123"}'
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8000 in use | `lsof -i :8000` then `kill -9 <PID>` |
| Module not found | `pip install -r requirements.txt` |
| venv not activating | `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows) |
| Email not working | Check `.env` credentials, enable 2FA on Gmail |
| Frontend can't reach API | Check `VITE_BACKEND_URL` in `.env.local` |

---

## 📦 Environment Variables Template

### Backend (.env)
```env
DATABASE_URL=sqlite:///./roomdb.sqlite
SECRET_KEY=change-me-in-production
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_TLS=True
```

### Frontend (.env.local)
```env
VITE_BACKEND_URL=http://localhost:8000
```

---

## 🚀 Deployment One-Liners

### Local Dev
```bash
./deploy.sh development
```

### Production
- See [DEPLOYMENT.md](./DEPLOYMENT.md)
- Options: Heroku, Railway, Render, AWS, DigitalOcean

---

## 📞 Support Resources

| Need | Resource |
|------|----------|
| Setup help | [README.md](./README.md) |
| Deployment | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Full summary | [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) |
| API docs | http://localhost:8000/docs |
| Code | Check GitHub repository |

---

## ✅ Pre-Launch Checklist

- [ ] Backend running locally (`uvicorn main:app --reload`)
- [ ] Frontend running locally (`npm run dev`)
- [ ] Can create bookings via API
- [ ] Can submit contact forms via API
- [ ] Can login as admin
- [ ] Emails sending to inbox
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Ready for production deployment

---

## 🎯 Next Step

**Choose one:**
1. Continue developing locally
2. Deploy to production (see DEPLOYMENT.md)
3. Add more features
4. Setup monitoring

---

**Happy coding! 🚀**
