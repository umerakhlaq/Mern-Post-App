
import { useState, useEffect } from "react";
import { X, User, MapPin, Link as LinkIcon, Image as ImageIcon, Sparkles, AtSign, Hammer, Check, Camera, Layers } from "lucide-react";
import { BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function EditProfileModal({ isOpen, onClose, currentUser, onUpdate }) {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        about: "",
        location: "",
        website: "",
        photoUrl: "",
        coverUrl: "",
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || "",
                username: currentUser.username || "",
                about: currentUser.about || "",
                location: currentUser.location || "",
                website: currentUser.website || "",
                photoUrl: currentUser.photoUrl || "",
                coverUrl: currentUser.coverUrl || "",
            });
        }
    }, [currentUser, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formDataToSubmit = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== "photoUrl" && key !== "coverUrl") {
                    formDataToSubmit.append(key, formData[key]);
                }
            });

            if (photoFile) formDataToSubmit.append("photo", photoFile);
            if (coverFile) formDataToSubmit.append("cover", coverFile);

            const res = await fetch(`${BASE_URL}/updateProfile`, {
                method: "PUT",
                credentials: "include",
                body: formDataToSubmit,
            });

            const data = await res.json();
            if (res.ok) {
                onUpdate(data.user);
                onClose();
                toast.success("Profile updated successfully!");
                setPhotoFile(null);
                setCoverFile(null);
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === "photo") {
                setPhotoFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setFormData({ ...formData, photoUrl: reader.result });
                reader.readAsDataURL(file);
            } else {
                setCoverFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setFormData({ ...formData, coverUrl: reader.result });
                reader.readAsDataURL(file);
            }
        }
    };

    if (!isOpen) return null;

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
                    className="w-full max-w-2xl bg-[#0a0a0a]/90 border border-white/10 rounded-[40px] shadow-[0_0_100px_rgba(139,92,246,0.1)] overflow-hidden flex flex-col max-h-[90vh] relative z-10"
                >
                    {/* Atmospheric Header */}
                    <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-vibe-primary/20 rounded-2xl">
                                <Hammer size={20} className="text-vibe-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-black tracking-tight text-white leading-none">
                                    Edit Profile
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-1.5">Update your personal information</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 rounded-2xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form Container */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                        
                        {/* Identity Visualization */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-vibe-primary">
                                <Camera size={18} />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Profile Pictures</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Cover Photo</label>
                                    <div 
                                        onClick={() => document.getElementById('coverInput').click()}
                                        className="relative h-24 rounded-2xl bg-white/5 border border-white/10 border-dashed hover:border-vibe-primary/50 transition-all cursor-pointer overflow-hidden flex items-center justify-center group"
                                    >
                                        {formData.coverUrl ? (
                                            <>
                                                <img src={formData.coverUrl} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </>
                                        ) : (
                                            <ImageIcon size={20} className="text-zinc-600 transition-colors" />
                                        )}
                                        <input 
                                            id="coverInput"
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, "cover")}
                                            className="hidden" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Avatar Photo</label>
                                    <div 
                                         onClick={() => document.getElementById('photoInput').click()}
                                         className="relative h-24 w-24 mx-auto md:mx-0 rounded-full bg-white/5 border border-white/10 border-dashed hover:border-vibe-accent/50 transition-all cursor-pointer overflow-hidden flex items-center justify-center group"
                                    >
                                        {formData.photoUrl ? (
                                            <>
                                                <img src={formData.photoUrl} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </>
                                        ) : (
                                            <User size={20} className="text-zinc-600 transition-colors" />
                                        )}
                                        <input 
                                            id="photoInput"
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, "photo")}
                                            className="hidden" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-white/5" />

                        {/* Core Data */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-vibe-accent">
                                <Layers size={18} />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Personal Info</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Display Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Name"
                                        className="input-vibe text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Username</label>
                                    <div className="relative group">
                                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <AtSign size={16} className="text-zinc-600" />
                                        </div>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder="username"
                                            className="input-vibe pl-11 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Bio</label>
                                <textarea
                                    name="about"
                                    value={formData.about}
                                    onChange={handleChange}
                                    placeholder="Write something about yourself..."
                                    className="input-vibe min-h-[120px] resize-none py-4 text-sm font-medium leading-relaxed"
                                    maxLength={160}
                                />
                                <div className="text-right text-[10px] font-black tracking-widest text-zinc-600 mt-2">
                                    {formData.about.length} <span className="opacity-40">/ 160</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Location</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MapPin size={16} className="text-zinc-600" />
                                        </div>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="City, World"
                                            className="input-vibe pl-11 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Website</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <LinkIcon size={16} className="text-zinc-600" />
                                        </div>
                                        <input
                                            type="text"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            placeholder="yourworld.com"
                                            className="input-vibe pl-11 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Action Hub */}
                    <div className="px-8 py-6 border-t border-white/5 bg-black/40 backdrop-blur-xl flex justify-end gap-5">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn-primary px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 shadow-xl shadow-vibe-primary/20 hover:shadow-vibe-primary/40 active:scale-95"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Save Profile <Check size={14} /></>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
