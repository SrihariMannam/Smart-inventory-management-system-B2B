# Smart B2B Inventory System: Complete Workflow & Feature Guide

This document is the master technical reference for the Smart B2B Inventory Management System. It covers end-to-end user flows, role-based mechanics, data synchronization architecture, and security constraints.

> [!TIP]
> **Auto-Seeding on Boot**
> The system is fully self-healing. Every time the Spring Boot backend starts, it automatically creates 3 platform accounts and imports all data from `products.csv` and `suppliers.csv`. No manual seeding is ever required.

---

## 🚀 1. Quick Start

### Start Backend
```bash
cd backend
mvn clean compile spring-boot:run
```
> Runs on `http://localhost:8080`

### Start Frontend
```bash
cd frontend
npm run dev
```
> Runs on `http://localhost:5173`

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@company.com` | `password` |
| Business | `acme@business.com` | `password` |
| Supplier | `supplier@gmail.com` | `password` |

---

## 🔄 2. The Core Order Fulfillment Pipeline

This is the primary business flow in the system:

```
BUSINESS places order → PENDING
        ↓
ADMIN clicks Ship → SHIPPED
        ↓
ADMIN clicks Deliver → DELIVERED
        ↓ (triggers automatically)
   Revenue counter += order total
   Product stockLevel -= ordered quantity
        ↓ (if stock drops below reorderThreshold)
   Low Stock Alert fires → Visible to ADMIN + SUPPLIER
