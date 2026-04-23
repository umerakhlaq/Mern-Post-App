
import { useState, useEffect } from "react";
import { Search as SearchIcon, TrendingUp, MoreHorizontal, Settings, User, Compass, Sparkles, Zap, Layers, Globe } from "lucide-react";
import { BASE_URL } from "../utils/constants";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Explore() {
    const [activeTab, setActiveTab] = useState("foryou");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const trends = [
        { category: "Technology", tag: "#Web3", posts: "54.2K posts" },
        { category: "Science", tag: "#SpaceX", posts: "125K posts" },
        { category: "Politics", tag: "#Elections", posts: "892K posts" },
        { category: "Art", tag: "#DigitalArt", posts: "45.1K posts" },
        { category: "Economy", tag: "#Crypto", posts: "12.4K posts" },
    ];

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/users/search?query=${searchQuery}`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error("Discovery failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030303] text-white pb-20 md:pb-0 font-display">
            {/* Discovery Header */}
            <div className="sticky top-0 z-30 bg-[#030303]/40 backdrop-blur-2xl border-b border-white/5">
                <div className="px-6 py-4 flex items-center gap-6">
                    <div className="relative group flex-1">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <SearchIcon className="h-4 w-4 text-zinc-600 group-focus-within:text-vibe-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for people..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 text-white placeholder-zinc-700 rounded-2xl py-3.5 pl-12 pr-6 outline-none border border-transparent focus:border-vibe-primary/30 focus:bg-white/[0.07] transition-all text-[15px] font-medium"
                        />

                        {/* Search Results Overlay */}
                        <AnimatePresence>
                            {searchQuery && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    className="absolute top-full left-0 right-0 mt-3 bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] max-h-[70vh] flex flex-col"
                                >
                                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Search Results</span>
                                        {loading && <div className="w-4 h-4 border-2 border-vibe-primary/30 border-t-vibe-primary rounded-full animate-spin" />}
                                    </div>
                                    <div className="overflow-y-auto scrollbar-hide">
                                        {searchResults.length > 0 ? (
                                            searchResults.map((user) => (
                                                <Link
                                                    key={user._id}
                                                    to={`/user/${user._id}`}
                                                    className="flex items-center gap-4 p-5 hover:bg-white/5 transition-all border-b border-white/5 last:border-0 group/result"
                                                    onClick={() => setSearchQuery("")}
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 overflow-hidden shrink-0 border border-white/10 group-hover/result:border-vibe-primary/40 transition-colors">
                                                        <img
                                                            src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.name}&background=8B5CF6&color=fff&bold=true`}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-[15px] group-hover/result:text-vibe-primary transition-colors">{user.name}</span>
                                                        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600 mt-0.5">@{user.username || 'unknown'}</span>
                                                    </div>
                                                    <div className="ml-auto opacity-0 group-hover/result:opacity-100 transition-opacity">
                                                        <Zap size={14} className="text-vibe-primary" />
                                                    </div>
                                                </Link>
                                            ))
                                        ) : !loading && (
                                            <div className="p-10 text-center flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                                    <Compass size={24} className="text-zinc-700" />
                                                </div>
                                                <p className="text-zinc-500 text-sm font-medium">No users found</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button className="p-3.5 hover:bg-white/5 rounded-2xl transition-all text-zinc-500 hover:text-white active:scale-90 flex-shrink-0">
                        <Settings size={22} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Navigation Streams */}
                {!searchQuery && (
                    <div className="flex overflow-x-auto scrollbar-hide px-6 gap-8">
                        {['Trending', 'News', 'Sports', 'Music', 'Tech'].map((tab) => {
                            const id = tab.toLowerCase().replace(' ', '');
                            return (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`pb-4 whitespace-nowrap text-[11px] font-black uppercase tracking-[0.3em] relative transition-all ${activeTab === id ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'}`}
                                >
                                    {tab}
                                    {activeTab === id && (
                                        <motion.div 
                                            layoutId="exploreTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-vibe-primary rounded-full shadow-[0_0_15px_rgba(139,92,246,0.8)]" 
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Main Discovery Feed */}
            <div className="max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                    {!searchQuery && (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Immersive Featured Content */}
                            {activeTab === 'universal' && (
                                <div className="p-6">
                                    <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-[40px] cursor-pointer group shadow-2xl">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-700 z-10" />
                                        <img
                                            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop"
                                            alt="Discovery Featured"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[1.5s] ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/40 z-20" />
                                        
                                        <div className="absolute bottom-0 left-0 p-10 z-30 w-full">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="px-3 py-1 bg-vibe-primary rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-vibe-primary/40">Featured</div>
                                                <div className="flex items-center gap-1.5 text-blue-400">
                                                    <Globe size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Worldwide</span>
                                                </div>
                                            </div>
                                            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-[0.9]">THE QUANTUM<br/>OBSERVER</h2>
                                            <p className="text-zinc-400 font-medium max-w-lg text-lg leading-relaxed">System-wide analysis of emerging patterns within the digital collective.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Trends Architecture */}
                            <div className="px-6 py-6 pb-20">
                                <div className="flex items-center justify-between mb-8 opacity-60">
                                    <div className="flex items-center gap-3 font-display">
                                        <TrendingUp size={18} className="text-vibe-accent" />
                                        <h3 className="text-[12px] font-black uppercase tracking-[0.3em]">{activeTab === 'universal' ? 'Trending Now' : `Trends: ${activeTab}`}</h3>
                                    </div>
                                    <button className="p-2 hover:bg-white/5 rounded-xl transition-all">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                <div className="grid gap-2">
                                    {trends.map((trend, i) => (
                                        <motion.div 
                                            key={i} 
                                            whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.03)" }}
                                            className="flex items-start justify-between px-6 py-8 rounded-[32px] border border-white/[0.03] transition-all cursor-pointer group/trend relative overflow-hidden"
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-vibe-primary/0 group-hover/trend:bg-vibe-primary/40 transition-all" />
                                            <div className="flex-1">
                                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-vibe-primary/40" />
                                                    {trend.category}
                                                </div>
                                                <div className="font-black text-white text-2xl md:text-3xl tracking-tighter group-hover/trend:text-vibe-primary transition-colors">{trend.tag}</div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-3 flex items-center gap-2 opacity-60">
                                                    <Zap size={10} className="text-vibe-accent" />
                                                    {trend.posts}
                                                </div>
                                            </div>
                                            <div className="self-center">
                                                <div className="p-4 bg-white/5 rounded-2xl group-hover/trend:bg-vibe-primary/20 group-hover/trend:text-vibe-primary text-zinc-600 transition-all">
                                                    <Sparkles size={20} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    className="w-full py-6 mt-6 rounded-[24px] bg-white/[0.02] border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all hover:bg-white/5"
                                >
                                    Show More Trends
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Data Void State */}
                {searchQuery && searchResults.length === 0 && !loading && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-32 px-10 text-center flex flex-col items-center gap-8"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-vibe-primary/20 blur-3xl rounded-full" />
                            <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center border border-white/10 relative z-10">
                                <SearchIcon size={40} className="text-zinc-700" strokeWidth={1} />
                            </div>
                        </div>
                        <div className="max-w-xs mx-auto">
                            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">NO RESULTS</h3>
                            <p className="text-zinc-500 font-medium leading-relaxed">No users found matching <span className="text-vibe-primary">"{searchQuery}"</span>.</p>
                        </div>
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="bg-white/5 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all border border-white/5"
                        >
                            Clear Search
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
