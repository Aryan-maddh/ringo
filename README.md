# Ringo — Missed-Call Auto-Responder SaaS

Ringo answers missed calls with a friendly SMS in under 12 seconds, books appointments, and drops leads into your inbox.

**Stack:** Next.js 14 · Flask · PostgreSQL · Twilio · Stripe

---

## Quick start

### 1. PostgreSQL

```sql
CREATE USER ringo_user WITH PASSWORD 'ringo123';
CREATE DATABASE ringo OWNER ringo_user;
GRANT ALL ON SCHEMA public TO ringo_user;
```

### 2. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\pip install -r requirements.txt
copy .env.example .env          # then fill in your keys

# Seed database with test data
venv\Scripts\python seed.py

# Start Flask
venv\Scripts\python run.py
# → http://localhost:5000
```

### 3. Frontend

```bash
# from project root
npm install

# Create .env.local with:
# BACKEND_API_URL=http://localhost:5000
# NEXT_PUBLIC_API_URL=
#
# The frontend calls /api/... by default. Next.js proxies those
# requests to BACKEND_API_URL, so the browser does not need to call
# Flask directly.

npm run dev
# → http://localhost:3000
```

---

## Test accounts (after seeding)

| Email | Password | Plan |
|-------|----------|------|
| marco@pacificplumbing.com | password123 | growth |
| sarah@brightelectrical.com | password123 | starter |
| james@coolglacierhvac.com | password123 | pro |

**Admin panel:** `http://localhost:3000/admin/login`  
Credentials set in `.env` as `ADMIN_EMAIL` / `ADMIN_PASSWORD`  
Default: `admin@gmail.com` / `admin@123`

---

## Pages

| URL | Description |
|-----|-------------|
| / | Landing/marketing page |
| /login | User login |
| /onboarding | Account + business setup (5 steps) |
| /dashboard | Analytics dashboard |
| /inbox | SMS conversations + call log |
| /settings | Business settings |
| /billing | Plan management |
| /admin/login | Admin sign-in |
| /admin/dashboard | Platform KPIs |
| /admin/businesses | All business accounts |

---

## API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register user + business |
| POST | /api/auth/login | — | Login, get JWT |
| GET | /api/dashboard/stats | JWT | KPIs + recent calls + weekly chart |
| GET | /api/calls | JWT | Call log (`?status=missed&emergency=true`) |
| GET | /api/sms | JWT | SMS logs |
| GET | /api/sms/conversations | JWT | SMS grouped by caller number |
| POST | /api/sms/reply | JWT | Send manual SMS via Twilio |
| GET | /api/settings | JWT | Business settings |
| PUT | /api/settings | JWT | Update business settings |
| GET | /api/billing | JWT | Current plan info |
| POST | /api/billing/create-checkout | JWT | Stripe checkout session |
| POST | /api/billing/webhook | — | Stripe webhook handler |
| POST | /api/webhooks/voice | — | Twilio incoming call (TwiML) |
| POST | /api/webhooks/missed-call | — | Twilio missed-call + SMS handler |
| POST | /api/admin/login | — | Admin auth |
| GET | /api/admin/dashboard | Admin JWT | Platform KPIs |
| GET | /api/admin/businesses | Admin JWT | All businesses |
| PUT | /api/admin/businesses/:id | Admin JWT | Update plan / suspend |

---

## Twilio setup

1. Buy a Twilio number at [console.twilio.com](https://console.twilio.com)
2. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE` in `backend/.env`
3. Point Twilio Voice webhook to `https://your-domain/api/webhooks/voice`
4. In Settings → configure your Twilio number for a business

**Production webhook URL:**
```bash
https://ringo-backend-ucfchnoxpa-uc.a.run.app/api/webhooks/voice
```

---

## Stripe setup

1. Create products/prices at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Copy price IDs into `.env` as `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_PRO`
3. Add webhook endpoint: `https://your-domain/api/billing/webhook`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

Plans: Starter $29/mo · Growth $79/mo · Pro $149/mo

---

## Production checklist

- [ ] Set `FLASK_ENV=production`, `FLASK_DEBUG=0`
- [ ] Use strong random `JWT_SECRET_KEY` and `SECRET_KEY`
- [ ] Set `ADMIN_PASSWORD` to something secure
- [ ] Configure Twilio numbers for each business
- [ ] Set up Stripe products and webhook
- [x] Set `BASE_URL` to the Cloud Run backend URL
- [ ] Run Flask behind gunicorn: `gunicorn run:app -w 4`
- [ ] Enable HTTPS (nginx / Cloudflare)
- [ ] Set `FRONTEND_URL` in CORS to your production domain
