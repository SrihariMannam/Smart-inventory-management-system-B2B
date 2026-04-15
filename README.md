# Smart B2B Inventory Management System

A robust, full-stack B2B inventory management platform with role-based access control, real-time analytics, CSV-synced data persistence, and a complete supplier fulfillment workflow.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![React](https://img.shields.io/badge/react-v18.0-blue)
![Spring Boot](https://img.shields.io/badge/springboot-v3.2.4-green)

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS v4, Axios, React Router v6, Lucide React |
| Backend | Spring Boot 3.2.4, Spring Security, Spring Data JPA, JWT |
| Database | H2 In-Memory (dev) — drop-in replaceable with PostgreSQL |
| Auth | Stateless JWT tokens, Role-Based Access Control (RBAC) |

---

## ⭐ Core Features

### 🔐 Authentication & Security
- Secure `/register` and `/login` workflows with **show/hide password toggle**
- Email format validation (strict `name@domain.com` regex)
- Password strength enforcement: 8+ chars, uppercase, lowercase, number, special chars allowed
- Three user roles: `ADMIN`, `BUSINESS`, `SUPPLIER`
- Stale JWT token auto-wiping on page load
- CORS configured for local dev (easily restricted for production)

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

## 🚀 Setup & Execution

### 1. Start the Backend (Java 17 required)
```bash
cd backend
mvn clean compile spring-boot:run
```
> API runs on `http://localhost:8080`

On startup, the backend **automatically**:
- Creates 3 platform accounts (Admin, Business, Supplier)
- Imports all products from `products.csv`
- Imports all suppliers from `suppliers.csv`

**You never need to run seed.cjs manually again.**

### 2. Start the Frontend (Node.js required)
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

## 📂 Data Files (Project Root)

| File | Purpose |
|------|---------|
| `products.csv` | Master product catalog — auto-imported on boot, auto-updated on changes |
| `suppliers.csv` | Supplier directory — auto-imported on boot, auto-updated on changes |
| `logininfo.txt` | Quick reference for default login credentials |
| `SYSTEM_WORKFLOW.md` | Detailed technical workflow documentation |

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
Smart inventory management system B2B/
├── backend/                  # Spring Boot API
│   └── src/main/java/com/b2b/inventory/
│       ├── config/           # SecurityConfig, DataLoader (auto-seeder)
│       ├── controller/       # REST controllers
│       ├── entity/           # JPA entities
│       ├── repository/       # Spring Data repositories
│       └── service/          # Business logic + CSV sync
├── frontend/                 # React + Vite app
│   └── src/
│       ├── components/       # All page components
│       ├── context/          # AuthContext
│       └── api.js            # Axios instance
├── products.csv              # Auto-synced product catalog
├── suppliers.csv             # Auto-synced supplier directory
└── SYSTEM_WORKFLOW.md        # Detailed technical documentation
```
