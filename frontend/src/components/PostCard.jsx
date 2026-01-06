import { Heart, MessageCircle, Share2, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EditPostModal from "./EditPostModal";
import CommentsModal from "./CommentsModal";
import { BASE_URL } from "../utils/constants";
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

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

export default function PostCard({ post }) {
    const { user } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [postData, setPostData] = useState(post);

    const isOwner = user?._id && postData?.user?._id && String(user._id) === String(postData.user._id);

    // Like Logic
    const [likes, setLikes] = useState(postData.likes || []);
    const isLiked = user && likes.includes(user._id);

    const handleLike = async () => {
        if (!user) return toast.error("Please login to like");

        // Optimistic UI update
        const newLikes = isLiked
            ? likes.filter(id => id !== user._id)
            : [...likes, user._id];
        setLikes(newLikes);

        try {
            await fetch(`${BASE_URL}/post/${postData._id}/like`, {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            // Revert on error
            setLikes(likes);
            toast.error("Like failed");
        }
    };

    const deletePost = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            background: '#18181B',
            color: '#fff',
            showCancelButton: true,
            confirmButtonColor: '#ff0050',
            cancelButtonColor: '#333',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`${BASE_URL}/post/${post._id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (res.ok) {
                setDeleted(true);
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your post has been deleted.',
                    icon: 'success',
                    background: '#18181B',
                    color: '#fff',
                    confirmButtonColor: '#ff0050'
                });
            } else {
                toast.error("Failed to delete");
            }
        } catch (err) {
            toast.error("Error deleting");
        }
    };

    if (deleted) return null;

    const handleShare = (postId) => {
        const link = `${window.location.origin}/post/${postId}`;

        if (navigator.share) {
            navigator.share({ title: "Check this post", url: link });
        } else {
            navigator.clipboard.writeText(link);
            toast.success("Link copied to clipboard!");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-xl mx-auto bg-[#18181B] rounded-3xl overflow-hidden mb-6 border border-white/5 shadow-xl group hover:border-white/10 transition-colors"
        >
            {/* Header: User Info & Options */}
            <div className="flex items-center justify-between px-5 py-4">
                <span className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-accent to-orange-400 cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg">
                        <img
                            src={postData.user?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${postData.user?.name || 'User'}`}
                            alt="avatar"
                            className="w-full h-full rounded-full border-2 border-[#18181B] object-cover bg-white"
                        />
                    </div>
                    <div className="flex flex-col justify-center leading-tight">
                        <div className="flex items-center gap-2">
                            <Link to={`/user/${postData.user?._id}`} className="font-semibold text-white text-[15px] hover:text-gray-200 transition-colors hover:underline cursor-pointer">
                                {postData.user?.name}
                            </Link>
                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                            <span className="text-xs text-gray-500 font-medium">{timeAgo(postData.createdAt || new Date())}</span>
                        </div>
                    </div>
                </span>

                {isOwner && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-gray-400 p-2 rounded-full hover:bg-white/5 hover:text-white transition-all"
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-[#27272A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 origin-top-right transform transition-all">
                                <button onClick={() => { setIsEditOpen(true); setShowMenu(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 flex items-center gap-2 text-gray-200 transition-colors">
                                    <Edit size={16} /> Edit
                                </button>
                                <button onClick={() => { deletePost(); setShowMenu(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-red-500/10 text-red-400 flex items-center gap-2 transition-colors">
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Media / Content */}
            <div className="px-3">
                <div className="relative w-full rounded-2xl overflow-hidden bg-black/20 group">
                    {postData.postUrl ? (
                        <div className="overflow-hidden rounded-2xl" onDoubleClick={handleLike}>
                            <img
                                src={postData.postUrl}
                                alt="Post content"
                                className="w-full h-auto object-cover max-h-[600px] transform group-hover:scale-[1.01] transition-transform duration-500 ease-out"
                            />
                        </div>
                    ) : (
                        <div className="p-12 text-center min-h-[300px] flex items-center justify-center bg-gradient-to-br from-[#27272A] to-[#18181B] rounded-2xl border border-white/5">
                            <p className="text-2xl font-medium text-white/90 leading-relaxed font-serif">
                                "{postData.content}"
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Content & Actions */}
            <div className="px-5 py-4">

                {/* Caption */}
                {postData.postUrl && postData.content && (
                    <div className="mb-4">
                        <p className="text-[15px] text-gray-300 leading-relaxed">
                            <Link to={`/user/${postData.user?._id}`} className="font-semibold text-white mr-2 hover:underline cursor-pointer">{postData.user?.name}</Link>
                            {postData.content}
                        </p>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 group transition-colors ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
                        >
                            <Heart size={22} className={`transition-transform duration-200 ${isLiked ? "fill-current scale-110" : "group-hover:scale-110"}`} />
                            <span className="text-sm font-medium">{likes.length > 0 ? likes.length : "Like"}</span>
                        </button>

                        <button
                            onClick={() => setIsCommentsOpen(true)}
                            className="flex items-center gap-2 group text-gray-400 hover:text-blue-400 transition-colors"
                        >
                            <MessageCircle size={22} className="group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-sm font-medium">{postData.comments?.length > 0 ? postData.comments.length : "Comment"}</span>
                        </button>
                    </div>

                    <button onClick={() => handleShare(postData._id)} className="flex items-center gap-2 group text-gray-400 hover:text-green-400 transition-colors">
                        <Share2 size={22} className="group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-sm font-medium">Share</span>
                    </button>
                </div>
            </div>

            <EditPostModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                post={postData}
                onUpdate={setPostData}
            />

            <CommentsModal
                isOpen={isCommentsOpen}
                onClose={() => setIsCommentsOpen(false)}
                postId={postData._id}
            />
        </motion.div>
    );
}
