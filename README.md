# 🚀 Last Minute

A **production-grade full-stack last-minute booking platform** built with a **microservices architecture**.
Designed like a real startup system with separate backend services, secure authentication, scalable infrastructure, and a modern frontend.

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
POST /api/auth/register
POST /api/auth/login
```

## Listings

```http id="w5t3kc"
POST /api/listings
GET /api/listings
PATCH /api/listings/:id/availability
```

## Bookings

```http id="n2v8hr"
POST /api/bookings
PATCH /api/bookings/:id/cancel
GET /api/bookings/me
```

## Payments

```http id="q1z4um"
POST /api/payments/create
POST /api/payments/verify
```

---

# 🚀 Deployment Ready

This project can be deployed on:

* Vercel (Frontend)
* AWS
* Render
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
