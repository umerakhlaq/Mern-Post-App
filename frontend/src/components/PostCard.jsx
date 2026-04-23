
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit, Bookmark, Flag } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMetricsUpdate } from "../hooks/useMetricsUpdate";
import { BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";
import Swal from 'sweetalert2';
import EditPostModal from "./EditPostModal";
import ReportModal from "./ReportModal";
import { motion, AnimatePresence } from "framer-motion";

const swalVibe = Swal.mixin({
    background: '#09090b',
    color: '#fff',
    confirmButtonColor: '#8B5CF6',
    cancelButtonColor: '#18181b',
    customClass: {
        popup: 'border border-white/5 rounded-3xl backdrop-blur-3xl',
        confirmButton: 'btn-primary px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest',
        cancelButton: 'px-8 py-3 rounded-2xl font-bold bg-zinc-800 text-sm'
    }
});

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return "now";
};
 
const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];
    const isVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    const isCloudinaryVideo = url.includes("/video/upload/");
    return isVideoExtension || isCloudinaryVideo;
};

export default function PostCard({ post, onDelete, onUpdate }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [likes, setLikes] = useState(post.likes || []);
    const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [deleted, setDeleted] = useState(false);

    const isOwner = user?._id && post?.user?._id && String(user._id) === String(post.user._id);

    // Listen for real-time metric updates
    useMetricsUpdate((data) => {
        if (data.type === 'post-like-count' && data.postId === post._id) {
            setLikes(Array(data.likesCount).fill(null));
        } else if (data.type === 'post-comment-count' && data.postId === post._id) {
            setCommentCount(data.commentsCount);
        }
    });

    useEffect(() => {
        if (post.likes) {
            setLikes(post.likes);
            if (user && post.likes.includes(user._id)) {
                setIsLiked(true);
            }
        }
    }, [post.likes, user]);

    const handleLike = async (e) => {
        e.stopPropagation();
        if (!user) return toast.error("Log in to like this post");

        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setLikes(prev => newLiked ? [...prev, user._id] : prev.filter(id => id !== user._id));

        try {
            const res = await fetch(`${BASE_URL}/post/${post._id}/like`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                credentials: "include"
            });
            if (!res.ok) {
                const data = await res.json();
                setIsLiked(!newLiked);
                setLikes(likes);
                toast.error(data.message || "Failed to like post");
            }
        } catch (error) {
            setIsLiked(!newLiked);
            setLikes(likes);
            toast.error("Network error");
        }
    };

    const deletePost = async (e) => {
        if (e) e.stopPropagation();
        const result = await swalVibe.fire({
            title: 'Delete this post?',
            text: "This post will be deleted forever.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete Forever'
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`${BASE_URL}/post/${post._id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (res.ok) {
                setDeleted(true);
                if (onDelete) onDelete(post._id);
            }
        } catch (err) {
            toast.error("Failed to delete post");
        }
    };

    const handleShare = (e) => {
        e.stopPropagation();
        const link = `${window.location.origin}/post/${post._id}`;
        navigator.clipboard.writeText(link);
        toast.success("Link copied!");
    };

    if (deleted) return null;

    const profileLink = post.user?._id ? `/user/${post.user._id}` : "#";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 sm:p-5 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-all duration-300 relative group"
            onClick={() => navigate(`/post/${post._id}`)}
        >
            <div className="flex gap-4">
                {/* Profile Pic with Glow */}
                <Link to={profileLink} onClick={(e) => e.stopPropagation()} className="flex-shrink-0 relative h-fit">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shadow-xl group/prof">
                        <img
                            src={post.user?.photoUrl || `https://ui-avatars.com/api/?name=${post.user?.name || 'User'}&background=6366f1&color=fff&bold=true`}
                            alt={post.user?.name}
                            className="w-full h-full object-cover transition-transform group-hover/prof:scale-110"
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-vibe-primary rounded-full border-2 border-black flex items-center justify-center">
                        <span className="text-[6px] font-black italic">V</span>
                    </div>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <Link to={profileLink} onClick={(e) => e.stopPropagation()} className="font-bold text-white hover:text-vibe-primary transition-colors truncate tracking-tight text-[15px]">
                                {post.user?.name || "Anonymous"}
                            </Link>
                            <span className="text-zinc-500 text-sm truncate font-medium">@{post.user?.username || "anonymous"}</span>
                            <span className="text-zinc-600">·</span>
                            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{timeAgo(post.createdAt)}</span>
                        </div>

                        {/* ⋮ Menu — Owner sees Edit/Delete, Others see Report */}
                        <div className="relative z-10">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                className="p-2 text-zinc-600 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                            >
                                <MoreHorizontal size={18} />
                            </button>
                            <AnimatePresence>
                                {showMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="absolute right-0 top-10 w-48 glass-card p-1 z-20 border border-white/10"
                                        >
                                            {isOwner ? (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-[13px] hover:bg-white/5 rounded-xl flex items-center gap-2.5 text-zinc-300 font-bold">
                                                        <Edit size={15} className="text-vibe-primary" /> Edit Post
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); deletePost(e); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-[13px] hover:bg-red-500/10 rounded-xl flex items-center gap-2.5 text-red-400 font-bold border-t border-white/5 mt-1">
                                                        <Trash2 size={15} /> Delete Forever
                                                    </button>
                                                </>
                                            ) : (
                                                user && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setIsReportOpen(true); setShowMenu(false); }}
                                                        className="w-full px-4 py-2.5 text-left text-[13px] hover:bg-red-500/10 rounded-xl flex items-center gap-2.5 text-red-400 font-bold"
                                                    >
                                                        <Flag size={15} /> Report Post
                                                    </button>
                                                )
                                            )}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="text-zinc-100 text-[16px] leading-relaxed mb-4 whitespace-pre-wrap break-words font-light">
                        {post.content}
                    </div>

                    {post.postUrl && (
                        <div className="mb-4 rounded-3xl overflow-hidden border border-white/5 bg-zinc-900 flex justify-center group/img">
                            {isVideo(post.postUrl) ? (
                                <video
                                    src={post.postUrl}
                                    controls
                                    muted
                                    loop
                                    className="w-full h-auto object-cover max-h-[500px]"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <img
                                    src={post.postUrl}
                                    alt=""
                                    className="w-full h-auto object-cover max-h-[500px] transition-transform duration-700 group-hover/img:scale-[1.02]"
                                    loading="lazy"
                                />
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between max-w-sm mt-5">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/post/${post._id}`); }}
                                className="flex items-center gap-2 text-zinc-500 hover:text-vibe-primary transition-all group/act"
                            >
                                <div className="p-2 rounded-xl group-hover/act:bg-vibe-primary/10 transition-colors">
                                    <MessageCircle size={19} />
                                </div>
                                <span className="text-xs font-black">{commentCount}</span>
                            </button>

                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 transition-all group/act ${isLiked ? "text-vibe-primary" : "text-zinc-500 hover:text-vibe-primary"}`}
                            >
                                <div className={`p-2 rounded-xl group-hover/act:bg-vibe-primary/10 transition-colors ${isLiked ? "bg-vibe-primary/5" : ""}`}>
                                    <Heart size={19} className={isLiked ? "fill-current" : ""} />
                                </div>
                                <span className="text-xs font-black">{likes.length || 0}</span>
                            </button>

                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 text-zinc-500 hover:text-vibe-accent transition-all group/act"
                            >
                                <div className="p-2 rounded-xl group-hover/act:bg-vibe-accent/10 transition-colors">
                                    <Share2 size={18} />
                                </div>
                            </button>

                            <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group/act">
                                <div className="p-2 rounded-xl group-hover/act:bg-white/5 transition-all">
                                    <Bookmark size={18} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <EditPostModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                post={post}
                onUpdate={() => onUpdate && onUpdate()}
            />
            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                postId={post._id}
            />
        </motion.div>
    );
}
