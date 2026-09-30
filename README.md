# 🚀 Last Minute

A **production-grade full-stack last-minute booking platform** built with a **microservices architecture**.
Designed like a real startup system with separate backend services, secure authentication, scalable infrastructure, and a modern frontend.

---

# 🌍 Live Demo

**App:** [https://lastminute-app-frontend.onrender.com](https://lastminute-app-frontend.onrender.com)

> ⚠️ Hosted on Render's free tier — services spin down after ~15 minutes of inactivity.
> The **first** request after a period of inactivity can take 30–60 seconds while the service wakes up. Subsequent requests are fast.

| Service          | Live URL                                                                |
| ---------------- | ------------------------------------------------------------------------ |
| Frontend          | https://lastminute-app-frontend.onrender.com                            |
| Auth Service      | https://auth-service-cv37.onrender.com/health                           |
| Listing Service   | https://listing-service-pqb0.onrender.com/health                        |
| Booking Service   | https://booking-service-df8a.onrender.com/health                        |
| Payment Service   | https://payment-service-qvb5.onrender.com/health                        |
| Database          | Postgres, hosted on [Neon](https://neon.tech)                            |

---

# 📌 Project Overview

Last Minute allows users to:

* Register / Login securely
* Create and manage listings
* Book available listings instantly
* Prevent double bookings
* Cancel bookings
* Make payments
* Use a responsive frontend interface

This project was built to simulate a **real-world scalable booking platform** similar to Airbnb / last-minute rental systems.

---

# 🏗️ Architecture

## Backend (Microservices)

| Service         | Port | Description                        |
| --------------- | ---- | ---------------------------------- |
| Auth Service    | 4001 | User registration, login, JWT auth |
| Listing Service | 4002 | Create & manage listings           |
| Booking Service | 4003 | Create/cancel bookings             |
| Payment Service | 4004 | Payment processing                 |
| PostgreSQL      | 5432 | Main relational database           |
| Redis           | 6379 | Cache / Idempotency / Sessions     |

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Axios
* React Router
* Tailwind CSS / CSS

## Backend

* Node.js
* Express.js
* JWT Authentication
* bcrypt
* Redis
* PostgreSQL

## DevOps / Infra

* Docker
* Docker Compose
* GitHub
* Vercel / AWS Ready

---

# 📁 Folder Structure

```bash id="x2s1ap"
LastMinute/
│── frontend/
│── services/
│   ├── auth-service/
│   ├── listing-service/
│   ├── booking-service/
│   └── payment-service/
│── db/
│   └── init.sql
│── docker-compose.yml
│── .gitignore
│── README.md
```

---

# 🔐 Features

## ✅ Authentication

* Register users
* Login users
* JWT token generation
* Protected routes
* Password hashing

## ✅ Listings

* Create listing
* View listings
* Availability management

## ✅ Booking Engine

* Book listing
* Cancel booking
* Prevent duplicate booking
* Transaction-safe logic
* Row locking (`FOR UPDATE`)
* Idempotent booking requests

## ✅ Payments

* Payment service integration
* Ready for Stripe / Razorpay expansion

## ✅ Frontend

* Responsive UI
* Authentication flow
* Listings page
* Booking page
* Payment flow

---

# 🧠 Advanced Backend Concepts Used

* Microservices Architecture
* Database Transactions
* Race Condition Prevention
* Redis Caching
* Idempotency Keys
* Secure JWT Auth
* Docker Networking
* Scalable Service Separation

---

# ⚙️ Local Setup

## 1️⃣ Clone Repository

```bash id="l0n3wd"
git clone https://github.com/yourusername/last-minute.git
cd last-minute
```

## 2️⃣ Setup Environment Variables

Create `.env` files inside services.

Example:

```env id="7g0qol"
PORT=4001
POSTGRES_HOST=postgres
POSTGRES_DB=lastminute
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your_secret
```

## 3️⃣ Run Project

```bash id="a7m9pk"
docker compose up --build
```

---

# 🌐 API Endpoints

## Auth Service

```http id="p6xj7s"
POST /auth/register
POST /auth/login
GET  /auth/me
```

## Listings

```http id="w5t3kc"
POST   /api/listings
GET    /api/listings/search
GET    /api/listings/:id
GET    /api/listings/my/listings
```

## Bookings

```http id="n2v8hr"
POST  /bookings
GET   /bookings/my-bookings
PATCH /bookings/:id/cancel
```

## Payments

```http id="q1z4um"
POST /api/payments/create
```

---

# 🚀 Deployment

Currently live on:

* **Frontend** → Render (Static Site)
* **Backend (4 services)** → Render (Docker Web Services)
* **Database** → Neon (managed Postgres)

See the [Live Demo](#-live-demo) section above for links.

This project can also be deployed on:

* Vercel (Frontend)
* AWS
* Railway
* Docker VPS


---

# 📈 Future Improvements

* Real payment gateway integration
* Notifications (Email / SMS)
* Reviews & Ratings
* Admin Dashboard
* Kubernetes deployment
* API Gateway
* CI/CD pipelines

---

# 👨‍💻 Why This Project Matters

This project demonstrates real backend engineering skills:

* Building scalable systems
* Working with databases
* Handling concurrency
* Designing secure APIs
* Full-stack product deployment

---

# 📬 Contact

If you'd like to collaborate or discuss backend engineering, feel free to connect.

---

# ⭐ If you like this project

Give it a star on GitHub ⭐

---

Built with passion, debugging, and persistence.
