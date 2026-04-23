import { useState, useEffect } from "react";
import { X, User, MapPin, Link as LinkIcon, AtSign, Mail, FileText, Check, Shield, ShieldX } from "lucide-react";
import { BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function EditUserModal({ isOpen, onClose, user, onUpdate }) {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        about: "",
        location: "",
        website: "",
        gender: "",
        age: "",
        isVerified: false,
        isSuspended: false,
        isFrozen: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                username: user.username || "",
                email: user.email || "",
                about: user.about || "",
                location: user.location || "",
                website: user.website || "",
                gender: user.gender || "",
                age: user.age || "",
                isVerified: user.isVerified || false,
                isSuspended: user.isSuspended || false,
                isFrozen: user.isFrozen || false
            });
        }
    }, [user, isOpen]);

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
            const res = await fetch(`${BASE_URL}/admin/users/${user._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("User updated successfully");
                onUpdate && onUpdate(data);
                onClose();
            } else {
                toast.error(data.message || "Failed to update user");
            }
        } catch (err) {
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
                                <User size={15} className="text-blue-400" />
                            </div>
                            <h2 className="font-bold text-white text-[16px]">Edit User</h2>
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
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Name</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-all"
                                            placeholder="Enter name"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Username</label>
                                    <div className="relative">
                                        <AtSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-all"
                                            placeholder="Enter username"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-all"
                                        placeholder="Enter email"
                                        required
                                    />
                                </div>
                            </div>

                            {/* About */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">About</label>
                                <div className="relative">
                                    <FileText size={16} className="absolute left-4 top-3 text-zinc-600" />
                                    <textarea
                                        name="about"
                                        value={formData.about}
                                        onChange={handleChange}
                                        rows={3}
                                        maxLength={160}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                                <p className="text-xs text-zinc-600 mt-1">{formData.about.length}/160</p>
                            </div>

                            {/* Location & Website */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Location</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-all"
                                            placeholder="Enter location"
                                            maxLength={30}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Website</label>
                                    <div className="relative">
                                        <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-all"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Gender & Age */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        min={18}
                                        max={100}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-all"
                                        placeholder="Enter age"
                                    />
                                </div>
                            </div>

                            {/* Status Toggles */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Account Status</h3>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isVerified"
                                            checked={formData.isVerified}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                            formData.isVerified ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'
                                        }`}>
                                            {formData.isVerified && <Check size={12} className="text-white" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className="text-emerald-400" />
                                            <span className="text-sm font-bold text-white">Verified</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isSuspended"
                                            checked={formData.isSuspended}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                            formData.isSuspended ? 'bg-red-500 border-red-500' : 'border-zinc-600'
                                        }`}>
                                            {formData.isSuspended && <Check size={12} className="text-white" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ShieldX size={16} className="text-red-400" />
                                            <span className="text-sm font-bold text-white">Suspended</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isFrozen"
                                            checked={formData.isFrozen}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                            formData.isFrozen ? 'bg-amber-500 border-amber-500' : 'border-zinc-600'
                                        }`}>
                                            {formData.isFrozen && <Check size={12} className="text-white" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Lock size={16} className="text-amber-400" />
                                            <span className="text-sm font-bold text-white">Frozen</span>
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
                                    {loading ? "Updating..." : "Update User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}