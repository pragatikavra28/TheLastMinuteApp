# Deploying to Railway

This repo is a monorepo with 4 backend services + a frontend + Postgres + Redis.
Railway needs each one added as a **separate service** inside one Railway project,
pointing at the right subfolder. There's no single "deploy everything" button for a
monorepo like this, but the steps below are quick.

## 1. Create the project
1. Go to https://railway.app → **New Project** → **Deploy from GitHub repo**
2. Select `pragatikavra28/TheLastMinuteApp` and authorize Railway's GitHub App
3. Railway will create one service from the repo root — delete it, you'll add 6 services manually (see below), OR keep it and just set its Root Directory to `services/auth-service` in step 2.

## 2. Add the databases first
- In the project, click **+ New → Database → Add PostgreSQL**
- Click **+ New → Database → Add Redis**
- Both give you connection variables automatically (`DATABASE_URL`, `REDIS_URL`, etc.) — note the individual `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT` variables Railway generates on the Postgres service; you'll reference them in each backend service below.

## 3. Add the 4 backend services
For **each** of `auth-service`, `listing-service`, `booking-service`, `payment-service`:
1. **+ New → GitHub Repo** → select `TheLastMinuteApp` again (Railway lets you add the same repo multiple times as different services)
2. In the new service's **Settings → Root Directory**, set it to `services/auth-service` (etc. per service) — Railway will auto-detect its `Dockerfile`
3. In **Variables**, add (reference the Postgres service's variables using Railway's `${{Postgres.PGHOST}}` syntax so they stay in sync):
   ```
   PORT=4001                (4002 / 4003 / 4004 for the others)
   DB_HOST=${{Postgres.PGHOST}}
   DB_USER=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   DB_NAME=${{Postgres.PGDATABASE}}
   DB_PORT=${{Postgres.PGPORT}}
   JWT_SECRET=<pick a long random string, same value on all 4 services>
   FRONTEND_URL=<fill in after step 4, e.g. https://thelastminuteapp.up.railway.app>
   ```
   `listing-service` also needs `BOOKING_SERVICE_URL=<booking-service's Railway public URL>`
   `payment-service` also needs `BOOKING_SERVICE_URL` and `AUTH_SERVICE_URL` (their Railway public URLs) and `STRIPE_SECRET_KEY` if you want real payments (it runs in mock mode without one)
4. Under **Settings → Networking**, click **Generate Domain** so the service gets a public URL
5. Deploy. Check the **Deploy Logs** — you're looking for the same "SERVICE READY" banner you saw locally.

## 4. Load the database schema
Once Postgres is up, run the schema once:
- Open the Postgres service → **Data** tab → **Query**, paste the contents of `db/init.sql`, run it.
- Or from your own machine: `psql "$(railway variables get DATABASE_URL)" -f db/init.sql` using the Railway CLI.

## 5. Add the frontend
1. **+ New → GitHub Repo** → `TheLastMinuteApp` again
2. **Root Directory**: `frontend/web` (it has its own `Dockerfile` now, serving the build via nginx)
3. **Variables**:
   ```
   VITE_AUTH_SERVICE_URL=<auth-service public URL>
   VITE_LISTING_SERVICE_URL=<listing-service public URL>
   VITE_BOOKING_SERVICE_URL=<booking-service public URL>
   VITE_PAYMENT_SERVICE_URL=<payment-service public URL>
   ```
4. Generate a domain for it too — that's your live app URL.
5. Go back to the 4 backend services and set `FRONTEND_URL` to this domain, so CORS allows it.

## Notes
- `booking-service` has heavier dependencies (`tesseract.js`, `sharp`, `aws-sdk`) — its first build will take a few minutes.
- Railway's free tier sleeps/limits usage; fine for a demo, check current pricing for anything more.
- Health check endpoints are `/health` on all 4 backend services and on the frontend nginx.
