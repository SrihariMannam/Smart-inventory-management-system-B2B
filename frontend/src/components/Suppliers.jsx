import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Trash2, Mail } from 'lucide-react';
import Sidebar from './Sidebar';
import api from '../api';

const Suppliers = () => {
    const { user, logout } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', contactEmail: '', phone: '', rating: 5.0 });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        const res = await api.get('/suppliers');
        setSuppliers(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
        if (!emailRegex.test(formData.contactEmail)) {
            setError("Strict validation: Contact email MUST be a valid @gmail.com address.");
            return;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError("Strict validation: Phone number must be exactly 10 digits (e.g. 9876543210).");
            return;
        }

        try {
            await api.post('/suppliers', formData);
            setShowForm(false);
            fetchSuppliers();
            setFormData({ name: '', contactEmail: '', phone: '', rating: 5.0 });
        } catch (err) {
            setError("Failed to create supplier");
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this supplier?')) {
            await api.delete(`/suppliers/${id}`);
            fetchSuppliers();
        }
    }

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
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Supplier Network</h2>
                        </div>
                        {user?.role === 'ADMIN' && (
                            <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <Plus size={18} /> Add Supplier
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
                            <h3 className="font-medium text-lg mb-4">New Supplier</h3>
                            {error && (
                                <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100 mb-4 font-medium">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                                <input placeholder="Company Name" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="border p-2 rounded" />
                                <input placeholder="Contact Email" type="email" value={formData.contactEmail} onChange={e=>setFormData({...formData, contactEmail: e.target.value})} className="border p-2 rounded" />
                                <input placeholder="Phone" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="border p-2 rounded" />
                                <input type="number" step="0.1" min="1" max="5" placeholder="Rating" value={formData.rating} onChange={e=>setFormData({...formData, rating: parseFloat(e.target.value)})} className="border p-2 rounded" />
                                <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded">Save</button>
                            </form>
                        </div>
                    )}

                    <div className="bg-white border text-left border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 border-b">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Company</th>
                                    <th className="px-6 py-3 font-medium">Contact</th>
                                    <th className="px-6 py-3 font-medium">Phone</th>
                                    <th className="px-6 py-3 font-medium">Rating</th>
                                    <th className="px-6 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {suppliers.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{s.contactEmail}</td>
                                        <td className="px-6 py-4 text-gray-500">{s.phone}</td>
                                        <td className="px-6 py-4 text-amber-500 font-medium">★ {s.rating}</td>
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <a href={`mailto:${s.contactEmail}`} className="text-gray-400 hover:text-indigo-600 transition-colors p-1" title="Email Supplier">
                                                <Mail size={16} />
                                            </a>
                                            {user?.role === 'ADMIN' && (
                                                <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete Supplier"><Trash2 size={16}/></button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};
export default Suppliers;
