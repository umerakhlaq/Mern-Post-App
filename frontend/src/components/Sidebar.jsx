import { Home, PlusSquare, User, LogOut, LogIn, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Sidebar() {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        { name: "Home", icon: Home, path: "/" },
        { name: "Create", icon: PlusSquare, path: "/create" },
        { name: "Profile", icon: User, path: "/profile" },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#09090b] border-r border-white/5 p-6 z-50">
                <Link to="/" className="flex items-center gap-2 mb-12 group">
                    <div className="bg-accent p-2 rounded-xl group-hover:rotate-12 transition-transform">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">PostApp</h1>
                </Link>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.name} to={item.path} className="relative block group">
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-accent/10 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className={`relative flex items-center gap-3 p-3.5 rounded-xl transition-colors font-medium
                                    ${isActive ? "text-accent" : "text-gray-400 hover:text-white hover:bg-white/5"}
                                `}>
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {user ? (
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 p-3.5 text-red-500 hover:bg-red-500/10 rounded-xl mt-auto transition-colors font-medium w-full"
                    >
                        <LogOut size={22} />
                        Logout
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className="flex items-center gap-3 p-3.5 text-green-500 hover:bg-green-500/10 rounded-xl mt-auto transition-colors font-medium"
                    >
                        <LogIn size={22} />
                        Login
                    </Link>
                )}
            </div>

            {/* Mobile Bottom Bar */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-[#18181B]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-around z-50 shadow-2xl">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link key={item.name} to={item.path}
                            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all
                            ${isActive ? "text-accent bg-accent/10 scale-110" : "text-gray-500 hover:text-gray-300"}
                        `}>
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        </Link>
                    )
                })}
                {user ? (
                    <button onClick={logout} className="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-gray-500 hover:text-red-500 transition-all">
                        <LogOut size={24} />
                    </button>
                ) : (
                    <Link to="/login" className="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-gray-500 hover:text-green-500 transition-all">
                        <LogIn size={24} />
                    </Link>
                )}
            </div>
        </>
    );
}
