import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart, MessageCircle } from "lucide-react";
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
function CommentItem({ comment, onReply }) {
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
        if (!user) return toast.error("Please login to like");

        const newLikes = isLiked
            ? likes.filter(id => (id === user._id || id.toString?.() === user._id) === false)
            : [...likes, user._id];
        setLikes(newLikes);

        try {
            await fetch(`${BASE_URL}/comment/${comment._id}/like`, {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            setLikes(likes);
            toast.error("Failed to like comment");
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
            toast.error("Failed to fetch replies");
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
                toast.success("Reply added!");
            }
        } catch (error) {
            toast.error("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Link to={`/user/${comment.user?._id}`} className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 p-[1px] hover:scale-105 transition-transform">
                <img
                    src={comment.user?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.name}`}
                    alt="avatar"
                    className="w-full h-full rounded-full object-cover bg-black"
                />
            </Link>
            <div className="flex flex-col flex-1">
                <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                    <div className="flex items-baseline gap-2 mb-1">
                        <Link to={`/user/${comment.user?._id}`} className="font-semibold text-sm text-white hover:underline">{comment.user?.name}</Link>
                        <span className="text-[10px] text-gray-500">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                </div>

                {/* Like & Reply Buttons */}
                <div className="flex items-center gap-4 mt-1 pl-2">
                    <button
                        onClick={handleLikeComment}
                        className={`flex items-center gap-1 text-xs transition-colors p-1 ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-400"}`}
                    >
                        <Heart size={12} className={isLiked ? "fill-current" : ""} />
                        <span className="font-medium">{likes.length > 0 ? likes.length : "Like"}</span>
                    </button>

                    <button
                        onClick={() => setShowReplyInput(!showReplyInput)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 transition-colors p-1"
                    >
                        <MessageCircle size={12} />
                        <span className="font-medium">Reply</span>
                    </button>

                    {/* View Replies Button (Moved here for better flow) */}
                    {(replies.length > 0 || loadingReplies) && (
                        <button
                            onClick={fetchReplies}
                            className="text-xs text-gray-500 hover:text-white transition-colors ml-auto"
                        >
                            {loadingReplies ? "Loading..." : showReplies ? "Hide replies" : `View ${replies.length || ""} replies`}
                        </button>
                    )}
                </div>

                {/* Reply Input */}
                {showReplyInput && (
                    <form onSubmit={handleSendReply} className="flex items-center gap-2 mt-2 pl-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Write a reply..."
                                className="w-full bg-white/5 text-white rounded-full pl-4 pr-10 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent border border-white/10"
                                value={replyText}
                                autoFocus
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!replyText.trim() || sending}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-accent rounded-full text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                                {sending ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={10} />}
                            </button>
                        </div>
                    </form>
                )}

                {/* Replies List */}
                {showReplies && replies.length > 0 && (
                    <div className="mt-2 space-y-3 pl-3 border-l-2 border-white/5 ml-1">
                        {replies.map((reply, i) => (
                            <div key={reply._id || i} className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                                <Link to={`/user/${reply.user?._id}`} className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 p-[1px]">
                                    <img
                                        src={reply.user?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user?.name}`}
                                        alt="avatar"
                                        className="w-full h-full rounded-full object-cover bg-black"
                                    />
                                </Link>
                                <div>
                                    <div className="bg-white/5 p-2 rounded-xl rounded-tl-none border border-white/5">
                                        <div className="flex items-baseline gap-2">
                                            <Link to={`/user/${reply.user?._id}`} className="font-semibold text-xs text-white hover:underline">{reply.user?.name}</Link>
                                            <span className="text-[10px] text-gray-500">{timeAgo(reply.createdAt)}</span>
                                        </div>
                                        <p className="text-xs text-gray-300 mt-0.5">{reply.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CommentsModal({ isOpen, onClose, postId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (isOpen && postId) {
            setLoading(true);
            fetch(`${BASE_URL}/post/${postId}/comments`)
                .then(res => res.json())
                .then(data => {
                    setComments(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                    toast.error("Failed to load comments");
                });
        }
    }, [isOpen, postId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSending(true);
        try {
            const res = await fetch(`${BASE_URL}/post/${postId}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content: newComment })
            });

            const data = await res.json();
            if (res.ok) {
                setComments([data.comment, ...comments]);
                setNewComment("");
                toast.success("Comment added!");
            }
        } catch (error) {
            toast.error("Failed to add comment");
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="w-full max-w-lg bg-[#18181B] rounded-t-3xl md:rounded-3xl h-[85vh] md:h-[650px] flex flex-col relative border border-white/10 shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#18181B]/50 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-white">Comments</h2>
                            <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-gray-400">{comments.length}</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-3 animate-pulse">
                                        <div className="w-8 h-8 rounded-full bg-white/10" />
                                        <div className="flex-1 space-y-2">
                                            <div className="w-1/3 h-3 rounded bg-white/10" />
                                            <div className="w-3/4 h-3 rounded bg-white/5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                    <MessageCircle size={32} className="opacity-50" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium">No comments yet</p>
                                    <p className="text-xs text-gray-600">Start the conversation!</p>
                                </div>
                            </div>
                        ) : (
                            comments.map((comment, i) => (
                                <CommentItem key={comment._id || i} comment={comment} />
                            ))
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-[#18181B] flex items-center gap-3 active:pb-8 pb-8 md:pb-4 transition-all">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                className="w-full bg-black/40 text-white rounded-2xl pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent border border-white/5 transition-all"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || sending}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent rounded-xl text-white disabled:opacity-50 disabled:bg-gray-700 hover:bg-red-600 transition-colors shadow-lg shadow-accent/20"
                            >
                                {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
