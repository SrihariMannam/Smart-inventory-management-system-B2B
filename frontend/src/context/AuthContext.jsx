import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // The backend uses 'sub' for email. We don't have role packed in token by default, 
                // but we can parse it if we added it, or rely on localstorage info
                const storedRole = localStorage.getItem('role');
                const storedName = localStorage.getItem('name');
                setUser({ email: decoded.sub, role: storedRole, name: storedName });
            } catch (err) {
                console.error("Invalid token");
                localStorage.clear();
            }
        }
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', userData.role);
        localStorage.setItem('name', userData.name);
        setUser(userData);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
