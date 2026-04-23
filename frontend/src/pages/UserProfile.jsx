
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import {
    ArrowLeft,
    Share2,
    MoreVertical,
    MapPin,
    Link as LinkIcon,
    Calendar,
    Image as ImageIcon,
    ThumbsUp,
    MessageCircle,
    User,
    Lock,
    Pencil,
    Zap,
    Users as UsersIcon,
    Settings,
    Sparkles,
    Activity,
    Layers,
    Radio,
    Fingerprint,
    CheckCircle
} from "lucide-react";
import { BASE_URL } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import EditProfileModal from "../components/EditProfileModal";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useMetricsUpdate } from "../hooks/useMetricsUpdate";

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { socket } = useSocket() || {};
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [mediaPosts, setMediaPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowedByProfileUser, setIsFollowedByProfileUser] = useState(false);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [activeTab, setActiveTab] = useState("posts");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            let userEndpoint = `${BASE_URL}/users/${id}`;
            let targetId = id;
            
            if (!id || (currentUser && currentUser._id === id)) {
                userEndpoint = `${BASE_URL}/profile`;
                targetId = currentUser?._id;
            }

            const [userRes, likesRes, mediaRes] = await Promise.all([
                fetch(userEndpoint, { credentials: "include" }),
                fetch(`${BASE_URL}/users/${targetId}/likes`, { credentials: "include" }),
                fetch(`${BASE_URL}/users/${targetId}/media`, { credentials: "include" })
            ]);

            const [userData, likesData, mediaData] = await Promise.all([
                userRes.json(),
                likesRes.json(),
                mediaRes.json()
            ]);

            if (userRes.ok) {
                setProfileUser(userData.user);
                setPosts(userData.posts || []);
                setLikedPosts(likesData || []);
                setMediaPosts(mediaData || []);
                setFollowersCount(userData.user.followers?.length || 0);
                setFollowingCount(userData.user.following?.length || 0);

                if (currentUser) {
                    setIsOwnProfile(userData.user._id === currentUser._id);
                    const isFollower = userData.user.followers?.some(f => f._id === currentUser._id || f === currentUser._id);
                    setIsFollowing(!!isFollower);
                    // Check if the profile user is following current user
                    setIsFollowedByProfileUser(userData.isFollowingCurrentUser || false);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [id, currentUser?._id]);

    // Memoized metrics update callback
    const handleMetricsUpdate = useCallback((data) => {
        if (!profileUser || !currentUser) return;
        
        // Convert IDs to strings for comparison
        const profileUserId = profileUser._id.toString();
        const currentUserId = currentUser._id.toString();
        const dataUserId = data.userId?.toString();
        
        console.log('Metrics update - Type:', data.type, 'DataUserId:', dataUserId, 'ProfileUserId:', profileUserId);
        
        // Update follower count when viewing the profile that gained/lost a follower
        if (data.type === 'follower-count' && dataUserId === profileUserId) {
            console.log('Updating follower count to:', data.followersCount);
            setFollowersCount(data.followersCount);
        }
        
        // Update following count when viewing the profile that followed/unfollowed someone
        if (data.type === 'following-count' && dataUserId === profileUserId) {
            console.log('Updating following count to:', data.followingCount);
            setFollowingCount(data.followingCount);
        }
    }, [profileUser, currentUser]);

    // Real-time metrics update listener
    useMetricsUpdate(handleMetricsUpdate);

    // Real-time follow button state change listener
    useEffect(() => {
        if (!socket || !profileUser || !currentUser) {
            console.log('Socket listener not ready - socket:', !!socket, 'profileUser:', !!profileUser, 'currentUser:', !!currentUser);
            return;
        }

        console.log('Setting up follow-state-change listener for ProfileUser:', profileUser._id, 'CurrentUser:', currentUser._id);

        const handleFollowStateChange = (data) => {
            console.log('Follow state change event received:', data);
            const profileUserId = profileUser._id.toString();
            const currentUserId = currentUser._id.toString();
            const targetUserId = data.targetUserId?.toString();

            console.log('Comparing - targetUserId:', targetUserId, 'profileUserId:', profileUserId, 'currentUserId:', currentUserId);

            // Update isFollowing when current user's follow state changes
            if (targetUserId === profileUserId && data.isFollowing !== undefined) {
                console.log('Updating isFollowing to:', data.isFollowing);
                setIsFollowing(data.isFollowing);
            }

            // Update isFollowedByProfileUser when profile user's follow state changes
            if (targetUserId === currentUserId && data.isFollowedByThis !== undefined) {
                console.log('Updating isFollowedByProfileUser to:', data.isFollowedByThis);
                setIsFollowedByProfileUser(data.isFollowedByThis);
            }
        };

        socket.on('follow-state-change', handleFollowStateChange);

        const handleNewPost = (newPost) => {
            if (newPost.user._id === profileUser._id) {
                setPosts(prev => {
                    if (prev.some(p => p._id === newPost._id)) return prev;
                    return [newPost, ...prev];
                });
                if (newPost.postUrl) {
                    setMediaPosts(prev => {
                        if (prev.some(p => p._id === newPost._id)) return prev;
                        return [newPost, ...prev];
                    });
                }
            }
        };

        const handleUpdatePost = (updatedPost) => {
            setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
            setMediaPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
            setLikedPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
        };

        const handleDeletePost = (postId) => {
            setPosts(prev => prev.filter(p => p._id !== postId));
            setMediaPosts(prev => prev.filter(p => p._id !== postId));
            setLikedPosts(prev => prev.filter(p => p._id !== postId));
        };

        socket.on('new-post', handleNewPost);
        socket.on('update-post', handleUpdatePost);
        socket.on('delete-post', handleDeletePost);

        return () => {
            socket.off('follow-state-change', handleFollowStateChange);
            socket.off('new-post', handleNewPost);
            socket.off('update-post', handleUpdatePost);
            socket.off('delete-post', handleDeletePost);
        };
    }, [socket, profileUser, currentUser]);

    const handleFollow = useCallback(async () => {
        if (!currentUser || !profileUser) return navigate("/login");
        
        try {
            console.log('Follow button clicked - Current isFollowing:', isFollowing);
            
            // Optimistic update - update button immediately
            const newFollowingState = !isFollowing;
            setIsFollowing(newFollowingState);
            console.log('Optimistic update: isFollowing =', newFollowingState);
            
            // Also update count optimistically
            if (isFollowing) {
                setFollowersCount(prev => prev - 1);
            } else {
                setFollowersCount(prev => prev + 1);
            }
            
            const res = await fetch(`${BASE_URL}/user/${profileUser._id}/follow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const data = await res.json();
            console.log('Follow API response:', data);

            if (!res.ok) {
                // Revert optimistic update on error
                setIsFollowing(!newFollowingState);
                if (isFollowing) {
                    setFollowersCount(prev => prev + 1);
                } else {
                    setFollowersCount(prev => prev - 1);
                }
                toast.error(data.message || "Vibe link failed");
            } else {
                console.log('Follow successful, socket event should update metrics');
                // Socket event will provide confirmation and update metrics
            }
        } catch (error) {
            console.error('Follow error:', error);
            // Revert optimistic update on error
            setIsFollowing(!isFollowing);
            toast.error("Connection error");
        }
    }, [isFollowing, currentUser, navigate, profileUser?._id]);

    if (loading) {
        return (
            <div className="p-4 md:p-10 space-y-10 max-w-5xl mx-auto animate-pulse">
                <div className="h-48 md:h-64 bg-white/5 rounded-[32px] md:rounded-[40px]" />
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 px-4 md:px-10">
                    <div className="h-24 w-24 md:h-40 md:w-40 bg-white/5 rounded-[24px] md:rounded-[40px] -mt-12 md:-mt-24 border-4 md:border-8 border-[#030303]" />
                    <div className="flex-1 space-y-4 pt-4">
                        <div className="h-6 md:h-8 w-48 md:w-64 bg-white/5 rounded-full" />
                        <div className="h-4 w-32 bg-white/5 rounded-full opacity-50" />
                    </div>
                </div>
                <div className="h-20 w-full bg-white/5 rounded-[24px] md:rounded-[32px]" />
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 text-zinc-600 font-display">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 rounded-[32px] md:rounded-[40px] flex items-center justify-center mb-8 border border-white/10">
                    <Fingerprint size={48} className="opacity-20" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-4 text-white tracking-tight text-center uppercase">USER NOT FOUND</h2>
                <p className="max-w-xs mx-auto font-medium text-center text-sm md:text-base">The user you're looking for could not be found.</p>
                <button
                    onClick={() => navigate("/")}
                    className="mt-8 btn-primary px-8 md:px-10 py-3.5 md:py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-vibe-primary"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white pb-32 md:pb-16 font-display">
            {/* Top Navigation Overlay Mobile */}
            <div className="md:hidden sticky top-0 z-[100] bg-black/40 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white">
                    <ArrowLeft size={20} />
                </button>
                <div className="text-sm font-black uppercase tracking-widest truncate max-w-[200px]">{profileUser.name}</div>
                <button className="p-2 -mr-2 text-white">
                    <Share2 size={18} />
                </button>
            </div>

            {/* Immersive Environment Header */}
            <div className="relative group">
                <div className="h-[180px] md:h-[350px] w-full relative overflow-hidden">
                {profileUser.coverUrl ? (
                    <motion.img 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.6 }}
                    src={profileUser.coverUrl} 
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
            <div className="px-4 md:px-10 relative max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-12 md:-mt-28 mb-8 md:mb-10 lg:gap-8">
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="relative mb-4 md:mb-0"
                    >
                        <div className="w-32 h-32 md:w-52 md:h-52 rounded-[32px] md:rounded-[50px] border-[6px] md:border-[12px] border-[#030303] bg-[#0a0a0a] overflow-hidden relative shadow-2xl group cursor-pointer transition-all hover:rounded-[24px] md:hover:rounded-[40px]">
                        <img
                            src={profileUser.photoUrl || `https://ui-avatars.com/api/?name=${profileUser.name}&background=8B5CF6&color=fff&bold=true`}
                            alt={profileUser.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Sparkles className="text-white" size={32} />
                        </div>
                        </div>
                        {/* Direct Link status */}
                        <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 p-2 md:p-3 bg-vibe-primary rounded-xl md:rounded-2xl shadow-xl shadow-vibe-primary/30 border-2 md:border-4 border-[#030303]">
                            <Zap size={16} className="text-white fill-current md:w-5 md:h-5" />
                        </div>
                    </motion.div>

                    <div className="flex gap-3 mb-4 w-full md:w-auto justify-end">
                        {isOwnProfile ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsEditModalOpen(true)}
                                className="btn-primary px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 shadow-xl shadow-vibe-primary/20"
                            >
                                Edit Profile <Layers size={14} />
                            </motion.button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-zinc-800 transition-all text-white active:scale-95 shadow-lg">
                                    <MessageCircle size={20} />
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleFollow}
                                    className={`px-10 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-xl ${
                                        isFollowing
                                            ? "border border-white/10 text-white hover:border-vibe-primary/50 hover:bg-vibe-primary/5 bg-black/20"
                                            : isFollowedByProfileUser
                                            ? "bg-vibe-accent text-black shadow-vibe-accent/20 hover:shadow-vibe-accent/40"
                                            : "bg-vibe-primary text-white shadow-vibe-primary/20"
                                    }`}
                                >
                                    {isFollowing ? "Following" : isFollowedByProfileUser ? "Follow Back" : "Follow"}
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                    <div className="lg:col-span-3 space-y-8">
                        <div>
                        <h1 className="text-4xl md:text-5xl font-black leading-none mb-3 tracking-tighter flex items-center gap-4">
                            {profileUser.name}
                            {profileUser.isVerified && (
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1">
                                    <CheckCircle size={14} className="text-emerald-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Verified</span>
                                </div>
                            )}
                        </h1>
                        <p className="text-[12px] font-black uppercase tracking-[0.4em] text-vibe-primary mb-6">@{profileUser.username || profileUser.email?.split('@')[0] || "identity"}</p>

                        {profileUser.about && (
                            <p className="text-lg md:text-xl font-light text-zinc-300 mb-8 leading-relaxed max-w-3xl border-l border-white/5 pl-6 italic">
                            "{profileUser.about}"
                            </p>
                        )}

                        <div className="flex flex-wrap gap-x-10 gap-y-4 text-[11px] font-black uppercase tracking-widest text-zinc-500">
                            {profileUser.location && (
                            <span className="flex items-center gap-2 text-vibe-accent"><MapPin size={16} /> {profileUser.location}</span>
                            )}
                            {profileUser.website && (
                            <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-vibe-primary hover:text-white transition-colors">
                                <LinkIcon size={16} /> {profileUser.website.replace(/^https?:\/\//, '')}
                            </a>
                            )}
                            <span className="flex items-center gap-2"><Calendar size={16} /> Joined {new Date(profileUser.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                        </div>
                        </div>

                        {/* Stats Section */}
                        <div className="flex justify-start items-center gap-0 bg-white/[0.02] px-0 py-4 rounded-2xl border border-white/5 shadow-xl">
                            <div className="flex-1 text-center py-2">
                                <div className="text-2xl font-black text-white">{posts.length}</div>
                                <div className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Posts</div>
                            </div>
                            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                            <div className="flex-1 text-center py-2">
                                <div className="text-2xl font-black text-white">{followingCount}</div>
                                <div className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Following</div>
                            </div>
                            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                            <div className="flex-1 text-center py-2">
                                <div className="text-2xl font-black text-vibe-primary">{followersCount}</div>
                                <div className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Followers</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation Hub */}
                <div className="sticky top-[72px] bg-[#030303]/80 backdrop-blur-xl z-20 border-b border-white/5 mb-10 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-12 px-2 mx-auto max-w-3xl">
                        {['Posts', 'Replies', 'Media', 'Likes'].map(tab => {
                            const id = tab === 'Posts' ? 'posts' : tab === 'Replies' ? 'replies' : tab === 'Media' ? 'media' : 'likes';
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
                            {/* Content Selector Logic */}
                            {(() => {
                                let displayPosts = [];
                                if (activeTab === 'posts') displayPosts = posts;
                                if (activeTab === 'likes') displayPosts = likedPosts;
                                if (activeTab === 'media') displayPosts = mediaPosts;
                                
                                if (displayPosts.length > 0) {
                                    return displayPosts.map(post => <PostCard key={post._id} post={post} />);
                                }
                                
                                // Empty State Rendering
                                return (
                                    <div className="py-32 text-center text-zinc-600 space-y-6 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center border border-white/5">
                                            {activeTab === 'likes' ? <ThumbsUp size={32} className="opacity-20" /> : activeTab === 'media' ? <ImageIcon size={32} className="opacity-20" /> : <Radio size={32} className="opacity-20" />}
                                        </div>
                                        <div className="max-w-xs">
                                            <h4 className="text-lg font-black text-white mb-2 tracking-tight uppercase">No {activeTab} yet</h4>
                                            <p className="text-sm font-medium">This section is currently empty. Check back later!</p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isOwnProfile && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    currentUser={profileUser}
                    onUpdate={fetchProfile}
                />
            )}
        </div>
    );
};

export default UserProfile;
