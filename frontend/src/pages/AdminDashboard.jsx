
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Users, Shield, Activity, 
    Trash2, UserPlus, MoreVertical, Search,
    Filter, Download, ChevronRight, TrendingUp,
    AlertCircle, CheckCircle, BarChart3, LayoutDashboard,
    MessageSquare, Settings, Lock, Eye, Heart, Image as PostIcon,
    ArrowLeft, UserX, UserCheck, Pin, TrendingDown, Bell, Megaphone,
    ExternalLink, Edit
} from "lucide-react";
import { BASE_URL } from "../utils/constants";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import EditUserModal from "../components/EditUserModal";
import AdminEditPostModal from "../components/AdminEditPostModal";

const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];
    const isVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    const isCloudinaryVideo = url.includes("/video/upload/");
    return isVideoExtension || isCloudinaryVideo;
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState([]);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [reports, setReports] = useState([]);
    const [reportStats, setReportStats] = useState({ total: 0, pending: 0, reviewed: 0, rejected: 0 });
    const [reportFilter, setReportFilter] = useState("pending");
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState("overview");
    const [editUserModal, setEditUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editPostModal, setEditPostModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchStats(),
                fetchUsers(),
                fetchPosts(),
                fetchReports("pending")
            ]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${BASE_URL}/admin/stats`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${BASE_URL}/admin/users`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${BASE_URL}/admin/posts`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This will also remove all their posts.")) return;
        try {
            const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (res.ok) {
                toast.success("User deleted successfully");
                fetchUsers();
                fetchStats();
            }
        } catch (err) {
            toast.error("Failed to delete user");
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditUserModal(true);
    };

    const handleEditPost = (post) => {
        setSelectedPost(post);
        setEditPostModal(true);
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            const res = await fetch(`${BASE_URL}/admin/posts/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (res.ok) {
                toast.success("Post deleted successfully");
                fetchPosts();
                fetchStats();
            }
        } catch (err) {
            toast.error("Failed to delete post");
        }
    };

    const fetchReports = async (status = "") => {
        try {
            const url = status
                ? `${BASE_URL}/admin/reports?status=${status}`
                : `${BASE_URL}/admin/reports`;
            const res = await fetch(url, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                // New API returns { reports, stats }
                setReports(data.reports || data);
                if (data.stats) setReportStats(data.stats);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleVerify = async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/admin/users/${id}/verify`, { method: "PUT", credentials: "include" });
            if (res.ok) {
                toast.success("User verification toggled");
                fetchUsers();
            }
        } catch (err) {
            toast.error("Failed to verify user");
        }
    };

    const handleSuspend = async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/admin/users/${id}/suspend`, { method: "PUT", credentials: "include" });
            if (res.ok) {
                toast.success("User suspension toggled");
                fetchUsers();
            }
        } catch (err) {
            toast.error("Failed to suspend user");
        }
    };

    const handleFreeze = async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/admin/users/${id}/freeze`, { method: "PUT", credentials: "include" });
            if (res.ok) {
                toast.success("User freeze toggled");
                fetchUsers();
            }
        } catch (err) {
            toast.error("Failed to freeze user");
        }
    };

    const handlePin = async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/admin/posts/${id}/pin`, { method: "PUT", credentials: "include" });
            if (res.ok) {
                toast.success("Post visibility (pinned) toggled");
                fetchPosts();
            }
        } catch (err) {
            toast.error("Failed to pin post");
        }
    };

    const handleTrending = async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/admin/posts/${id}/trending`, { method: "PUT", credentials: "include" });
            if (res.ok) {
                toast.success("Post trending status toggled");
                fetchPosts();
            }
        } catch (err) {
            toast.error("Failed to toggle trending");
        }
    };

    const handleResolveReport = async (id, status) => {
        try {
            const res = await fetch(`${BASE_URL}/admin/reports/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
                credentials: "include"
            });
            if (res.ok) {
                toast.success(`Report marked as ${status}`);
                fetchReports(reportFilter);
            }
        } catch (err) {
            toast.error("Failed to update report");
        }
    };

    const handleHidePost = async (postId) => {
        try {
            const res = await fetch(`${BASE_URL}/admin/posts/${postId}/hide`, {
                method: "PUT",
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(data.message);
                fetchReports(reportFilter);
                fetchPosts();
            }
        } catch (err) {
            toast.error("Failed to hide post");
        }
    };

    const handleBroadcast = async () => {
        const title = window.prompt("Enter Broadcast Title:");
        if (!title) return;
        const message = window.prompt("Enter Broadcast Message:");
        if (!message) return;

        try {
            const res = await fetch(`${BASE_URL}/admin/broadcast`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, message }),
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(`Broadcast sent to ${data.message}`);
            } else {
                const error = await res.json();
                toast.error(error.message || "Broadcast failed");
            }
        } catch (err) {
            console.error("Broadcast error:", err);
            toast.error("Broadcast failed: " + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#030303] text-white p-6 md:p-10 font-display">
            {/* Header Area */}
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">Admin Terminal</h1>
                        <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
                            <Shield size={14} className="text-vibe-primary" /> Authority Management Space
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleBroadcast}
                            className="px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[11px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center gap-2"
                        >
                            <Megaphone size={16} /> Broadcast
                        </button>
                        <button 
                            onClick={() => navigate("/")}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            <ArrowLeft size={16} /> Back to App
                        </button>
                        <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                            <Download size={16} /> Reports
                        </button>
                    </div>
                </div>

                {/* Navigation Pills */}
                <div className="flex gap-4 border-b border-white/5 pb-6">
                    {["overview", "users", "posts", "reports"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveSection(tab)}
                            className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${
                                activeSection === tab 
                                ? "bg-vibe-primary/10 text-vibe-primary border border-vibe-primary/20" 
                                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                            }`}
                        >
                            {tab}
                            {activeSection === tab && (
                                <motion.div 
                                    layoutId="adminNavIndicator"
                                    className="absolute -bottom-[25px] left-0 right-0 h-[3px] bg-vibe-primary shadow-[0_0_15px_rgba(139,92,246,0.8)]"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence>
                    {activeSection === "overview" && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-12"
                        >
                            {/* Grid Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stats.length > 0 ? stats.map((stat, i) => (
                                    <div key={i} className="glass-card p-10 border border-white/5 rounded-[40px] relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 text-vibe-primary/20 group-hover:text-vibe-primary/40 transition-colors">
                                            <TrendingUp size={48} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">{stat.label}</p>
                                        <div className="flex items-end gap-3">
                                            <h3 className="text-4xl font-black tracking-tighter">{stat.value}</h3>
                                            <span className="text-[11px] font-black text-emerald-500 mb-1.5">{stat.change}</span>
                                        </div>
                                    </div>
                                )) : (
                                    [1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white/5 rounded-[40px] animate-pulse" />)
                                )}
                            </div>

                            {/* Recent Activity Heatmap / Chart Placeholder */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12">
                                <div className="lg:col-span-2 glass-card p-10 border border-white/5 rounded-[48px] h-96 flex flex-col">
                                    <div className="flex items-center justify-between mb-10">
                                        <h4 className="text-xl font-black uppercase tracking-tighter">Network Engagement</h4>
                                        <BarChart3 className="text-zinc-700" size={20} />
                                    </div>
                                    <div className="flex-1 flex items-end gap-2 md:gap-4 px-4 overflow-hidden">
                                        {[40, 70, 45, 90, 65, 80, 50, 95, 30, 85, 60, 75, 55, 100].map((h, i) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ delay: i * 0.05 }}
                                                className="flex-1 bg-gradient-to-t from-vibe-primary/20 to-vibe-primary rounded-t-xl group relative"
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-2 py-1 rounded-lg text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                                                    {h}% Load
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                                <div className="glass-card p-10 border border-white/5 rounded-[48px] space-y-8">
                                    <h4 className="text-xl font-black uppercase tracking-tighter">Recent Alerts</h4>
                                    <div className="space-y-6">
                                        {[
                                            { type: "error", msg: "Failed login attempt detected from 192.168.1.1", time: "2m ago" },
                                            { type: "success", msg: "Database backup completed successfully", time: "1h ago" },
                                            { type: "warning", msg: "Server CPU load exceeded 90% threshold", time: "4h ago" }
                                        ].map((alert, i) => (
                                            <div key={i} className="flex gap-4 group cursor-pointer">
                                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${alert.type === 'error' ? 'bg-red-500' : alert.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_10px_currentColor]`} />
                                                <div className="flex-1">
                                                    <p className="text-[12px] font-bold text-zinc-300 group-hover:text-white transition-colors">{alert.msg}</p>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{alert.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeSection === "users" && (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="glass-card border border-white/5 rounded-[48px] overflow-hidden"
                        >
                            <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <h4 className="text-2xl font-black uppercase tracking-tighter">Identity Registry</h4>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                        <input type="text" placeholder="FILTER BY IDENTITY..." className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-[11px] font-black tracking-widest outline-none focus:border-vibe-primary/50 transition-all w-full md:w-64" />
                                    </div>
                                    <button className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all">
                                        <Filter size={18} />
                                    </button>
                                </div>
                            </div>
                            {loading ? (
                                <div className="flex items-center justify-center py-24">
                                    <div className="flex items-center gap-3 text-zinc-500">
                                        <div className="w-6 h-6 border-2 border-zinc-600 border-t-vibe-primary rounded-full animate-spin"></div>
                                        <span className="text-sm font-bold uppercase tracking-widest">Loading Users...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">User Identity</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Badge & Status</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Security</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Registered</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {users.map((user) => (
                                                <tr key={user._id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
                                                                <img src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.name}&background=8B5CF6&color=fff&bold=true`} alt={user.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-bold text-[14px] text-white tracking-tight">{user.name}</p>
                                                                    {user.isVerified && <CheckCircle size={14} className="text-vibe-primary" />}
                                                                </div>
                                                                <p className="text-[11px] font-black text-zinc-600 tracking-widest uppercase italic">@{user.username || "identity"}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <button 
                                                            onClick={() => handleVerify(user._id)}
                                                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${user.isVerified ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-transparent border-white/10 text-zinc-600'}`}
                                                        >
                                                            <UserCheck size={12} /> {user.isVerified ? "Verified" : "Grant Badge"}
                                                        </button>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="flex flex-col gap-2">
                                                            <button 
                                                                onClick={() => handleSuspend(user._id)}
                                                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${user.isSuspended ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-transparent border-white/10 text-zinc-600'}`}
                                                            >
                                                                <UserX size={12} /> {user.isSuspended ? "Suspended" : "Suspend"}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleFreeze(user._id)}
                                                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${user.isFrozen ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-transparent border-white/10 text-zinc-600'}`}
                                                            >
                                                                <Lock size={12} /> {user.isFrozen ? "Frozen" : "Freeze"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-[12px] font-medium text-zinc-500">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={() => handleEditUser(user)}
                                                                className="p-3 text-zinc-600 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteUser(user._id)}
                                                                className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeSection === "posts" && (
                        <motion.div
                            key="posts"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="glass-card border border-white/5 rounded-[48px] overflow-hidden"
                        >
                            <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <h4 className="text-2xl font-black uppercase tracking-tighter">Content Feed Management</h4>
                                <div className="flex items-center gap-4">
                                     <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                                        <AlertCircle size={16} /> Flagged Content
                                    </button>
                                </div>
                            </div>
                            {loading ? (
                                <div className="flex items-center justify-center py-24">
                                    <div className="flex items-center gap-3 text-zinc-500">
                                        <div className="w-6 h-6 border-2 border-zinc-600 border-t-vibe-primary rounded-full animate-spin"></div>
                                        <span className="text-sm font-bold uppercase tracking-widest">Loading Posts...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Author</th>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Content Fragment</th>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Curation</th>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Engagement</th>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {posts.map((post) => (
                                            <tr key={post._id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-3">
                                                         <img src={post.user?.photoUrl || `https://ui-avatars.com/api/?name=${post.user?.name}&background=8B5CF6&color=fff&bold=true`} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/5" />
                                                         <div className="flex flex-col">
                                                            <span className="font-bold text-[13px]">{post.user?.name}</span>
                                                            {post.isPinned && <span className="text-[8px] font-black uppercase tracking-tighter text-amber-500">Pinned</span>}
                                                         </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="max-w-xs">
                                                        {post.content && (
                                                            <p className="text-[13px] text-zinc-400 line-clamp-2 mb-2">{post.content}</p>
                                                        )}
                                                        {post.postUrl && (
                                                            <div className="relative">
                                                                {isVideo(post.postUrl) ? (
                                                                    <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center border border-white/10">
                                                                        <video
                                                                            src={post.postUrl}
                                                                            className="w-full h-full object-cover rounded-lg"
                                                                            muted
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                                                                            <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                                                                                <div className="w-0 h-0 border-l-2 border-l-white border-t-1 border-t-transparent border-b-1 border-b-transparent ml-0.5"></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <img
                                                                        src={post.postUrl}
                                                                        alt="Post media"
                                                                        className="w-16 h-16 object-cover rounded-lg border border-white/10"
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                        {!post.content && !post.postUrl && (
                                                            <span className="text-[12px] text-zinc-600 italic">No content</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => handlePin(post._id)}
                                                            title="Pin to top"
                                                            className={`p-2 rounded-lg border transition-all ${post.isPinned ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-transparent border-white/5 text-zinc-600 hover:text-white'}`}
                                                        >
                                                            <Pin size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleTrending(post._id)}
                                                            title="Push to Trending"
                                                            className={`p-2 rounded-lg border transition-all ${post.isTrending ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-transparent border-white/5 text-zinc-600 hover:text-white'}`}
                                                        >
                                                            <TrendingUp size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex gap-4 text-[11px] font-black text-zinc-600">
                                                        <span className="flex items-center gap-1"><Heart size={12} /> {post.likes?.length || 0}</span>
                                                        <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comments?.length || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => navigate(`/post/${post._id}`)}
                                                            className="p-3 text-zinc-600 hover:text-vibe-primary hover:bg-vibe-primary/10 rounded-xl transition-all"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleEditPost(post)}
                                                            className="p-3 text-zinc-600 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeletePost(post._id)}
                                                            className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            )}
                        </motion.div>
                    )}

                    {activeSection === "reports" && (
                        <motion.div
                            key="reports"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Report Stats Row */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: "Total Reports", value: reportStats.total, color: "text-white", bg: "bg-white/5", border: "border-white/10" },
                                    { label: "Pending", value: reportStats.pending, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20" },
                                    { label: "Reviewed", value: reportStats.reviewed, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20" },
                                    { label: "Rejected", value: reportStats.rejected, color: "text-zinc-400", bg: "bg-zinc-500/5", border: "border-zinc-500/20" },
                                ].map((s, i) => (
                                    <div key={i} className={`${s.bg} border ${s.border} rounded-3xl p-6`}>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">{s.label}</p>
                                        <p className={`text-4xl font-black tracking-tighter ${s.color}`}>{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Filter Tabs + Table */}
                            <div className="glass-card border border-white/5 rounded-[48px] overflow-hidden">
                                {/* Header with Filters */}
                                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h4 className="text-2xl font-black uppercase tracking-tighter">Report Queue</h4>
                                    <div className="flex items-center gap-2">
                                        {["pending", "reviewed", "rejected", ""].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => {
                                                    setReportFilter(f);
                                                    fetchReports(f);
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    reportFilter === f
                                                        ? "bg-vibe-primary/15 text-vibe-primary border border-vibe-primary/30"
                                                        : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-white/10"
                                                }`}
                                            >
                                                {f === "" ? "All" : f}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => fetchReports(reportFilter)}
                                            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-zinc-500 hover:text-white transition-all"
                                            title="Refresh"
                                        >
                                            <Activity size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Reports Table */}
                                {reports.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-4">
                                            <CheckCircle size={28} className="text-zinc-600" />
                                        </div>
                                        <p className="font-black uppercase tracking-widest text-zinc-500 text-sm">No {reportFilter || ""} reports</p>
                                        <p className="text-zinc-700 text-xs mt-1">All clear in this queue</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/5">
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Reporter</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Reported Post</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Reason</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Status</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Post Flags</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {reports.map((report) => (
                                                    <tr key={report._id} className={`group hover:bg-white/[0.02] transition-colors ${report.status !== "pending" ? "opacity-50" : ""}`}>
                                                        {/* Reporter */}
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={report.reporter?.photoUrl || `https://ui-avatars.com/api/?name=${report.reporter?.name}&background=8B5CF6&color=fff&bold=true`}
                                                                    alt=""
                                                                    className="w-8 h-8 rounded-xl object-cover border border-white/5"
                                                                />
                                                                <div>
                                                                    <p className="font-bold text-[12px] text-white">{report.reporter?.name}</p>
                                                                    <p className="text-[10px] text-zinc-600">@{report.reporter?.username}</p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Reported Post */}
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col gap-1 max-w-[180px]">
                                                                <p className="text-[11px] font-semibold text-zinc-300">By: {report.post?.user?.name}</p>
                                                                <p className="text-[11px] text-zinc-500 line-clamp-1">{report.post?.content || "â€”"}</p>
                                                                {report.description && (
                                                                    <p className="text-[10px] text-amber-400/70 italic line-clamp-1">"{report.description}"</p>
                                                                )}
                                                                <button
                                                                    onClick={() => navigate(`/post/${report.post?._id}`)}
                                                                    className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-vibe-primary transition-colors mt-0.5 w-fit"
                                                                >
                                                                    <ExternalLink size={10} /> View Post
                                                                </button>
                                                            </div>
                                                        </td>

                                                        {/* Reason */}
                                                        <td className="px-8 py-5">
                                                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                                                report.reason === "harassment" || report.reason === "hate_speech" ? "bg-red-500/10 border-red-500/20 text-red-400"
                                                                : report.reason === "spam" ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                                                : report.reason === "nudity" ? "bg-pink-500/10 border-pink-500/20 text-pink-400"
                                                                : "bg-white/5 border-white/10 text-zinc-400"
                                                            }`}>
                                                                {report.reason?.replace("_", " ")}
                                                            </span>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-8 py-5">
                                                            {report.status === "pending" ? (
                                                                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-amber-500">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending
                                                                </span>
                                                            ) : report.status === "reviewed" ? (
                                                                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                                                    <CheckCircle size={10} /> Reviewed
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                                                    <AlertCircle size={10} /> Rejected
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Post Flags */}
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col gap-1">
                                                                <span className={`text-[10px] font-black ${(report.post?.reportCount || 0) >= 10 ? "text-red-400" : (report.post?.reportCount || 0) >= 5 ? "text-amber-400" : "text-zinc-500"}`}>
                                                                    ðŸš© {report.post?.reportCount || 0} reports
                                                                </span>
                                                                {report.post?.isHidden && (
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-red-400">Hidden</span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {/* Status Change Buttons */}
                                                                {report.status !== "pending" && (
                                                                    <button
                                                                        onClick={() => handleResolveReport(report._id, "pending")}
                                                                        className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500/20 transition-all"
                                                                        title="Set to Pending"
                                                                    >
                                                                        Pending
                                                                    </button>
                                                                )}
                                                                {report.status !== "reviewed" && (
                                                                    <button
                                                                        onClick={() => handleResolveReport(report._id, "reviewed")}
                                                                        className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                                                        title="Mark as Reviewed"
                                                                    >
                                                                        Review
                                                                    </button>
                                                                )}
                                                                {report.status !== "rejected" && (
                                                                    <button
                                                                        onClick={() => handleResolveReport(report._id, "rejected")}
                                                                        className="px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/10 transition-all"
                                                                        title="Mark as Rejected"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                )}

                                                                {/* Post Actions (only for pending reports) */}
                                                                {report.status === "pending" && (
                                                                    <>
                                                                        {/* Hide Post */}
                                                                        <button
                                                                            onClick={() => {
                                                                                handleHidePost(report.post?._id);
                                                                                handleResolveReport(report._id, "reviewed");
                                                                            }}
                                                                            className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-500/20 transition-all"
                                                                            title="Hide Post & Mark Reviewed"
                                                                        >
                                                                            Hide
                                                                        </button>
                                                                        {/* Delete Post */}
                                                                        <button
                                                                            onClick={() => {
                                                                                handleDeletePost(report.post?._id);
                                                                                handleResolveReport(report._id, "reviewed");
                                                                            }}
                                                                            className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-all"
                                                                            title="Delete Post & Mark Reviewed"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit User Modal */}
                <EditUserModal
                    isOpen={editUserModal}
                    onClose={() => {
                        setEditUserModal(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                    onUpdate={() => {
                        fetchUsers();
                        setEditUserModal(false);
                        setSelectedUser(null);
                    }}
                />

                {/* Edit Post Modal */}
                <AdminEditPostModal
                    isOpen={editPostModal}
                    onClose={() => {
                        setEditPostModal(false);
                        setSelectedPost(null);
                    }}
                    post={selectedPost}
                    onUpdate={() => {
                        fetchPosts();
                        setEditPostModal(false);
                        setSelectedPost(null);
                    }}
                />
            </div>
        </div>
    );
}


