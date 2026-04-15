import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Check, X, RefreshCw } from 'lucide-react';
import Sidebar from './Sidebar';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

const Orders = () => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    
    // For placing an order
    const [selectedProduct, setSelectedProduct] = useState('');
    const [orderQuantity, setOrderQuantity] = useState(1);

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    const fetchOrders = async () => {
        const res = await api.get('/orders');
        setOrders(res.data);
    };

    const fetchProducts = async () => {
        const res = await api.get('/products');
        setProducts(res.data);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if(!selectedProduct) return;
        
        // We need userId from token or hardcode for demo
        let userId = 1; // Simplification or retrieve from API
        
        try{
            await api.post('/orders', {
                userId: userId,
                items: [{productId: parseInt(selectedProduct), quantity: orderQuantity}]
            });
            fetchOrders();
            setSelectedProduct('');
            setOrderQuantity(1);
        }catch(e){
            console.error("Order placement failed");
        }
    }

    const updateStatus = async (id, status) => {
        await api.put(`/orders/${id}/status?status=${status}`);
        fetchOrders();
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        <div className="md:col-span-1 h-fit bg-white p-6 border rounded-xl shadow-sm">
                            <h3 className="text-lg font-bold mb-4 text-gray-900">Place Bulk Order</h3>
                            <form onSubmit={handlePlaceOrder} className="space-y-4">
                                <select value={selectedProduct} onChange={e=>setSelectedProduct(e.target.value)} required className="w-full border p-2 rounded">
                                    <option value="" disabled>Select Product to Order</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <input type="number" min="1" value={orderQuantity} onChange={e=>setOrderQuantity(parseInt(e.target.value))} required className="w-full border p-2 rounded" placeholder="Quantity"/>
                                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Submit Request</button>
                            </form>
                        </div>

                        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-fit">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-semibold text-gray-800">Order History</h3>
                                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{orders.length} Total Orders</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Order ID</th>
                                            <th className="px-6 py-3 font-medium">Items Count</th>
                                            <th className="px-6 py-3 font-medium">Total Cost</th>
                                            <th className="px-6 py-3 font-medium">Status</th>
                                            <th className="px-6 py-3 font-medium text-right">Admin Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map(o => {
                                            const totalItems = o.items ? o.items.reduce((sum, item) => sum + item.quantity, 0) : '-';
                                            return (
                                            <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900 border-l-[3px] border-transparent hover:border-indigo-500 pl-2">
                                                        #{o.id}
                                                    </div>
                                                    {o.items && o.items.length > 0 && (
                                                        <div className="text-xs text-gray-400 mt-1 pl-2 line-clamp-1 max-w-[220px]" title={o.items.map(i => `${i.product?.name} (x${i.quantity})`).join(', ')}>
                                                            {o.items.map(i => `${i.product?.name} (x${i.quantity})`).join(', ')}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center gap-1 font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md text-xs">
                                                        <span>{totalItems}</span>
                                                        <span className="text-gray-500 font-normal">units</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-emerald-600 font-semibold tracking-tight">
                                                    ${o.totalAmount?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium tracking-wide uppercase shadow-sm
                                                        ${o.status === 'DELIVERED' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                        o.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                        o.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 flex justify-end gap-2">
                                                    {user?.role === 'ADMIN' && o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                                                        <>
                                                            <button title="Mark Shipped" onClick={()=>updateStatus(o.id, 'SHIPPED')} className="p-1.5 text-blue-600 bg-blue-50 border border-blue-100 outline-none hover:bg-blue-100 hover:border-blue-200 transition-colors rounded shadow-sm"><RefreshCw size={15} /></button>
                                                            <button title="Mark Delivered" onClick={()=>updateStatus(o.id, 'DELIVERED')} className="p-1.5 text-green-600 bg-green-50 border border-green-100 outline-none hover:bg-green-100 hover:border-green-200 transition-colors rounded shadow-sm"><Check size={15}/></button>
                                                            <button title="Cancel Order" onClick={()=>updateStatus(o.id, 'CANCELLED')} className="p-1.5 text-red-600 bg-red-50 border border-red-100 outline-none hover:bg-red-100 hover:border-red-200 transition-colors rounded shadow-sm"><X size={15}/></button>
                                                        </>
                                                    )}
                                                    {user?.role !== 'ADMIN' && <span className="text-gray-300 italic text-xs flex items-center justify-end">Restricted</span>}
                                                </td>
                                            </tr>
                                        )})}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
export default Orders;
