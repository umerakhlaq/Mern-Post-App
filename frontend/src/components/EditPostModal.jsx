
import { useState } from "react";
import { X, Save, Image as ImageIcon, Sparkles, Globe, Lock, Hammer, Check, Radio, Layers } from "lucide-react";
import { BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function EditPostModal({ isOpen, onClose, post, onUpdate }) {
    const [content, setContent] = useState(post?.content || "");
    const [postUrl, setPostUrl] = useState(post?.postUrl || "");
    const [postFile, setPostFile] = useState(null);
    const [audience, setAudience] = useState((post?.isPublic ?? true) ? "public" : "followers");
    const [loading, setLoading] = useState(false);

    const isVideo = (url) => {
        if (!url) return false;
        return url.includes("/video/upload/") || [".mp4", ".webm", ".ogg", ".mov", ".m4v"].some(ext => url.toLowerCase().includes(ext));
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            toast.error("Post content required");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("content", content);
            formData.append("isPublic", audience === "public");
            
            if (postFile) {
                formData.append("image", postFile);
            } else {
                formData.append("postUrl", postUrl);
            }

            const res = await fetch(`${BASE_URL}/post/${post._id}`, {
                method: "PUT",
                credentials: "include",
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                onUpdate(data.post);
                onClose();
                toast.success("Post updated");
            } else {
                toast.error(data.message || "Failed to update post");
            }
        } catch (error) {
            toast.error("Something went wrong while updating");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Immersive Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
                    onClick={onClose}
                />

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-xl bg-[#0a0a0a]/90 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-10"
                >
                    {/* Atmospheric Header */}
                    <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-vibe-primary/20 rounded-2xl">
                                <Hammer size={20} className="text-vibe-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-black tracking-tight text-white leading-none">
                                    Edit Post
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-1.5">Update your post content</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 rounded-2xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form Hub */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                        {/* Visibility Portal */}
                        <div className="flex items-center justify-between bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <Radio size={16} className="text-vibe-accent" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Who can see this?</span>
                            </div>
                            <div className="relative group/select">
                                <select
                                    value={audience}
                                    onChange={(e) => setAudience(e.target.value)}
                                    className="bg-transparent text-vibe-primary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 pr-8 appearance-none focus:outline-none cursor-pointer hover:bg-white/5 rounded-xl transition-all border-none"
                                >
                                    <option value="public" className="bg-[#0a0a0a]">Everyone</option>
                                    <option value="followers" className="bg-[#0a0a0a]">Followers only</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-vibe-primary opacity-50">
                                    {audience === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                                </div>
                            </div>
                        </div>

                        {/* Frequency Stream */}
                        <div className="space-y-4">
                            <textarea
                                className="w-full min-h-[160px] bg-transparent text-white text-xl placeholder-zinc-700 resize-none focus:outline-none p-0 leading-relaxed font-light scrollbar-hide"
                                placeholder="Update your post..."
                                value={content}
                                maxLength={280}
                                onChange={(e) => setContent(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1 h-1 rounded-full ${content.length >= 260 ? 'bg-red-500 animate-pulse' : 'bg-vibe-primary'}`} />
                                    <span className={`text-[10px] font-black tracking-widest ${content.length >= 260 ? "text-red-500" : "text-zinc-600"}`}>{content.length} <span className="opacity-40">/ 280</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Visual Asset */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-3">
                                <ImageIcon size={16} className="text-vibe-secondary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Media</span>
                            </div>
                            
                             {postUrl ? (
                                <div className="relative rounded-3xl overflow-hidden border border-white/5 group bg-black shadow-2xl">
                                    {isVideo(postUrl) ? (
                                        <video src={postUrl} controls className="w-full max-h-72 object-contain" />
                                    ) : (
                                        <img
                                            src={postUrl}
                                            alt="Preview"
                                            className="w-full max-h-72 object-contain"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPostUrl("");
                                                setPostFile(null);
                                            }}
                                            className="p-4 bg-red-500/80 rounded-2xl text-white hover:bg-red-500 transition-all backdrop-blur-md active:scale-95"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                     <input
                                        type="text"
                                        className="input-vibe text-sm"
                                        placeholder="Paste image URL..."
                                        value={postUrl}
                                        onChange={(e) => setPostUrl(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => document.getElementById('editPostMedia').click()}
                                        className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ImageIcon size={16} /> Upload Media (Image/Video)
                                    </button>
                                    <input 
                                        id="editPostMedia"
                                        type="file" 
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setPostFile(file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => setPostUrl(reader.result);
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Sync Actions */}
                    <div className="px-8 py-6 border-t border-white/5 bg-black/40 backdrop-blur-xl flex justify-end gap-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !content.trim()}
                            className="btn-primary px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 shadow-xl shadow-vibe-primary/20 hover:shadow-vibe-primary/40 active:scale-95"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Save Changes <Check size={14} /></>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}