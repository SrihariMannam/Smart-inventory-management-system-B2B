import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Mail, Shield, Save, X } from 'lucide-react';
import Sidebar from './Sidebar';
import api from '../api';

const Settings = () => {
    const { user, login, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/users/me', { name });
            const token = localStorage.getItem('token');
            login({ ...user, name }, token); // update global context
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsSaving(false);
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
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 w-full">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
                        <p className="text-gray-500 mt-1">Manage your profile and platform preferences.</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
                        <h3 className="text-lg font-semibold border-b pb-4 mb-6 text-gray-800">Personal Information</h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                                        <User size={24} />
                                    </div>
                                    <div className="flex-1 max-w-sm">
                                        <p className="text-sm text-gray-500 font-medium pb-1">Full Name</p>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={name} 
                                                onChange={(e) => setName(e.target.value)} 
                                                className="w-full font-medium text-gray-900 text-lg border-b-2 border-indigo-500 focus:outline-none bg-indigo-50/30 px-2 py-1 rounded-t"
                                            />
                                        ) : (
                                            <p className="font-medium text-gray-900 text-lg">{user?.name}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Email Address</p>
                                        <p className="font-medium text-gray-900 text-lg">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Account Role Validation</p>
                                        <p className="font-medium text-gray-900 text-lg">{user?.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t flex justify-end gap-3">
                            {isEditing ? (
                                <>
                                    <button onClick={() => { setIsEditing(false); setName(user?.name); }} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-medium transition-colors">
                                        <X size={18}/> Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
                                        <Save size={18}/> {isSaving ? "Saving..." : "Save Profile"}
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-6 py-2.5 rounded-lg font-medium transition-colors">
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;
