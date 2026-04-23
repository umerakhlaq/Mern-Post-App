import { useState } from "react";
import { Image, Send, Smile, Globe, Zap, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CreatePostSmall({ onPostCreated }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-vibe-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex gap-4 md:gap-6 relative z-10">
                <div className="shrink-0 pt-1">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                        <img 
                            src={user?.photoUrl || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366F1&color=fff&bold=true`} 
                            alt="Me" 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                </div>
                
                <div className="flex-1">
                    <div 
                        onClick={() => navigate("/create")}
                        className="w-full text-zinc-600 text-lg md:text-xl py-2 md:py-3 cursor-pointer hover:text-zinc-400 transition-all font-light tracking-tight"
                    >
                        What's on your mind?
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 md:pt-6 border-t border-white/5 mt-4 md:mt-6">
                        <div className="flex items-center gap-1 md:gap-2 text-zinc-500">
                            {[Image, Smile, Sparkles, Globe].map((Icon, i) => (
                                <button key={i} onClick={() => navigate("/create")} className="p-2.5 md:p-3 hover:bg-white/5 rounded-xl md:rounded-2xl transition-all hover:text-vibe-primary active:scale-90">
                                    <Icon size={18} strokeWidth={1.5} />
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate("/create")}
                            className="bg-vibe-primary hover:bg-vibe-primary/90 text-white font-black px-6 py-2.5 rounded-2xl transition-all text-xs uppercase tracking-widest shadow-lg shadow-vibe-primary/20 hover:shadow-vibe-primary/40 active:scale-95"
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
