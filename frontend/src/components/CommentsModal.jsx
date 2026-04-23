
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart, MessageCircle, ChevronDown, ChevronUp, MoreHorizontal, User, Zap, SendHorizontal, Radio, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";

// Helper to format time
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

// Single Comment Component with Like & Reply
function CommentItem({ comment }) {
    const { user } = useAuth();
    const [likes, setLikes] = useState(comment.likes || []);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replies, setReplies] = useState([]);
    const [showReplies, setShowReplies] = useState(false);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [sending, setSending] = useState(false);

    const isLiked = user && likes.some(id => id === user._id || id.toString?.() === user._id);

    const handleLikeComment = async () => {
        if (!user) return toast.error("Vibe sync required to like");

        const newLikes = isLiked
            ? likes.filter(id => (id === user._id || id.toString?.() === user._id) === false)
            : [...likes, user._id];
        setLikes(newLikes);

        try {
            await fetch(`${BASE_URL}/comment/${comment._id}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
        } catch (error) {
            setLikes(likes);
            toast.error("Vibe like failed");
        }
    };

    const fetchReplies = async () => {
        if (showReplies) {
            setShowReplies(false);
            return;
        }
        setLoadingReplies(true);
        try {
            const res = await fetch(`${BASE_URL}/comment/${comment._id}/replies`);
            const data = await res.json();
            setReplies(data);
            setShowReplies(true);
        } catch (error) {
            toast.error("Vibe interference on replies");
        } finally {
            setLoadingReplies(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setSending(true);
        try {
            const res = await fetch(`${BASE_URL}/comment/${comment._id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content: replyText })
            });

            const data = await res.json();
            if (res.ok) {
                setReplies([...replies, data.reply]);
                setReplyText("");
                setShowReplyInput(false);
                setShowReplies(true);
                toast.success("Broadcasted reply!");
            }
        } catch (error) {
            toast.error("Broadcast failed");
        } finally {
            setSending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 mb-8 group"
        >
            <Link to={`/user/${comment.user?._id}`} className="shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden relative shadow-xl group-hover:border-vibe-primary/30 transition-colors">
                    <img
                        src={comment.user?.photoUrl || `https://ui-avatars.com/api/?name=${comment.user?.name}&background=8B5CF6&color=fff&bold=true`}
                        alt="avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
            </Link>

            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to={`/user/${comment.user?._id}`} className="font-bold text-[14px] text-white hover:text-vibe-primary transition-colors">
                            {comment.user?.name || "identity"}
                        </Link>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 font-display">{timeAgo(comment.createdAt)}</span>
                    </div>
                </div>

                <p className="text-[15px] text-zinc-300 leading-relaxed mt-1 whitespace-pre-wrap break-words font-light">{comment.content}</p>

                <div className="flex items-center gap-8 mt-4">
                    <button
                        onClick={handleLikeComment}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isLiked ? "text-vibe-accent" : "text-zinc-600 hover:text-vibe-accent"}`}
                    >
                        <Zap size={14} className={`${isLiked ? "fill-current" : ""}`} />
                        <span>{likes.length > 0 ? likes.length : ""}</span>
                    </button>

                    <button
                        onClick={() => setShowReplyInput(!showReplyInput)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-vibe-primary transition-all"
                    >
                        <MessageCircle size={14} />
                        <span>Echo</span>
                    </button>

                    {(replies.length > 0 || (comment.replies && comment.replies.length > 0)) && (
                        <button
                            onClick={fetchReplies}
                            className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-vibe-secondary transition-all ml-auto flex items-center gap-2"
                        >
                            {loadingReplies ? "Syncing..." : showReplies ? "Collapse" : `${replies.length || comment.replies?.length} Echoes`}
                            {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {showReplyInput && (
                        <motion.form 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleSendReply} 
                            className="flex items-center gap-3 mt-6 overflow-hidden"
                        >
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Input frequency..."
                                    className="w-full bg-white/5 text-white rounded-2xl pl-5 pr-14 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-vibe-primary border border-white/5 placeholder-zinc-700 font-medium"
                                    value={replyText}
                                    autoFocus
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!replyText.trim() || sending}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-vibe-primary disabled:opacity-50 hover:bg-vibe-primary/10 rounded-xl transition-all"
                                >
                                    {sending ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <SendHorizontal size={18} />}
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {showReplies && replies.length > 0 && (
                    <div className="mt-8 space-y-8 pl-4 border-l border-white/5 ml-[-18px]">
                        {replies.map((reply, i) => (
                            <div key={reply._id || i} className="flex gap-4 group/reply">
                                <Link to={`/user/${reply.user?._id}`} className="shrink-0">
                                    <div className="w-8 h-8 rounded-xl bg-zinc-900 overflow-hidden border border-white/5 group-hover/reply:border-vibe-primary/40 transition-colors">
                                        <img src={reply.user?.photoUrl || `https://ui-avatars.com/api/?name=${reply.user?.name}&background=4F46E5&color=fff&bold=true`} alt="avatar" className="w-full h-full object-cover" />
                                    </div>
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Link to={`/user/${reply.user?._id}`} className="font-bold text-xs text-zinc-100 hover:text-vibe-primary">{reply.user?.name}</Link>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{timeAgo(reply.createdAt)}</span>
                                    </div>
                                    <p className="text-[14px] text-zinc-400 mt-0.5 leading-relaxed font-light">{reply.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function CommentsModal({ isOpen, onClose, postId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen && postId) {
            setLoading(true);
            const id = typeof postId === 'object' ? postId._id : postId;

            fetch(`${BASE_URL}/post/${id}/comments`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setComments(data);
                    } else {
                        setComments([]);
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [isOpen, postId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSending(true);
        try {
            const id = typeof postId === 'object' ? postId._id : postId;
            const res = await fetch(`${BASE_URL}/post/${id}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content: newComment })
            });

            const data = await res.json();
            if (res.ok) {
                setComments([data.comment, ...comments]);
                setNewComment("");
                toast.success("Broadcast successful!");
            }
        } catch (error) {
            toast.error("Frequency loss detected");
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-3xl" 
                    onClick={onClose} 
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-2xl bg-[#0a0a0a]/90 border border-white/10 rounded-[40px] shadow-2xl h-[85vh] flex flex-col overflow-hidden relative z-10"
                >
                    {/* Atmospheric Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 sticky top-0 bg-black/40 backdrop-blur-xl z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-vibe-accent/20 rounded-2xl">
                                <Radio size={20} className="text-vibe-accent animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-black tracking-tight text-white leading-none">Vibe Threads</h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-1.5 flex items-center gap-2">
                                   <Layers size={12} className="text-vibe-primary" /> Multi-layered Frequency
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all active:scale-90">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Vibe Thread Space */}
                    <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                        {loading ? (
                            <div className="space-y-10 pt-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4 animate-pulse">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5" />
                                        <div className="flex-1 space-y-4">
                                            <div className="w-32 h-2 rounded bg-white/5" />
                                            <div className="w-full h-2 rounded bg-white/5" />
                                            <div className="w-2/3 h-2 rounded bg-white/5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-8 py-20">
                                <motion.div 
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        opacity: [0.3, 0.6, 0.3]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center border border-white/5"
                                >
                                    <MessageCircle size={40} strokeWidth={1.5} />
                                </motion.div>
                                <div className="text-center">
                                    <h3 className="font-display font-black text-white text-2xl mb-3 tracking-tight">Silent Orbit</h3>
                                    <p className="text-sm font-medium max-w-xs mx-auto text-zinc-500 leading-relaxed">No echoes have been detected in this thread. Be the first to broadcast.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="pb-10">
                                {comments.map((comment, i) => (
                                    <CommentItem key={comment._id || i} comment={comment} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Broadcast Input Area */}
                    <div className="px-8 py-6 border-t border-white/5 bg-black/40 backdrop-blur-xl sticky bottom-0">
                        <form onSubmit={handleSend} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl border border-white/10 overflow-hidden shrink-0 shadow-lg">
                                <img 
                                    src={user?.photoUrl || `https://ui-avatars.com/api/?name=${user?.name || 'V'}&background=8B5CF6&color=fff&bold=true`} 
                                    alt="Me" 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <div className="relative flex-1 group">
                                <input
                                    type="text"
                                    placeholder={user ? "Share your frequency..." : "Sync identity to broadcast"}
                                    disabled={!user}
                                    className="input-vibe px-6 py-4 text-[15px] font-medium placeholder-zinc-700 bg-white/5 group-focus-within:bg-white/10 transition-all"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || sending}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-vibe-primary hover:bg-vibe-primary/10 rounded-2xl disabled:opacity-50 transition-all active:scale-90"
                                >
                                    {sending ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <SendHorizontal size={20} />}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}