```

**The Orders table** shows each order with:
- Order ID + item names/quantities (e.g. `Industrial Servo Motor (x2)`)
- Total item count badge
- Formatted total cost (e.g. `$2,250.00`)
- Color-coded status pill (PENDING=amber, SHIPPED=blue, DELIVERED=green, CANCELLED=red)
- Admin action buttons (Ship / Deliver / Cancel)

---

## 📦 3. CSV Bidirectional Sync Architecture

The platform maintains two persistent CSV files in the project root that stay perfectly in sync with the H2 database at all times.

### `products.csv` Flow
```
On server boot (if DB empty) → Read CSV → INSERT all products into H2
On product ADD via UI       → INSERT into H2 → Overwrite CSV
On product EDIT via UI      → UPDATE in H2  → Overwrite CSV
On product DELETE via UI    → DELETE from H2 → Overwrite CSV
```

### `suppliers.csv` Flow
```
On server boot (if DB empty) → Read CSV → INSERT all suppliers into H2
On supplier ADD via UI       → INSERT into H2 → Overwrite CSV
On supplier DELETE via UI    → DELETE from H2 → Overwrite CSV
```

> [!IMPORTANT]
> The CSV overwrite on every mutation ensures the files never go stale. When the server restarts and the H2 database is wiped, the CSVs hold the last known state and restore it automatically.

---

## 🔐 4. Role-Based Access Control (RBAC) Tier System

### ADMIN — System Controller
**Sidebar:** Dashboard, Inventory, Orders, Suppliers, Restock Requests, Settings

| Capability | Details |
|------------|---------|
| Dashboard | Full metrics: Revenue, Low Stock, Total Products, Total Orders |
| Inventory | Add, edit inline, delete products |
| Orders | View all orders, advance lifecycle (Ship / Deliver / Cancel) |
| Suppliers | View, add, delete suppliers |
| Restock Requests | See all low-stock items, fulfill restocking |

### BUSINESS — Buyer
**Sidebar:** Dashboard, Inventory, Orders, Settings

| Capability | Details |
|------------|---------|
| Dashboard | Products count + Orders count only (no Revenue) |
| Inventory | View all products, edit stock levels |
| Orders | View all orders, place new bulk orders |

### SUPPLIER — Manufacturer
**Sidebar:** Dashboard, Inventory, Suppliers, Restock Requests, Settings

| Capability | Details |
|------------|---------|
| Dashboard | Low Stock Alerts emphasis |
| Inventory | View all products (read-only display) |
| Suppliers | View supplier network directory |
| Restock Requests | See low-stock alerts, fulfill restocking, propose new products |

---

## 🏭 5. Supplier Workflow (Restock Requests Page)

When a Supplier logs in and navigates to **Restock Requests**:

1. **Active Restock Cards** — Every product whose `stockLevel <= reorderThreshold` appears as an amber alert card showing current stock, minimum required, and price.

2. **Fulfill Restock Button** — Clicking "Fulfill Restock (+N units)" instantly raises the product's stock level by `reorderThreshold × 2` units and syncs the change back to `products.csv`.

3. **Propose New Product** — The supplier opens the proposal form, fills in product details (name, category, price, stock, threshold, description), and submits it. It appears immediately in the global catalog — all roles can see and order it.

4. **Full Inventory Overview** — A complete table of every product with ⚠ Low / ✓ OK stock indicators.

---

## 🛡️ 6. Input Validation & Security Constraints

### Registration (`/register`)
| Field | Rule |
|-------|------|
| Email | Must match `name@domain.com` pattern strictly |
| Password | 8+ characters, at least 1 uppercase, 1 lowercase, 1 digit; special characters (e.g. `@`, `!`) allowed |
| Password visibility | Eye toggle to show/hide while typing |

### Supplier Network Form
| Field | Rule |
|-------|------|
| Contact Email | Must end with `@gmail.com` exactly |
| Phone Number | Exactly 10 digits, no dashes, letters, or symbols |

### Backend Authorization
| Endpoint | Allowed Roles |
|----------|--------------|
| `POST /api/products` | ADMIN, BUSINESS, SUPPLIER |
| `PUT /api/products/{id}` | ADMIN, BUSINESS, SUPPLIER |
| `DELETE /api/products/{id}` | ADMIN only |
| `POST /api/suppliers` | ADMIN only |
| `DELETE /api/suppliers/{id}` | ADMIN only |
| `PUT /api/orders/{id}/status` | ADMIN only |

---

## 📐 7. UI Architecture Details

### Inline Product Editing
Click the blue pencil icon on any product row in the Inventory table. The entire row transforms into editable input fields. Hit the green ✅ checkmark to save (syncs to DB + CSV) or the grey ✗ to cancel.

### Orders Table
- Order ID column absorbs item names as a sub-header (e.g. `#5 → Industrial Motor (x2), Copper Wire (x1)`)
- If item list is too long, it truncates with `...` and shows the full list on hover via tooltip
- Total cost formatted to 2 decimal places using `toLocaleString()`

### Password Visibility Toggle
Both Login and Register pages have an Eye icon button on the right side of the password input. Clicking it switches between hidden `••••••••` and visible plain text. It uses `tabIndex={-1}` so keyboard navigation is not interrupted.

### Auto-Seeding on Boot (`DataLoader.java`)
```
Spring Boot starts
    → Check if _user table is empty → Create 3 default accounts
    → Check if product table is empty → Parse products.csv → Batch INSERT
    → Check if supplier table is empty → Parse suppliers.csv → Batch INSERT
```
All checks are idempotent — re-runs are safe and will not duplicate data.

---

## 🗂️ 8. Key Files Reference

| File | Purpose |
|------|---------|
| `backend/.../config/DataLoader.java` | Auto-seeds users, products, suppliers on boot |
| `backend/.../service/InventoryService.java` | Product CRUD + CSV sync |
| `backend/.../service/SupplierService.java` | Supplier CRUD + CSV sync |
| `frontend/src/components/SupplierOrders.jsx` | Restock Requests page |
| `frontend/src/components/Inventory.jsx` | Inventory with inline editing |
| `frontend/src/components/Orders.jsx` | Order management with item details |
| `products.csv` | Persistent product catalog |
| `suppliers.csv` | Persistent supplier directory |
| `logininfo.txt` | Quick credential reference |
