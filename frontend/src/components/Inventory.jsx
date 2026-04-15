import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import Sidebar from './Sidebar';
import api from '../api';

const Inventory = () => {
    const { user, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', category: '', stockLevel: 0, reorderThreshold: 10, basePrice: 0 });
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [editError, setEditError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const res = await api.get('/products');
        setProducts(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);
        try {
            await api.post('/products', formData);
            setFormSuccess('Product saved and CSV updated!');
            fetchProducts();
            setFormData({ name: '', description: '', category: '', stockLevel: 0, reorderThreshold: 10, basePrice: 0 });
            setTimeout(() => { setShowForm(false); setFormSuccess(null); }, 1500);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.status || err.message;
            setFormError(`Failed to save product: ${msg}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await api.delete(`/products/${id}`);
            fetchProducts();
        }
    };

    const startEdit = (product) => {
        setEditingId(product.id);
        setEditData({
            name: product.name,
            description: product.description || '',
            category: product.category || '',
            stockLevel: product.stockLevel,
            reorderThreshold: product.reorderThreshold,
            basePrice: product.basePrice,
        });
        setEditError(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
        setEditError(null);
    };

    const handleEditSave = async (id) => {
        setEditError(null);
        try {
            await api.put(`/products/${id}`, editData);
            setEditingId(null);
            fetchProducts();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.status || err.message;
            setEditError(`Save failed: ${msg}`);
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
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => { setShowForm(!showForm); setFormError(null); setFormSuccess(null); }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Plus size={18} /> Add Product
                            </button>
                        )}
                    </div>

                    {/* Add Product Form */}
                    {showForm && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
                            <h3 className="font-medium text-lg mb-4">New Product</h3>
                            {formError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 font-medium">
                                    ⚠️ {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3 mb-4 font-medium">
                                    ✅ {formSuccess}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                                <input placeholder="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="border p-2 rounded" />
                                <input placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="border p-2 rounded" />
                                <input type="number" placeholder="Stock Level" value={formData.stockLevel} onChange={e => setFormData({...formData, stockLevel: parseInt(e.target.value)})} className="border p-2 rounded" />
                                <input type="number" placeholder="Reorder Threshold" value={formData.reorderThreshold} onChange={e => setFormData({...formData, reorderThreshold: parseInt(e.target.value)})} className="border p-2 rounded" />
                                <input type="number" step="0.01" placeholder="Base Price ($)" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})} className="border p-2 rounded" />
                                <input placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="border p-2 rounded" />
                                <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors font-medium">Save Product</button>
                            </form>
                        </div>
                    )}

                    {/* Products Table */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Name</th>
                                    <th className="px-6 py-3 font-medium">Category</th>
                                    <th className="px-6 py-3 font-medium">Stock</th>
                                    <th className="px-6 py-3 font-medium">Price</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map(p => (
                                    editingId === p.id ? (
                                        // ── INLINE EDIT ROW ──
                                        <tr key={p.id} className="bg-indigo-50/40">
                                            <td className="px-4 py-3">
                                                <input
                                                    value={editData.name}
                                                    onChange={e => setEditData({...editData, name: e.target.value})}
                                                    className="border border-indigo-200 rounded px-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    value={editData.category}
                                                    onChange={e => setEditData({...editData, category: e.target.value})}
                                                    className="border border-indigo-200 rounded px-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={editData.stockLevel}
                                                        onChange={e => setEditData({...editData, stockLevel: parseInt(e.target.value)})}
                                                        className="border border-indigo-200 rounded px-2 py-1 w-20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                        placeholder="Stock"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={editData.reorderThreshold}
                                                        onChange={e => setEditData({...editData, reorderThreshold: parseInt(e.target.value)})}
                                                        className="border border-indigo-200 rounded px-2 py-1 w-20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                        placeholder="Min"
                                                    />
                                                </div>
                                                {editError && <p className="text-red-500 text-xs mt-1">{editError}</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editData.basePrice}
                                                    onChange={e => setEditData({...editData, basePrice: parseFloat(e.target.value)})}
                                                    className="border border-indigo-200 rounded px-2 py-1 w-28 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEditSave(p.id)} title="Save changes" className="p-1.5 bg-green-100 text-green-700 border border-green-200 rounded hover:bg-green-200 transition-colors shadow-sm">
                                                        <Check size={15}/>
                                                    </button>
                                                    <button onClick={cancelEdit} title="Cancel" className="p-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded hover:bg-gray-200 transition-colors shadow-sm">
                                                        <X size={15}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        // ── NORMAL DISPLAY ROW ──
                                        <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{p.category}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stockLevel <= p.reorderThreshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {p.stockLevel} (Min: {p.reorderThreshold})
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-emerald-600 font-semibold">${p.basePrice}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => startEdit(p)} title="Edit product" className="p-1.5 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded hover:bg-indigo-100 transition-colors shadow-sm">
                                                        <Edit2 size={15}/>
                                                    </button>
                                                    {user?.role === 'ADMIN' && (
                                                        <button onClick={() => handleDelete(p.id)} title="Delete product" className="p-1.5 text-red-500 bg-red-50 border border-red-100 rounded hover:bg-red-100 transition-colors shadow-sm">
                                                            <Trash2 size={15}/>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};
export default Inventory;
