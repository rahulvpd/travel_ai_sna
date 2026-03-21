/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('tourism_user');
        if (storedUser) {
            setTimeout(() => {
                setUser(JSON.parse(storedUser));
                setLoading(false);
            }, 0);
        } else {
            setTimeout(() => setLoading(false), 0);
        }
    }, []);

    const login = (email, password) => {
        // Mock login - in real app, fetch from API
        if (password === 'password') { // Simple mock validation
            const userData = {
                id: Date.now(),
                name: email.split('@')[0],
                email: email,
                avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=ffcc00&color=000`
            };
            setUser(userData);
            localStorage.setItem('tourism_user', JSON.stringify(userData));
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials' };
    };

    const signup = (name, email) => {
        // Mock signup
        const userData = {
            id: Date.now(),
            name: name,
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${name}&background=ffcc00&color=000`
        };
        setUser(userData);
        localStorage.setItem('tourism_user', JSON.stringify(userData));
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('tourism_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
