import { useState, useEffect } from "react";
import { Bell, Heart, UserPlus, MessageCircle, AtSign, Star, Zap, User, Radio, Activity, Sparkles, Layers, Settings, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Notifications() {
    const [filter, setFilter] = useState("all"); 
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { socket } = useSocket() || {};

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    // Socket listener for real-time notifications
    useEffect(() => {
        if (!socket) return;

        socket.on('new-notification', (data) => {
            console.log('New notification received:', data);
            toast.success(`New ${data.type} notification!`);
            // Add new notification to the top of the list
            setNotifications(prev => [data.data, ...prev]);
        });

        return () => {
            socket.off('new-notification');
        };
    }, [socket]);

    // Socket listener for notification deletion (unfollow, unlike, etc)
    useEffect(() => {
        if (!socket) return;

        socket.on('notification-deleted', (data) => {
            console.log('Notification deleted:', data);
            // Remove the notification from the list
            setNotifications(prev => 
                prev.filter(notif => 
                    !(notif.type === data.type && 
                      notif.sender?._id === data.senderId)
                )
            );
            toast.success(`${data.type} undone`);
        });

        return () => {
            socket.off('notification-deleted');
        };
    }, [socket]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/notifications`, {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                markAsRead();
            }
        } catch (error) {
            console.error("Signal interrupt", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        try {
            await fetch(`${BASE_URL}/notifications/read`, {
                method: "PUT",
                credentials: "include"
            });
        } catch (error) {
            console.error("Failed to sync read status");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <Zap className="h-4 w-4 md:h-5 md:w-5 text-vibe-accent fill-current" />;
            case 'follow': return <UserPlus className="h-4 w-4 md:h-5 md:w-5 text-vibe-secondary fill-current" />;
            case 'reply': return <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-vibe-primary fill-current" />;
            case 'mention': return <AtSign className="h-4 w-4 md:h-5 md:w-5 text-indigo-400" />;
            case 'broadcast': return <Radio className="h-4 w-4 md:h-5 md:w-5 text-amber-400" />;
            default: return <Bell className="h-4 w-4 md:h-5 md:w-5 text-zinc-400" />;
        }
    };

    const filteredNotifications = filter === "all"
        ? notifications
        : notifications.filter(n => (n.type === "reply" || n.type === "mention") || n.type === "broadcast");

    if (!user) {
        return (
            <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-6 md:p-10 text-center font-display">
                <div className="max-w-xs space-y-6">
                   <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-[24px] md:rounded-[32px] mx-auto flex items-center justify-center border border-white/10">
                        <Lock className="text-zinc-600" size={28} />
                   </div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase">Login Required</h3>
                   <p className="text-zinc-500 font-medium text-sm md:text-base">Log in to see your notifications.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white pb-32 md:pb-0 font-display">
            {/* Signal Header */}
            <div className="sticky top-0 z-30 bg-[#030303]/40 backdrop-blur-2xl border-b border-white/5">
                <div className="px-5 md:px-8 py-4 md:py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 md:p-2.5 bg-vibe-primary/20 rounded-xl md:rounded-2xl relative">
                            <Activity size={18} className="text-vibe-primary animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-vibe-accent rounded-full border-2 border-[#030303] shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black tracking-tighter leading-none uppercase">NOTIFICATIONS</h2>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-zinc-500 mt-1 md:mt-1.5 flex items-center gap-1.5">
                                <Layers size={8} className="text-vibe-accent" /> Recent activity
                            </p>
                        </div>
                    </div>
                    <button className="p-2.5 md:p-3 hover:bg-white/5 rounded-xl md:rounded-2xl transition-all text-zinc-500 hover:text-white active:scale-90">
                        <Settings size={20} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Filter Subsurface */}
                <div className="flex px-5 md:px-8 gap-6 md:gap-8 overflow-x-auto scrollbar-hide border-t border-white/5">
                    {['All', 'Mentions'].map((tab) => {
                        const id = tab === 'All' ? "all" : "mentions";
                        return (
                            <button
                                key={id}
                                onClick={() => setFilter(id)}
                                className={`py-4 md:py-6 whitespace-nowrap text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] relative transition-all ${filter === id ? "text-white" : "text-zinc-600 hover:text-zinc-300"}`}
                            >
                                {tab}
                                {filter === id && (
                                    <motion.div 
                                        layoutId="notifTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-vibe-primary rounded-full shadow-[0_0_15px_rgba(139,92,246,0.8)]" 
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {loading ? (
                <div className="p-20 flex flex-col items-center gap-6">
                    <div className="w-10 h-10 border-2 border-vibe-primary/20 border-t-vibe-primary rounded-full animate-spin" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Syncing Stream...</span>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto py-4 md:py-6 px-4 md:px-0">
                    <AnimatePresence mode="popLayout">
                        {filteredNotifications.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-40 text-center flex flex-col items-center gap-10"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-vibe-primary/10 blur-3xl rounded-full" />
                                    <motion.div 
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 5, repeat: Infinity }}
                                        className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center border border-white/10 relative z-10"
                                    >
                                        <Bell size={40} className="text-zinc-700 opacity-50" strokeWidth={1} />
                                    </motion.div>
                                </div>
                                <div className="max-w-xs mx-auto">
                                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight">NO NOTIFICATIONS</h3>
                                    <p className="text-zinc-500 font-medium leading-relaxed">No notifications yet.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="grid gap-3">
                                {filteredNotifications.map((notif, index) => (
                                    <motion.div
                                        key={notif._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            to={notif.post ? `/post/${notif.post._id || notif.post}` : (notif.type === 'broadcast' ? '#' : `/user/${notif.sender?._id}`)}
                                            className={`group relative flex gap-5 p-6 rounded-[32px] border transition-all ${!notif.read ? 'bg-vibe-primary/[0.04] border-vibe-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.05)]' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}`}
                                            onClick={(e) => notif.type === 'broadcast' && e.preventDefault()}
                                        >
                                            {/* Type Icon Sublayer */}
                                            <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border ${!notif.read ? 'bg-vibe-primary/20 border-vibe-primary/30' : 'bg-black/50 border-white/5'}`}>
                                                {getIcon(notif.type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                {notif.type === 'broadcast' ? (
                                                    // Broadcast notification layout
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10 shadow-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                                                <Radio size={14} className="text-white" />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">ADMIN BROADCAST</span>
                                                            <span className="text-[9px] font-black tracking-widest text-zinc-700 ml-auto">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h4 className="text-[17px] font-black text-white">{notif.title}</h4>
                                                            <p className="text-zinc-400 text-sm leading-relaxed">{notif.message}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Regular notification layout
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                                                                <img
                                                                    src={notif.sender?.photoUrl || `https://ui-avatars.com/api/?name=${notif.sender?.name || 'V'}&background=8B5CF6&color=fff&bold=true`}
                                                                    alt={notif.sender?.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">ID: {notif.sender?.name || 'entity'}</span>
                                                            <span className="text-[9px] font-black tracking-widest text-zinc-700 ml-auto">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>

                                                        <div className="text-[17px] font-medium leading-tight">
                                                            <span className="font-black text-white group-hover:text-vibe-primary transition-colors">{notif.sender?.name}</span>
                                                            <span className="text-zinc-400">
                                                                {notif.type === 'like' && ' liked your post'}
                                                                {notif.type === 'follow' && ' followed you'}
                                                                {notif.type === 'reply' && ' replied to your post'}
                                                                {notif.type === 'mention' && ' mentioned you'}
                                                            </span>
                                                        </div>

                                                        {notif.post?.content && (
                                                            <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-white/5 text-zinc-500 text-sm line-clamp-2 font-light italic">
                                                                {notif.post.content}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {!notif.read && (
                                                <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-vibe-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                                            )}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
