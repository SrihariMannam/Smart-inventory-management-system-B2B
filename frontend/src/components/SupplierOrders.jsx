import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, AlertTriangle, Plus, PackageCheck, Send } from 'lucide-react';
import Sidebar from './Sidebar';
import api from '../api';

const SupplierOrders = () => {
    const { user, logout } = useAuth();
    const [lowStockItems, setLowStockItems] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [showPropose, setShowPropose] = useState(false);
    const [proposeData, setProposeData] = useState({ name: '', category: '', stockLevel: 100, reorderThreshold: 20, basePrice: 0, description: '' });
    const [proposeError, setProposeError] = useState(null);
    const [proposeSuccess, setProposeSuccess] = useState(null);
    const [fulfillSuccess, setFulfillSuccess] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [alertsRes, productsRes] = await Promise.all([
            api.get('/products/alerts/low-stock'),
            api.get('/products'),
        ]);
        setLowStockItems(alertsRes.data);
        setAllProducts(productsRes.data);
    };

    // Supplier "fulfills" a restock by updating stock level
    const handleFulfill = async (product) => {
        const restockQty = product.reorderThreshold * 2;
        try {
            await api.put(`/products/${product.id}`, {
                ...product,
                stockLevel: product.stockLevel + restockQty,
            });
            setFulfillSuccess(prev => ({ ...prev, [product.id]: `Restocked +${restockQty} units!` }));
            fetchData();
            setTimeout(() => setFulfillSuccess(prev => ({ ...prev, [product.id]: null })), 3000);
        } catch (err) {
            console.error('Fulfill failed', err);
        }
    };

    const handlePropose = async (e) => {
        e.preventDefault();
        setProposeError(null);
        setProposeSuccess(null);
        try {
            await api.post('/products', proposeData);
            setProposeSuccess('Product proposal submitted! Admin can now see it in inventory.');
            setProposeData({ name: '', category: '', stockLevel: 100, reorderThreshold: 20, basePrice: 0, description: '' });
            fetchData();
            setTimeout(() => { setShowPropose(false); setProposeSuccess(null); }, 2000);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.status || err.message;
            setProposeError(`Submission failed: ${msg}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">SmartInventory</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-right">
                            <p className="font-medium text-gray-900">{user?.name}</p>
                            <p className="text-gray-500 text-xs capitalize">{user?.role?.toLowerCase()}</p>
                        </div>
                        <button onClick={logout} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><LogOut size={20} /></button>
                    </div>
                </div>
            </header>

            <div className="flex max-w-7xl mx-auto">
                <Sidebar />
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 w-full overflow-hidden">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Restock Requests</h2>
                            <p className="text-sm text-gray-500 mt-1">Products below reorder threshold that need supplier fulfillment</p>
                        </div>
                        <button
                            onClick={() => { setShowPropose(!showPropose); setProposeError(null); setProposeSuccess(null); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Plus size={18} /> Propose New Product
                        </button>
                    </div>

                    {/* Propose Product Form */}
                    {showPropose && (
                        <div className="bg-white p-6 rounded-xl border border-indigo-100 mb-8 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-1">Propose a New Product</h3>
                            <p className="text-xs text-gray-400 mb-4">Submit a new product to the catalog. Admin and Business clients will be able to see and order it.</p>
                            {proposeError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">⚠️ {proposeError}</div>}
                            {proposeSuccess && <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3 mb-4">✅ {proposeSuccess}</div>}
                            <form onSubmit={handlePropose} className="grid grid-cols-2 gap-4">
                                <input required placeholder="Product Name" value={proposeData.name} onChange={e => setProposeData({...proposeData, name: e.target.value})} className="border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                                <input placeholder="Category (e.g. Electronics)" value={proposeData.category} onChange={e => setProposeData({...proposeData, category: e.target.value})} className="border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                                <input type="number" placeholder="Initial Stock Level" value={proposeData.stockLevel} onChange={e => setProposeData({...proposeData, stockLevel: parseInt(e.target.value)})} className="border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                                <input type="number" placeholder="Reorder Threshold" value={proposeData.reorderThreshold} onChange={e => setProposeData({...proposeData, reorderThreshold: parseInt(e.target.value)})} className="border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                                <input type="number" step="0.01" placeholder="Offered Price ($)" value={proposeData.basePrice} onChange={e => setProposeData({...proposeData, basePrice: parseFloat(e.target.value)})} className="border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                                <input placeholder="Short Description" value={proposeData.description} onChange={e => setProposeData({...proposeData, description: e.target.value})} className="border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                                <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-medium flex items-center justify-center gap-2 transition-colors">
                                    <Send size={16} /> Submit Proposal
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Low Stock Restock Requests */}
                    <div className="mb-8">
                        {lowStockItems.length === 0 ? (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-8 text-center text-green-600">
                                <PackageCheck size={32} className="mx-auto mb-2 opacity-70" />
                                <p className="font-medium">All products are well stocked!</p>
                                <p className="text-sm text-green-500 mt-1">No restock requests pending at this time.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {lowStockItems.map(p => (
                                    <div key={p.id} className="bg-white border border-amber-100 rounded-xl p-5 shadow-sm flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                                                <AlertTriangle size={20} className="text-amber-500" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{p.name}</p>
                                                <p className="text-xs text-gray-400">{p.category}</p>
                                                <div className="flex gap-3 mt-1.5">
                                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                                        Current Stock: {p.stockLevel}
                                                    </span>
                                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                        Min Required: {p.reorderThreshold}
                                                    </span>
                                                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                                        ${p.basePrice}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2 shrink-0">
                                            {fulfillSuccess[p.id] ? (
                                                <span className="text-green-600 text-xs font-medium bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">✅ {fulfillSuccess[p.id]}</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleFulfill(p)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-1.5"
                                                >
                                                    <PackageCheck size={15} />
                                                    Fulfill Restock (+{p.reorderThreshold * 2} units)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Full Inventory Overview */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Full Inventory Overview</h3>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Product</th>
                                        <th className="px-6 py-3 font-medium">Category</th>
                                        <th className="px-6 py-3 font-medium">Stock Status</th>
                                        <th className="px-6 py-3 font-medium">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {allProducts.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{p.category}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.stockLevel <= p.reorderThreshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {p.stockLevel <= p.reorderThreshold ? '⚠ Low' : '✓ OK'} — {p.stockLevel} units (Min: {p.reorderThreshold})
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-emerald-600 font-semibold">${p.basePrice}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
export default SupplierOrders;
