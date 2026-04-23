import { useState, useEffect, useRef } from "react";
import { X, FileText, Image as ImageIcon, Check, Upload, Camera, Video, Trash2 } from "lucide-react";
import { BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];
    const isVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    const isCloudinaryVideo = url.includes("/video/upload/");
    return isVideoExtension || isCloudinaryVideo;
};

export default function AdminEditPostModal({ isOpen, onClose, post, onUpdate }) {
    const [formData, setFormData] = useState({
        content: "",
        isPinned: false,
        isTrending: false,
        isHidden: false
    });
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
    const [removeMedia, setRemoveMedia] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (post) {
            setFormData({
                content: post.content || "",
                isPinned: post.isPinned || false,
                isTrending: post.isTrending || false,
                isHidden: post.isHidden || false
            });
            setMediaPreview(post.postUrl || null);
            setMediaType(post.postUrl ? (isVideo(post.postUrl) ? 'video' : 'image') : null);
            setRemoveMedia(false);
        }
    }, [post, isOpen]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Please select a valid image or video file");
                return;
            }

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be less than 10MB");
                return;
            }

            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
            setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
            setRemoveMedia(false);
        }
    };

    const handleRemoveMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setMediaType(null);
        setRemoveMedia(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append("content", formData.content);
            submitData.append("isPinned", formData.isPinned.toString());
            submitData.append("isTrending", formData.isTrending.toString());
            submitData.append("isHidden", formData.isHidden.toString());

            if (mediaFile) {
                submitData.append("image", mediaFile);
            } else if (removeMedia) {
                submitData.append("removeMedia", "true");
            }

            const res = await fetch(`${BASE_URL}/admin/posts/${post._id}`, {
                method: "PUT",
                credentials: "include",
                body: submitData
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Post updated successfully");
                onUpdate && onUpdate(data);
                onClose();
            } else {
                toast.error(data.message || "Failed to update post");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-blue-500/15 rounded-xl flex items-center justify-center">
                                <FileText size={15} className="text-blue-400" />
                            </div>
                            <h2 className="font-bold text-white text-[16px]">Edit Post</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Current Post Preview */}
                            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
                                <h3 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-widest">Current Post</h3>
                                <div className="flex items-start gap-3">
                                    <img
                                        src={post?.user?.photoUrl || `https://ui-avatars.com/api/?name=${post?.user?.name}&background=8B5CF6&color=fff&bold=true`}
                                        alt=""
                                        className="w-8 h-8 rounded-lg border border-white/5"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white text-sm">{post?.user?.name}</span>
                                            <span className="text-zinc-500 text-xs">@{post?.user?.username}</span>
                                        </div>
                                        {post?.content && (
                                            <p className="text-zinc-300 text-sm mb-2">{post.content}</p>
                                        )}
                                        {post?.postUrl && (
                                            <div className="relative inline-block">
                                                {isVideo(post.postUrl) ? (
                                                    <div className="w-20 h-20 bg-zinc-800 rounded-lg flex items-center justify-center">
                                                        <video
                                                            src={post.postUrl}
                                                            className="w-full h-full object-cover rounded-lg"
                                                            muted
                                                        />
                                                        <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                                                            <div className="w-4 h-4 bg-black/50 rounded-full flex items-center justify-center">
                                                                <div className="w-0 h-0 border-l-1 border-l-white border-t-0.5 border-t-transparent border-b-0.5 border-b-transparent ml-0.5"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={post.postUrl}
                                                        alt="Post media"
                                                        className="w-20 h-20 object-cover rounded-lg border border-white/10"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Edit Content */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Content</label>
                                <div className="relative">
                                    <FileText size={16} className="absolute left-4 top-3 text-zinc-600" />
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        rows={4}
                                        maxLength={500}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                                        placeholder="Edit post content..."
                                    />
                                </div>
                                <p className="text-xs text-zinc-600 mt-1">{formData.content.length}/500</p>
                            </div>

                            {/* Media Upload */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-3 uppercase tracking-widest">Media</label>
                                <div className="space-y-4">
                                    {/* Current/Preview Media */}
                                    {mediaPreview && (
                                        <div className="relative inline-block">
                                            {mediaType === 'video' ? (
                                                <div className="relative w-32 h-32 bg-zinc-800 rounded-2xl overflow-hidden border border-white/10">
                                                    <video
                                                        src={mediaPreview}
                                                        className="w-full h-full object-cover"
                                                        controls
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveMedia}
                                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-all"
                                                    >
                                                        <Trash2 size={12} className="text-white" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative w-32 h-32 bg-zinc-800 rounded-2xl overflow-hidden border border-white/10">
                                                    <img
                                                        src={mediaPreview}
                                                        alt="Media preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveMedia}
                                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-all"
                                                    >
                                                        <Trash2 size={12} className="text-white" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Upload Area */}
                                    <div className="relative">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="media-upload"
                                        />
                                        <label
                                            htmlFor="media-upload"
                                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                                        >
                                            <div className="flex items-center gap-2 text-zinc-500 group-hover:text-blue-400 transition-colors">
                                                <Upload size={20} />
                                                <span className="text-sm font-medium">
                                                    {mediaPreview ? "Change media" : "Upload new media"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-600 mt-1">
                                                Images or videos up to 10MB
                                            </p>
                                        </label>
                                    </div>

                                    {/* Media Info */}
                                    <div className="flex items-center gap-4 text-xs text-zinc-600">
                                        <div className="flex items-center gap-1">
                                            <ImageIcon size={12} />
                                            <span>JPG, PNG, GIF, WebP</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Video size={12} />
                                            <span>MP4, WebM, OGG</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Post Status Toggles */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Post Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isPinned"
                                            checked={formData.isPinned}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                            formData.isPinned ? 'bg-amber-500 border-amber-500' : 'border-zinc-600'
                                        }`}>
                                            {formData.isPinned && <Check size={12} className="text-white" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                                            <span className="text-sm font-bold text-white">Pinned</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isTrending"
                                            checked={formData.isTrending}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                            formData.isTrending ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'
                                        }`}>
                                            {formData.isTrending && <Check size={12} className="text-white" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                                            <span className="text-sm font-bold text-white">Trending</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isHidden"
                                            checked={formData.isHidden}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                            formData.isHidden ? 'bg-red-500 border-red-500' : 'border-zinc-600'
                                        }`}>
                                            {formData.isHidden && <Check size={12} className="text-white" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                            <span className="text-sm font-bold text-white">Hidden</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all flex items-center gap-2"
                                >
                                    {loading ? "Updating..." : "Update Post"}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}