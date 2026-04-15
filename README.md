# Smart B2B Inventory Management System

A robust, full-stack B2B inventory management platform with role-based access control, real-time analytics, CSV-synced data persistence, and a complete supplier fulfillment workflow.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![React](https://img.shields.io/badge/react-v19-blue)
![Spring Boot](https://img.shields.io/badge/springboot-v3.2.4-green)
![Deploy](https://img.shields.io/badge/deploy-live-success)

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🖥️ Frontend (Vercel) | [https://smart-inventory-management-system-b.vercel.app](https://smart-inventory-management-system-b.vercel.app) |
| ⚙️ Backend API (Render) | [https://smart-inventory-management-system-b2b-1.onrender.com](https://smart-inventory-management-system-b2b-1.onrender.com) |

> **Note:** The backend is hosted on Render's free tier and may take ~30 seconds to wake up on the first request if it has been idle.

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite, Tailwind CSS v4, Axios, React Router v7, Lucide React, Recharts |
| Backend | Spring Boot 3.2.4, Spring Security, Spring Data JPA, JWT (jjwt 0.11.5) |
| Database | H2 In-Memory |
| Auth | Stateless JWT tokens, Role-Based Access Control (RBAC) |
| Deployment | Vercel (Frontend) + Render with Docker (Backend) |

---

## ⭐ Core Features

### 🔐 Authentication & Security
- Secure `/register` and `/login` workflows with **show/hide password toggle**
- Email format validation (strict `name@domain.com` regex)
- Password strength enforcement: 8+ chars, uppercase, lowercase, number, special chars allowed
- Three user roles: `ADMIN`, `BUSINESS`, `SUPPLIER`
- Stale JWT token auto-wiping on page load
- CORS configured dynamically via environment variables

### 📊 Dynamic Analytics Dashboard
- Real-time **Revenue** tracking (only DELIVERED orders count)
- Aggregated product and order metrics
- Automated low-stock threshold detection and visual alerts
- Dashboard content is **role-filtered** — each user sees only relevant metrics

### 📦 Inventory Management
- Full CRUD for the product catalog (Add, Edit inline, Delete)
- **Inline row editing** — click the pencil icon to edit any product directly in the table
- Suppliers can **propose new products** to the global catalog
- CSV bidirectional sync: every add/edit/delete updates `products.csv` automatically

### 🚚 Bulk Order Management
- Business clients place tiered bulk purchase orders
- Full lifecycle tracking: `PENDING` → `SHIPPED` → `DELIVERED`
- Orders table shows **item names, quantity counts**, and formatted total cost
- Admin-exclusive status controls (Ship / Deliver / Cancel buttons)

### 🏭 Supplier Workflow
- Supplier network directory with contact emails and phone numbers (gmail + 10-digit validation)
- **Restock Requests page**: Suppliers see all low-stock alerts and can fulfill restocking with one click
- Suppliers can propose new products directly into the catalog
- CSV bidirectional sync: `suppliers.csv` stays updated on every add/delete

### ⚙️ Settings & Profile
- All users can update their display name via the Settings page
- Changes persist to the database via `PUT /api/users/me`

---

## 🚀 Getting Started

### Prerequisites
- **Java 17** (for backend)
- **Node.js 18+** (for frontend)
- **Maven** (or use the included `mvnw` wrapper)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Smart-inventory-management-system-B2B.git
cd Smart-inventory-management-system-B2B
```

### 2. Start the Backend
```bash
cd backend
./mvnw clean compile spring-boot:run
```
> API runs on `http://localhost:8080`

On startup, the backend **automatically**:
- Creates 3 platform accounts (Admin, Business, Supplier)
- Imports all products from `products.csv`
- Imports all suppliers from `suppliers.csv`

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
> Dashboard opens at `http://localhost:5173`

---

## 👤 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@company.com` | `password` |
| Business Client | `acme@business.com` | `password` |
| Supplier | `supplier@gmail.com` | `password` |

---

## 🔐 Role-Based Access Matrix

| Feature | ADMIN | BUSINESS | SUPPLIER |
|---------|-------|----------|----------|
| Dashboard | Full metrics | Orders + Products | Low stock only |
| Inventory | View + Add + Edit + Delete | View + Edit | View + Propose |
| Orders | View + Change Status | View + Place Orders | ❌ |
| Suppliers | View + Add + Delete | ❌ | View |
| Restock Requests | View + Fulfill | ❌ | View + Fulfill |
| Settings | ✅ | ✅ | ✅ |

---

## 🌍 Deployment

The project is deployed using **Vercel** (frontend) and **Render** (backend with Docker).

### Frontend — Vercel

1. Import the GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-backend.onrender.com/api` |
4. Deploy — Vercel auto-detects Vite and uses `vercel.json` for SPA routing

### Backend — Render (Docker)

1. Create a **Web Service** on [render.com](https://render.com)
2. Set **Root Directory** to `backend`
3. Set **Runtime** to `Docker`
4. Add environment variables:
   | Key | Value |
   |-----|-------|
   | `PORT` | `8080` |
   | `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
   | `JWT_SECRET` | *(generate with `openssl rand -hex 32`)* |
   | `H2_CONSOLE_ENABLED` | `false` |
   | `JPA_SHOW_SQL` | `false` |
5. Deploy — Render builds the Docker image and starts the JAR

### Environment Variables Reference

<details>
<summary>📋 Full Backend Environment Variables</summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port (Render sets this automatically) |
| `SPRING_DATASOURCE_URL` | `jdbc:h2:mem:inventory_db` | H2 database URL |
| `SPRING_DATASOURCE_USERNAME` | `sa` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | `password` | DB password |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Comma-separated allowed origins |
| `JWT_SECRET` | *(default key)* | JWT signing secret |
| `JWT_EXPIRATION` | `86400000` | Token expiry (24h in ms) |
| `H2_CONSOLE_ENABLED` | `true` | Enable H2 web console |
| `JPA_SHOW_SQL` | `true` | Log SQL queries |

</details>

<details>
<summary>📋 Full Frontend Environment Variables</summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8080/api` | Backend API base URL (must include `/api`) |

</details>

---

## 🔒 API Endpoints

### Auth
- `POST /api/auth/register` — Create new user account
- `POST /api/auth/login` — Get JWT token

### Products
- `GET /api/products` — Full catalog
- `POST /api/products` — Add product (ADMIN, BUSINESS, SUPPLIER)
- `PUT /api/products/{id}` — Edit product (ADMIN, BUSINESS, SUPPLIER)
- `DELETE /api/products/{id}` — Delete product (ADMIN only)
- `GET /api/products/alerts/low-stock` — Low stock items

### Orders
- `GET /api/orders` — All orders
- `POST /api/orders` — Place new order
- `PUT /api/orders/{id}/status` — Update order lifecycle status (ADMIN only)

### Suppliers
- `GET /api/suppliers` — All suppliers
- `POST /api/suppliers` — Add supplier (ADMIN only)
- `DELETE /api/suppliers/{id}` — Delete supplier (ADMIN only)

### Users
- `PUT /api/users/me` — Update current user's profile name

### Analytics
- `GET /api/analytics/summary` — Aggregated dashboard metrics

---

## 🗂️ Project Structure

```
Smart-inventory-management-system-B2B/
├── backend/                    # Spring Boot API
│   ├── Dockerfile              # Multi-stage Docker build for Render
│   ├── system.properties       # Java 17 version for Render
│   ├── mvnw                    # Maven wrapper script
│   ├── pom.xml                 # Maven dependencies
│   └── src/main/
│       ├── java/com/b2b/inventory/
│       │   ├── config/         # Security, CORS, JWT, DataLoader
│       │   ├── controller/     # REST controllers
│       │   ├── dto/            # Request/Response DTOs
│       │   ├── entity/         # JPA entities
│       │   ├── repository/     # Spring Data repositories
│       │   └── service/        # Business logic
│       └── resources/
│           ├── application.yml # Config with env var support
│           ├── products.csv    # Seed data (classpath)
│           └── suppliers.csv   # Seed data (classpath)
├── frontend/                   # React + Vite app
│   ├── vercel.json             # SPA rewrites for Vercel
│   ├── .env.example            # Environment variable template
│   ├── package.json            # NPM dependencies
│   ├── vite.config.js          # Vite + Tailwind config
│   └── src/
│       ├── components/         # All page components
│       ├── context/            # AuthContext (JWT management)
│       ├── api.js              # Axios instance with env var
│       ├── App.jsx             # Routes & protected routes
│       └── main.jsx            # Entry point
├── products.csv                # Master product catalog
├── suppliers.csv               # Supplier directory
├── docker-compose.yml          # Local Docker setup
├── SYSTEM_WORKFLOW.md          # Technical workflow docs
└── README.md
```

---

## 📝 License

This project is for educational and demonstration purposes.
