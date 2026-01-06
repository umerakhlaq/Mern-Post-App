import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Image, FileText } from "lucide-react";
import { BASE_URL } from "../utils/constants";

export default function EditPostModal({ isOpen, onClose, post, onUpdate }) {
    const [content, setContent] = useState(post?.content || "");
    const [postUrl, setPostUrl] = useState(post?.postUrl || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/post/${post._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content, postUrl, isPublic: true }),
            });

            const data = await res.json();
            if (res.ok) {
                onUpdate(data.post);
                onClose();
                alert("Post Updated!");
            } else {
                alert("Failed: " + (data.message || "Unknown error"));
            }
        } catch (error) {
            alert("Network Error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-lg glass rounded-2xl p-6 relative"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>

                    <h2 className="text-2xl font-bold mb-6 text-center">Edit Post</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <textarea
                            className="w-full h-32 p-4 bg-black/40 rounded-xl mb-2 text-white resize-none border border-white/5 focus:border-accent focus:outline-none"
                            placeholder="What's happening?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />

                        {postUrl ? (
                            <div className="relative mb-2 rounded-xl overflow-hidden group">
                                <img src={postUrl} alt="Preview" className="w-full max-h-40 object-cover" />
                                <button type="button" onClick={() => setPostUrl("")} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <input
                                type="text"
                                className="w-full p-3 bg-black/40 rounded-xl text-white border border-white/5 focus:border-accent focus:outline-none text-sm"
                                placeholder="Image URL..."
                                value={postUrl}
                                onChange={(e) => setPostUrl(e.target.value)}
                            />
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? "Saving..." : <><Save size={18} /> Update Post</>}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
