import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, User, FileText, Link as LinkIcon } from "lucide-react";
import { BASE_URL } from "../utils/constants";

export default function EditProfileModal({ isOpen, onClose, user, onUpdate }) {
    const [formData, setFormData] = useState({
        name: user?.name || "",
        about: user?.about || "",
        photoUrl: user?.photoUrl || "",
        // Add other fields as per schema if needed
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/updateProfile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", // Important for cookies
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                onUpdate(data.user); // Update parent state
                onClose();
                alert("Profile Updated!");
            } else {
                alert("Failed: " + (data.message || "Unknown error"));
            }
        } catch (error) {
            console.error(error);
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
                    className="w-full max-w-md glass rounded-2xl p-6 relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Name */}
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Full Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                    className="w-full p-3 pl-10 bg-black/40 rounded-xl text-white border border-white/5 focus:border-accent focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* About / Bio */}
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">About</label>
                            <div className="relative">
                                <FileText size={18} className="absolute left-3 top-3.5 text-gray-500" />
                                <textarea
                                    name="about"
                                    value={formData.about}
                                    onChange={handleChange}
                                    placeholder="Tell us about yourself..."
                                    className="w-full p-3 pl-10 h-24 bg-black/40 rounded-xl text-white border border-white/5 focus:border-accent focus:outline-none resize-none"
                                />
                            </div>
                        </div>

                        {/* Photo URL */}
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Avatar URL</label>
                            <div className="relative">
                                <LinkIcon size={18} className="absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="text"
                                    name="photoUrl"
                                    value={formData.photoUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/me.jpg"
                                    className="w-full p-3 pl-10 bg-black/40 rounded-xl text-white border border-white/5 focus:border-accent focus:outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? "Saving..." : (
                                <>
                                    <Save size={18} /> Save Changes
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
