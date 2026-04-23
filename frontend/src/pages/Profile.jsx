
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import EditProfileModal from "../components/EditProfileModal";
import { User, MapPin, Link as LinkIcon, MessageCircle, Image as ImageIcon, Heart, ThumbsUp, Calendar, Zap, Sparkles, Layers, Fingerprint, LogOut, Flag, Radio } from "lucide-react";
import { BASE_URL } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [myReports, setMyReports] = useState([]);
  const { user: authUser, logout } = useAuth();
  const { socket } = useSocket();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [userRes, likesRes, mediaRes, reportsRes] = await Promise.all([
        fetch(`${BASE_URL}/profile`, { credentials: "include" }),
        fetch(`${BASE_URL}/users/${authUser._id}/likes`, { credentials: "include" }),
        fetch(`${BASE_URL}/users/${authUser._id}/media`, { credentials: "include" }),
        fetch(`${BASE_URL}/my-reports`, { credentials: "include" })
      ]);

      const [userData, likesData, mediaData, reportsData] = await Promise.all([
        userRes.json(),
        likesRes.json(),
        mediaRes.json(),
        reportsRes.json()
      ]);

      if (userRes.ok) {
        setData({ 
          ...userData, 
          likedPosts: likesData || [], 
          mediaPosts: mediaData || [] 
        });
        setMyReports(reportsData || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    if (authUser) fetchProfile();
  }, [authUser?._id]);

  useEffect(() => {
    if (!socket || !data) return;

    const handleMetricsUpdate = (payload) => {
      if (payload.userId === data.user._id) {
        setData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            followers: payload.followersCount !== undefined ? Array(payload.followersCount).fill({}) : prev.user.followers,
            following: payload.followingCount !== undefined ? Array(payload.followingCount).fill({}) : prev.user.following
          }
        }));
      }
    };

    socket.on('metrics-update', handleMetricsUpdate);
    
    const handleNewPost = (newPost) => {
      if (newPost.user._id === data.user._id) {
        setData(prev => {
          if (prev.posts.some(p => p._id === newPost._id)) return prev;
          return {
            ...prev,
            posts: [newPost, ...prev.posts],
            mediaPosts: newPost.postUrl ? [newPost, ...prev.mediaPosts] : prev.mediaPosts
          };
        });
      }
    };
    
    const handleUpdatePost = (updatedPost) => {
      setData(prev => ({
        ...prev,
        posts: prev.posts.map(p => p._id === updatedPost._id ? updatedPost : p),
        mediaPosts: prev.mediaPosts.map(p => p._id === updatedPost._id ? updatedPost : p),
        likedPosts: prev.likedPosts.map(p => p._id === updatedPost._id ? updatedPost : p)
      }));
    };
    
    const handleDeletePost = (postId) => {
      setData(prev => ({
        ...prev,
        posts: prev.posts.filter(p => p._id !== postId),
        mediaPosts: prev.mediaPosts.filter(p => p._id !== postId),
        likedPosts: prev.likedPosts.filter(p => p._id !== postId)
      }));
    };
    
    socket.on('new-post', handleNewPost);
    socket.on('update-post', handleUpdatePost);
    socket.on('delete-post', handleDeletePost);

    return () => {
      socket.off('metrics-update', handleMetricsUpdate);
      socket.off('new-post', handleNewPost);
      socket.off('update-post', handleUpdatePost);
      socket.off('delete-post', handleDeletePost);
    };
  }, [socket, data?.user._id]);

  if (loading) return (
    <div className="p-10 space-y-10 max-w-5xl mx-auto animate-pulse">
      <div className="h-64 bg-white/5 rounded-[40px]" />
      <div className="flex gap-8 px-10">
          <div className="h-40 w-40 bg-white/5 rounded-[40px] -mt-24 border-8 border-[#030303]" />
          <div className="flex-1 space-y-4 pt-4">
              <div className="h-8 w-64 bg-white/5 rounded-full" />
              <div className="h-4 w-32 bg-white/5 rounded-full opacity-50" />
          </div>
      </div>
      <div className="h-20 w-full bg-white/5 rounded-[32px]" />
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-12 text-zinc-600 font-display">
      <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mb-8 border border-white/10">
        <Fingerprint size={48} className="opacity-20" />
      </div>
      <h2 className="text-3xl font-black mb-4 text-white tracking-tight uppercase">USER NOT FOUND</h2>
      <p className="max-w-xs mx-auto font-medium">Please log in to your account to see your profile.</p>
    </div>
  );

  const { user, posts, likedPosts, mediaPosts } = data;

  return (
    <div className="min-h-screen bg-[#030303] text-white pb-32 md:pb-16 font-display">
      {/* Immersive Environment Header */}
      <div className="relative group">
        <div className="h-[250px] md:h-[350px] w-full relative overflow-hidden">
          {user.coverUrl ? (
            <motion.img 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              src={user.coverUrl} 
              alt="Cover" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-[#030303]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-black/20" />
        </div>
      </div>

      {/* Identity Profile Subsurface */}
      <div className="px-6 md:px-10 relative max-w-5xl mx-auto">
        <div className="flex justify-between items-end -mt-20 md:-mt-28 mb-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative"
          >
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-[50px] border-[12px] border-[#030303] bg-[#0a0a0a] overflow-hidden relative shadow-2xl group cursor-pointer transition-all hover:rounded-[40px]">
              <img
                src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.name}&background=8B5CF6&color=fff&bold=true`}
                alt={user.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Sparkles className="text-white" size={32} />
              </div>
            </div>
            {/* Direct Link status */}
            <div className="absolute -bottom-2 -right-2 p-3 bg-vibe-primary rounded-2xl shadow-xl shadow-vibe-primary/30 border-4 border-[#030303]">
                 <Zap size={20} className="text-white fill-current" />
            </div>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditOpen(true)}
            className="mb-4 btn-primary px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 shadow-xl shadow-vibe-primary/20"
          >
            Edit Profile <Layers size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (window.confirm("Are you sure you want to log out?")) {
                logout();
              }
            }}
            className="md:hidden mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center transition-all hover:bg-red-500/20 shadow-lg shadow-red-500/5 group"
          >
            <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black leading-none mb-3 tracking-tighter flex items-center gap-4">
                {user.name}
              </h1>
              <p className="text-[12px] font-black uppercase tracking-[0.4em] text-vibe-primary mb-6">@{user.username || user.email?.split('@')[0] || "identity"}</p>

              {user.about && (
                <p className="text-lg md:text-xl font-light text-zinc-300 mb-8 leading-relaxed max-w-3xl border-l border-white/5 pl-6 italic">
                  "{user.about}"
                </p>
              )}

              <div className="flex flex-wrap gap-x-10 gap-y-4 text-[11px] font-black uppercase tracking-widest text-zinc-500">
                {user.location && (
                  <span className="flex items-center gap-2 text-vibe-accent"><MapPin size={16} /> {user.location}</span>
                )}
                {user.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-vibe-primary hover:text-white transition-colors">
                    <LinkIcon size={16} /> {user.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span className="flex items-center gap-2"><Calendar size={16} /> Joined {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="flex lg:flex-col justify-between items-center lg:items-end gap-6 bg-white/[0.02] p-8 rounded-[40px] border border-white/5 shadow-xl">
             <div className="text-center lg:text-right">
                <div className="text-3xl font-black text-white">{posts.length}</div>
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Posts</div>
             </div>
             <div className="w-px h-8 lg:w-12 lg:h-px bg-white/5" />
                          <div className="text-center lg:text-right">
                <div className="text-3xl font-black text-white">{user.following?.length || 0}</div>
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Following</div>
             </div>
             <div className="w-px h-8 lg:w-12 lg:h-px bg-white/5" />
             <div className="text-center lg:text-right">
                <div className="text-3xl font-black text-white">{user.followers?.length || 0}</div>
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Followers</div>
             </div>
          </div>
        </div>

        {/* Tab Navigation Hub */}
        <div className="sticky top-[72px] bg-[#030303]/80 backdrop-blur-xl z-20 border-b border-white/5 mb-10 overflow-x-auto scrollbar-hide">
          <div className="flex gap-12 px-2">
            {['Posts', 'Replies', 'Media', 'Likes', 'Reports'].map(tab => {
                const id = tab === 'Posts' ? 'posts' : tab === 'Replies' ? 'replies' : tab === 'Media' ? 'media' : tab === 'Likes' ? 'likes' : 'reports';
                return (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(id)}
                        className={`py-6 text-[11px] font-black uppercase tracking-[0.4em] relative transition-all whitespace-nowrap ${activeTab === id ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        {tab}
                        {activeTab === id && (
                            <motion.div 
                                layoutId="profileTabLine"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-vibe-primary shadow-[0_0_15px_rgba(139,92,246,0.8)]" 
                            />
                        )}
                    </button>
                )
            })}
          </div>
        </div>

        {/* Dynamic Frequency Space */}
        <div className="min-h-[400px] max-w-4xl">
          <AnimatePresence mode="wait">
             <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {(() => {
                  if (activeTab === 'reports') {
                    if (myReports.length > 0) {
                      return (
                        <div className="space-y-4">
                          {myReports.map(report => (
                            <div key={report._id} className="glass-card border border-white/5 rounded-3xl p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-red-500/10 rounded-2xl flex items-center justify-center">
                                    <Flag size={20} className="text-red-400" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white text-sm">Reported Post</p>
                                    <p className="text-zinc-500 text-xs">
                                      {new Date(report.createdAt).toLocaleDateString()} • 
                                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
                                        report.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                        report.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-400' :
                                        'bg-zinc-500/10 text-zinc-400'
                                      }`}>
                                        {report.status}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                                  report.reason === 'harassment' || report.reason === 'hate_speech' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                  report.reason === 'spam' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                  report.reason === 'nudity' ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' :
                                  'bg-white/5 border-white/10 text-zinc-400'
                                }`}>
                                  {report.reason.replace('_', ' ')}
                                </span>
                              </div>
                              
                              {report.post && (
                                <div className="bg-white/5 rounded-2xl p-4 mb-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <img 
                                      src={report.post.user?.photoUrl || `https://ui-avatars.com/api/?name=${report.post.user?.name}&background=8B5CF6&color=fff&bold=true`}
                                      alt="" 
                                      className="w-6 h-6 rounded-lg"
                                    />
                                    <span className="font-bold text-white text-sm">{report.post.user?.name}</span>
                                    <span className="text-zinc-500 text-xs">@{report.post.user?.username}</span>
                                  </div>
                                  <p className="text-zinc-300 text-sm">{report.post.content || 'Media post'}</p>
                                </div>
                              )}
                              
                              {report.description && (
                                <div className="bg-zinc-800/50 rounded-2xl p-3">
                                  <p className="text-zinc-400 text-xs italic">"{report.description}"</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      return (
                        <div className="py-32 text-center text-zinc-600 space-y-6 flex flex-col items-center">
                          <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center">
                            <Flag size={32} className="opacity-20" />
                          </div>
                          <div className="max-w-xs">
                            <h4 className="text-lg font-black text-white mb-2 tracking-tight uppercase">No reports yet</h4>
                            <p className="text-sm font-medium">You haven't reported any posts. Help keep the community safe!</p>
                          </div>
                        </div>
                      );
                    }
                  }

                  let displayPosts = [];
                  if (activeTab === 'posts') displayPosts = posts;
                  if (activeTab === 'likes') displayPosts = likedPosts;
                  if (activeTab === 'media') displayPosts = mediaPosts;

                  if (displayPosts.length > 0) {
                    return displayPosts.map(post => <PostCard key={post._id} post={post} />);
                  }

                  return (
                    <div className="py-32 text-center text-zinc-600 space-y-6 flex flex-col items-center">
                      <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center">
                          {activeTab === 'likes' ? <ThumbsUp size={32} className="opacity-20" /> : activeTab === 'media' ? <ImageIcon size={32} className="opacity-20" /> : <Radio size={32} className="opacity-20" />}
                      </div>
                      <div className="max-w-xs">
                          <h4 className="text-lg font-black text-white mb-2 tracking-tight uppercase">No {activeTab} yet</h4>
                          <p className="text-sm font-medium">This section is currently empty. Start vibeing!</p>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        currentUser={user}
        onUpdate={(updatedUser) => setData(prev => ({ ...prev, user: updatedUser }))}
      />
    </div>
  );
}