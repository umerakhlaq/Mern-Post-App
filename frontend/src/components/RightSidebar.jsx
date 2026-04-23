
import { MoreHorizontal, Search, BadgeCheck, UserPlus, TrendingUp, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function RightSidebar() {
    const { user: currentUser } = useAuth();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const trendingTopics = [
        { topic: "VibeRebrand", posts: "42.5k vibes", category: "Trending" },
        { topic: "NextGenSocial", posts: "18.2k vibes", category: "Technology" },
        { topic: "GlassUI", posts: "12.1k vibes", category: "Design" },
        { topic: "React19", posts: "98k vibes", category: "Frameworks" },
    ];

    useEffect(() => {
        if (currentUser) {
            fetchSuggestions();
        }
    }, [currentUser]);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/users/suggestions`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setSuggestions(data);
            }
        } catch (error) {
            console.error("Failed to fetch suggestions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (userId) => {
        try {
            const res = await fetch(`${BASE_URL}/user/${userId}/follow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            if (res.ok) {
                toast.success("Joined their vibe!");
                setSuggestions(prev => prev.filter(u => u._id !== userId));
            } else {
                toast.error("Failed to follow");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    return (
        <div className="w-full h-full pr-6 py-6 hidden lg:block sticky top-0">
            {/* Search */}
            <div className="relative mb-8 group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-vibe-primary transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Search Vibe..."
                    className="w-full bg-zinc-900/40 backdrop-blur-md text-sm text-white placeholder-zinc-600 rounded-2xl py-3.5 pl-11 pr-4 outline-none border border-white/5 focus:border-vibe-primary/50 focus:bg-zinc-900/60 transition-all font-display"
                />
            </div>

            {/* Who to connect with */}
            {currentUser && (
                <div className="glass-card mb-8 overflow-hidden border border-white/5">
                    <div className="p-5 pb-3 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white tracking-tight">Who's Vibeing?</h2>
                    </div>
                    <div className="p-2">
                        {loading ? (
                            <div className="p-6 text-center text-zinc-500 text-sm animate-pulse">Scanning vibes...</div>
                        ) : suggestions.length > 0 ? (
                            suggestions.map((user) => (
                                <div key={user._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
                                    <Link to={`/user/${user._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="relative">
                                            <img
                                                src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.name}&background=6366F1&color=fff&bold=true`}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-xl object-cover bg-zinc-800 border border-white/10"
                                            />
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-vibe-accent rounded-full border-2 border-[#09090b]"></div>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-[14px] text-white group-hover:text-vibe-primary transition-colors truncate">{user.name}</span>
                                            <span className="text-xs text-zinc-500 truncate">@{user.username || user.email?.split('@')[0]}</span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => handleFollow(user._id)}
                                        className="bg-white text-black hover:bg-vibe-primary hover:text-white text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center gap-1 active:scale-90"
                                    >
                                        <UserPlus size={14} /> Follow
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-zinc-500 text-sm italic">Everyone is already in your circle.</div>
                        )}
                    </div>
                    {suggestions.length > 0 && (
                        <button className="w-full text-zinc-400 text-xs font-medium p-4 hover:bg-white/5 text-center transition-colors flex items-center justify-center gap-2 group">
                            Explore More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            )}

            {/* Trending */}
            <div className="glass-card overflow-hidden border border-white/5">
                <div className="p-5 pb-3 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white tracking-tight">Top Vibes</h2>
                    <TrendingUp size={18} className="text-vibe-accent" />
                </div>
                <div className="p-2">
                    {trendingTopics.map((item) => (
                        <div key={item.topic} className="flex items-start justify-between p-3.5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer relative group">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-vibe-primary/70 uppercase tracking-widest mb-1">{item.category}</span>
                                <span className="font-bold text-[15px] text-white group-hover:text-vibe-accent transition-colors">#{item.topic}</span>
                                <span className="text-xs text-zinc-500 mt-1">{item.posts}</span>
                            </div>
                            <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                    ))}
                </div>
                <button className="w-full text-zinc-400 text-xs font-medium p-4 hover:bg-white/5 text-center transition-colors border-t border-white/5">
                    View Trending Dashboard
                </button>
            </div>

            {/* Footer */}
            <div className="mt-10 px-6 flex flex-wrap gap-x-5 gap-y-3 text-[11px] font-medium text-zinc-600">
                <a href="#" className="hover:text-vibe-primary transition-colors">Vibe Terms</a>
                <a href="#" className="hover:text-vibe-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-vibe-primary transition-colors">Cookies</a>
                <a href="#" className="hover:text-vibe-primary transition-colors">Safety</a>
                <span className="text-zinc-700 italic">Connected by Vibe © 2026</span>
            </div>
        </div>
    );
}

