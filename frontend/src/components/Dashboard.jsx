import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import api from '../api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [summary, setSummary] = useState({
        totalProducts: 0,
        lowStockAlerts: 0,
        totalOrders: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get('/analytics/summary');
                setSummary(res.data);
            } catch (err) {
                console.error("Failed to load analytics");
            }
        };
        fetchSummary();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                        SmartInventory
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-right">
                            <p className="font-medium text-gray-900">{user?.name}</p>
                            <p className="text-gray-500 text-xs capitalize">{user?.role?.toLowerCase()}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex max-w-7xl mx-auto">
                <Sidebar />
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 w-full overflow-hidden">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                        <p className="text-gray-500">Real-time metrics from your inventory & orders.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Products</h3>
                            <p className="text-3xl font-bold text-gray-900">{summary.totalProducts}</p>
                        </div>
                        {(user?.role === 'ADMIN' || user?.role === 'SUPPLIER') && (
                            <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm transition hover:shadow-md">
                                <h3 className="text-sm font-medium text-red-500 mb-1">Low Stock Alerts</h3>
                                <p className="text-3xl font-bold text-red-600">{summary.lowStockAlerts}</p>
                            </div>
                        )}
                        {(user?.role === 'ADMIN' || user?.role === 'BUSINESS') && (
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
                                <p className="text-3xl font-bold text-indigo-600">{summary.totalOrders}</p>
                            </div>
                        )}
                        {user?.role === 'ADMIN' && (
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
                                <p className="text-3xl font-bold text-emerald-600">${summary.totalRevenue}</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
