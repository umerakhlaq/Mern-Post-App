    import { createContext, useContext, useEffect, useState } from "react";

    const AuthContext = createContext();

    export function AuthProvider({ children }) {
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);

        // Check if user is logged in
        useEffect(() => {
            checkAuth();
        }, []);

        const checkAuth = async () => {
            try {
                const res = await fetch("http://localhost:3000/profile", {
                    credentials: "include",
                });

                if (!res.ok) {
                    // If not authenticated, stop here
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
            checkAuth(); // Re-fetch user after login
        };

        const logout = async () => {
            try {
                await fetch("http://localhost:3000/logout", {
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
            <AuthContext.Provider value={{ user, login, logout, loading }}>
                {children}
            </AuthContext.Provider>
        );
    }

    export const useAuth = () => useContext(AuthContext);
