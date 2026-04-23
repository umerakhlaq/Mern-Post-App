
import { Home, Compass, Bell, User, LogOut, Plus, Search, MoreVertical, Settings, Heart, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";
import Brand from "./Brand";

export default function Sidebar() {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();
    const { socket } = useSocket() || {};
    const [unreadCount, setUnreadCount] = useState(0);

    const navItems = [
        { name: "Home", icon: Home, path: "/" },
        { name: "Explore", icon: Compass, path: "/explore" },
        { name: "Notifications", icon: Bell, path: "/notifications", badge: true },
        { name: "Profile", icon: User, path: "/profile" },
    ];

    if (user?.role === "admin") {
        navItems.push({ name: "Admin", icon: Shield, path: "/admin" });
    }

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 60000);
            return () => clearInterval(interval);
        }
    }, [user, pathname]);

    // Listen for real-time notification updates
    useEffect(() => {
        if (!socket) return;

        socket.on('new-notification', (data) => {
            console.log('New notification in sidebar:', data);
            // Increment unread count
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            socket.off('new-notification');
        };
    }, [socket]);

    const fetchUnreadCount = async () => {
        try {
            const res = await fetch(`${BASE_URL}/notifications`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                const unread = data.filter(n => !n.read).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const isActive = (path) => {
        if (path === "/profile" && pathname.startsWith("/user/")) {
            const profileId = pathname.split("/user/")[1];
            return profileId === user?._id;
        }
        return pathname === path;
    };

    return (
        <div className="h-full flex flex-col">
            {/* Desktop Sidebar (Left side) */}
            <div className="hidden md:flex flex-col h-full bg-black shadow-2xl p-4 lg:p-6 w-full sticky top-0 border-r border-white/5 transition-all duration-300">
                <div className="mb-8 px-2 flex justify-center xl:justify-start">
                    <Brand isCompact={true} className="xl:hidden" />
                    <Brand isCompact={false} className="hidden xl:flex" />
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group justify-center xl:justify-start
                ${isActive(item.path)
                                    ? "bg-vibe-primary/10 text-vibe-primary font-bold shadow-[0_0_20px_rgba(139,92,246,0.1)] border border-vibe-primary/20"
                                    : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent"}
              `}
                            title={item.name}
                        >
                            <div className="relative">
                                <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
                                {item.badge && unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-vibe-accent text-white text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center ring-2 ring-black">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-lg hidden xl:inline tracking-tight">{item.name}</span>
                        </Link>
                    ))}

                    <Link
                        to="/create"
                        className="mt-8 flex items-center justify-center gap-2 bg-vibe-primary text-white rounded-2xl w-14 xl:w-full h-14 xl:h-auto py-0 xl:py-3.5 mx-auto xl:mx-0 group shadow-lg shadow-vibe-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        title="Create New Post"
                    >
                        <Plus size={24} strokeWidth={3} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                        <span className="hidden xl:inline text-base font-display">New Post</span>
                    </Link>
                </nav>

                {user && (
                    <div className="mt-auto relative group pt-6">
                        <button className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all w-full text-left justify-center xl:justify-start">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg shrink-0">
                                    <img
                                        src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.name}&background=6366F1&color=fff&bold=true`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full"></div>
                            </div>
                            <div className="hidden xl:block flex-1 min-w-0">
                                <p className="font-bold text-white truncate text-sm tracking-tight">{user.name}</p>
                                <p className="text-zinc-500 text-xs truncate">@{user.username || user.email?.split('@')[0]}</p>
                            </div>
                            <MoreVertical className="hidden xl:block text-zinc-600 shrink-0" size={16} />
                        </button>

                        <div className="absolute bottom-full mb-3 left-0 right-0 glass-card p-2 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 z-50 w-64 border border-white/10 overflow-hidden shadow-2xl">
                            <div className="px-3 py-2 border-b border-white/5 flex items-center gap-3 mb-1">
                                <img src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.name}&background=6366F1&color=fff&bold=true`} className="w-8 h-8 rounded-lg" alt="" />
                                <div className="min-w-0">
                                    <p className="font-bold text-white text-[13px] truncate">{user.name}</p>
                                    <p className="text-zinc-500 text-[11px] truncate">{user.email}</p>
                                </div>
                            </div>
                            <button className="w-full px-3 py-2.5 text-left hover:bg-white/5 text-zinc-300 text-sm font-medium rounded-xl transition-colors flex items-center gap-2">
                                <Settings size={14} /> Settings
                            </button>
                            <button onClick={logout} className="w-full px-3 py-2.5 text-left hover:bg-red-500/10 text-red-400 font-bold text-sm rounded-xl transition-colors flex items-center gap-2">
                                <LogOut size={14} /> Log out
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Bar (Bottom of screen) */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-2xl border border-white/10 px-4 py-2 flex justify-between items-center z-50 rounded-[32px] w-[92%] max-w-[420px] shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                {/* Home & Explore */}
                {navItems.slice(0, 2).map(item => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`p-3 relative rounded-2xl transition-all active:scale-95 flex items-center justify-center ${isActive(item.path) ? 'text-vibe-primary bg-vibe-primary/10' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <item.icon size={22} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                    </Link>
                ))}

                {/* Mobile Floating Action Button (Centered) */}
                <Link
                    to="/create"
                    className="p-3.5 bg-vibe-primary rounded-2xl text-white shadow-xl shadow-vibe-primary/20 active:scale-90 transition-all ring-1 ring-white/10 hover:brightness-110 flex items-center justify-center -translate-y-1"
                >
                    <Plus size={22} strokeWidth={3} />
                </Link>

                {/* Notifications & Profile */}
                {navItems.slice(2, 4).map(item => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`p-3 relative rounded-2xl transition-all active:scale-95 flex items-center justify-center ${isActive(item.path) ? 'text-vibe-primary bg-vibe-primary/10' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <item.icon size={22} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                        {item.badge && unreadCount > 0 && (
                            <span className="absolute top-2 right-2 bg-vibe-accent text-white text-[8px] font-black h-3.5 w-3.5 rounded-full flex items-center justify-center ring-2 ring-[#0a0a0a]">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}

