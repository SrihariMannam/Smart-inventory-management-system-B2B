import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();
    let visibleNavItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Inventory', path: '/inventory', icon: <Package size={20} /> },
    ];
    
    if (user?.role === 'ADMIN' || user?.role === 'BUSINESS') {
        visibleNavItems.push({ name: 'Orders', path: '/orders', icon: <ShoppingCart size={20} /> });
    }
    
    if (user?.role === 'ADMIN' || user?.role === 'SUPPLIER') {
        visibleNavItems.push({ name: 'Suppliers', path: '/suppliers', icon: <Users size={20} /> });
        visibleNavItems.push({ name: 'Restock Requests', path: '/restock', icon: <Truck size={20} /> });
    }

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16 hidden md:block">
            <nav className="p-4 space-y-2 text-sm font-medium">
                {visibleNavItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`
                        }
                    >
                        {item.icon}
                        {item.name}
                    </NavLink>
                ))}
            </nav>
            <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
                <NavLink to="/settings" className={({isActive}) => `flex items-center gap-3 px-4 py-3 text-sm font-medium w-full rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                    <Settings size={20} />
                    Settings
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
