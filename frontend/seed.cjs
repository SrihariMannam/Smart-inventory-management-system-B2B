const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

async function seed() {
    console.log("Starting DB Seeding...");

    // 1. Authenticate as Admin
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@company.com',
        password: 'password'
    });
    const token = loginRes.data.token;
    const ax = axios.create({
        baseURL: API_BASE,
        headers: { Authorization: `Bearer ${token}` }
    });

    // 2. Register a few business clients
    console.log("Adding Clients...");
    const clients = [
        { name: "Acme Corp", email: "acme@business.com", password: "password", role: "BUSINESS" },
        { name: "Stark Industries", email: "stark@business.com", password: "password", role: "BUSINESS" }
    ];
    for (let c of clients) {
        try { await axios.post(`${API_BASE}/auth/register`, c); } catch (e) { }
    }

    // 3. Register Suppliers
    console.log("Adding Suppliers...");
    const suppliers = [
        { name: "Global Tech Supplies", contactEmail: "sales@gts.com", phone: "1-800-555-0199", rating: 4.8 },
        { name: "Metro Industrial", contactEmail: "orders@metro-ind.com", phone: "1-800-555-0211", rating: 4.2 },
        { name: "Apex Logistics", contactEmail: "info@apex.com", phone: "1-800-555-0500", rating: 3.9 }
    ];
    for (let s of suppliers) {
        await ax.post('/suppliers', s);
    }

    // 4. Add Products
    console.log("Adding Products...");
    const products = [
        { name: "Industrial Servo Motor", description: "High torque motor", category: "Machinery", stockLevel: 45, reorderThreshold: 20, basePrice: 450.00 },
        { name: "Lithium Battery Pack", description: "12V 100Ah", category: "Electronics", stockLevel: 15, reorderThreshold: 25, basePrice: 300.00 },
        { name: "Carbon Fiber Sheets", description: "1m x 1m weave", category: "Raw Materials", stockLevel: 80, reorderThreshold: 50, basePrice: 120.50 },
        { name: "Precision Ball Bearings", description: "Stainless steel 10mm", category: "Machinery", stockLevel: 12, reorderThreshold: 200, basePrice: 15.00 },
        { name: "Copper Wiring Spool", description: "500m AWG 16", category: "Electronics", stockLevel: 8, reorderThreshold: 10, basePrice: 85.00 }
    ];
    let createdProducts = [];
    for (let p of products) {
        const res = await ax.post('/products', p);
        createdProducts.push(res.data);
    }

    // 5. Place Orders & Process them for Revenue
    console.log("Adding Orders...");
    const orders = [
        { productId: createdProducts[0].id, quantity: 5, status: 'DELIVERED' }, // Revenue: 2250
        { productId: createdProducts[1].id, quantity: 10, status: 'DELIVERED' }, // Revenue: 3000
        { productId: createdProducts[2].id, quantity: 20, status: 'SHIPPED' }, // Processing
        { productId: createdProducts[3].id, quantity: 150, status: 'PENDING' }, // Pending
        { productId: createdProducts[4].id, quantity: 10, status: 'DELIVERED' } // Revenue: 850
    ];

    // Note: Since our backend currently requires userId on order placement based on the simplified endpoint
    // We will find a user ID. Usually admin is ID = 1.
    for (let o of orders) {
        try {
            const orderRes = await ax.post('/orders', {
                userId: 1,
                items: [{ productId: o.productId, quantity: o.quantity }]
            });
            const orderId = orderRes.data.id;

            // Auto update statuses
            if (o.status !== 'PENDING') {
                if (o.status === 'DELIVERED') {
                    await ax.put(`/orders/${orderId}/status?status=SHIPPED`);
                    await ax.put(`/orders/${orderId}/status?status=DELIVERED`);
                } else if (o.status === 'SHIPPED') {
                    await ax.put(`/orders/${orderId}/status?status=SHIPPED`);
                }
            }
        } catch (e) {
            console.error("Order error", e.message);
        }
    }

    console.log("✅ Seeding Complete! Refresh the dashboard.");
}

seed();
