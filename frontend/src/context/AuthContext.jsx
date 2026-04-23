import { createContext, useContext, useEffect, useState } from "react";
import {BASE_URL} from '../utils/constants'
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch(`${BASE_URL}/profile`, {
                credentials: "include",
            });

            if (!res.ok) {
                setUser(null);
                return;
            }

            const data = await res.json();
            if (data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        checkAuth();
    };

    const logout = async () => {
        try {
            await fetch(`${BASE_URL}/logout`, {
                method: "POST",
                credentials: "include",
            });
            setUser(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, checkAuth, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
