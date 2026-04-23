
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import CreatePostSmall from "../components/CreatePostSmall";
import { BASE_URL } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, Users, Zap, Search, Activity, Layers, Radio, Fingerprint, LogOut } from "lucide-react";
import { PostSkeletonList } from "../components/PostSkeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("foryou");
  const { user, logout } = useAuth();
  const { socket } = useSocket() || {};
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "following" ? "/posts/following" : "/posts";
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewPost = (newPost) => {
      // Only prepend if For You tab, or if following tab and user is in following list
      if (activeTab === "foryou") {
        setPosts(prev => {
          if (prev.some(p => p._id === newPost._id)) return prev;
          return [newPost, ...prev];
        });
      } else if (activeTab === "following" && user?.following?.includes(newPost.user._id)) {
        setPosts(prev => {
          if (prev.some(p => p._id === newPost._id)) return prev;
          return [newPost, ...prev];
        });
      }
    };
    
    const handleUpdatePost = (updatedPost) => {
      setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    const handleDeletePost = (postId) => {
      setPosts(prev => prev.filter(p => p._id !== postId));
    };
    
    socket.on('new-post', handleNewPost);
    socket.on('update-post', handleUpdatePost);
    socket.on('delete-post', handleDeletePost);
    
    return () => {
      socket.off('new-post', handleNewPost);
      socket.off('update-post', handleUpdatePost);
      socket.off('delete-post', handleDeletePost);
    };
  }, [socket, activeTab, user]);

  return (
    <div className="min-h-screen bg-transparent font-display pb-32 md:pb-16">
      {/* Dashboard Header */}
      <div className="sticky top-0 z-40 bg-[#030303] border-b border-white/5">
        <div className="px-5 md:px-8 py-4 md:py-6 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="bg-vibe-primary/20 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg shadow-vibe-primary/10">
              <Activity size={18} className="md:size-[22px] text-vibe-primary animate-pulse" />
            </div>
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase">HOME</h2>
                    <div className="px-2 py-0.5 bg-vibe-accent/20 rounded-lg text-[8px] font-black tracking-widest text-vibe-accent border border-vibe-accent/20">LIVE</div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mt-1 flex items-center gap-1.5 line-clamp-1">
                    <Radio size={10} className="text-vibe-primary/60" /> Exploring Posts
                </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2.5 md:p-3 text-zinc-600 hover:text-white rounded-xl transition-all">
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button className="p-2.5 md:p-3 text-vibe-accent/80 hover:text-vibe-accent rounded-xl hover:bg-vibe-accent/10 transition-all group relative">
              <Sparkles size={20} strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => {
                if (window.confirm("Log out of Vibe?")) {
                  logout();
                  navigate("/login");
                }
              }}
              className="md:hidden p-2.5 text-zinc-600 hover:text-red-400 rounded-xl transition-all"
            >
              <LogOut size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        
        <div className="flex w-full">
          {["foryou", "following"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  if (tab === "following" && !user) navigate("/login");
                  else setActiveTab(tab);
                }}
                className={`relative flex-1 py-4 text-xs font-black uppercase tracking-[0.3em] transition-all duration-300 ${
                  isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab === "foryou" ? "For You" : "Following"}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicatorDashboard"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-vibe-primary shadow-[0_0_15px_rgba(139,92,246,0.8)]" 
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-6 px-4 md:px-0">
        <AnimatePresence mode="wait">
            <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 md:space-y-8"
            >
                {/* Create Post */}
                {user && activeTab === 'foryou' && (
                  <div className="mb-8 md:mb-12">
                    <CreatePostSmall onPostCreated={fetchPosts} />
                  </div>
                )}

                {/* Stream Pulse */}
                <div className="relative">
                    {loading && (
                        <div className="absolute top-0 left-0 right-0 h-1 z-10 overflow-hidden pointer-events-none rounded-full">
                            <motion.div 
                                animate={{ x: ["-100%", "300%"] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                                className="h-full bg-gradient-to-r from-transparent via-vibe-primary to-transparent w-1/3 blur-[2px]" 
                            />
                        </div>
                    )}

                    {/* Vibe Feed Stream */}
                    <div className="space-y-4 md:space-y-6">
                      {loading && posts.length === 0 ? (
                        <div className="space-y-4 md:space-y-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse bg-white/[0.02] border border-white/5 rounded-[32px] md:rounded-[40px] p-6 md:p-8 h-80 flex flex-col gap-6">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5" />
                                        <div className="flex-1 space-y-3 pt-2">
                                            <div className="h-4 w-1/3 bg-white/5 rounded-full" />
                                            <div className="h-3 w-1/4 bg-white/5 rounded-full opacity-40" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-4 w-full bg-white/5 rounded-full" />
                                        <div className="h-4 w-5/6 bg-white/5 rounded-full" />
                                        <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                                    </div>
                                    <div className="mt-auto flex gap-8">
                                        <div className="h-8 w-16 bg-white/5 rounded-2xl" />
                                        <div className="h-8 w-16 bg-white/5 rounded-2xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                      ) : posts.length > 0 ? (
                        <div className="flex flex-col gap-6">
                          {posts.map((post) => (
                            <PostCard 
                              key={post._id} 
                              post={post} 
                              onDelete={() => setPosts(prev => prev.filter(p => p._id !== post._id))} 
                              onUpdate={fetchPosts} 
                            />
                          ))}
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center justify-center py-40 text-center"
                        >
                          <div className="relative mb-12 group">
                            <div className="absolute inset-0 bg-vibe-primary/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-28 h-28 bg-[#0a0a0a] rounded-[48px] flex items-center justify-center border border-white/10 relative z-10 shadow-2xl transition-all group-hover:rounded-[40px] group-hover:scale-105">
                                {activeTab === "following" ? <Users size={48} className="text-zinc-700" strokeWidth={1} /> : <Zap size={48} className="text-zinc-700" strokeWidth={1} />}
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-3 bg-vibe-primary rounded-2xl shadow-xl shadow-vibe-primary/30 border-4 border-[#030303] z-20">
                                <Fingerprint size={16} className="text-white" />
                            </div>
                          </div>
                          
                          <div className="max-w-md mx-auto space-y-3 md:space-y-4">
                            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">
                                {activeTab === "following" ? "No posts found" : "No posts yet"}
                            </h3>
                            <p className="text-zinc-600 font-medium leading-relaxed uppercase text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] pb-6 md:pb-8 px-6 md:px-10">
                                {activeTab === "following"
                                ? "You're not following anyone yet, or they haven't posted anything."
                                : "Be the first to share something with the world."}
                            </p>
                            {activeTab === "following" && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate("/explore")}
                                    className="btn-primary px-10 md:px-12 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-xl shadow-vibe-primary/20 bg-vibe-primary text-white"
                                >
                                    Find people to follow
                                </motion.button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
