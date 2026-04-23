
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio, Zap, ArrowLeft, Fingerprint, Activity } from "lucide-react";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-8 text-center font-display relative overflow-hidden selection:bg-vibe-primary/30">
            {/* Ambient background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-vibe-primary/10 rounded-full blur-[180px] opacity-40 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-vibe-accent/5 rounded-full blur-[120px]" />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-2xl px-8 flex flex-col items-center"
            >
                <div className="relative mb-16">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-[180px] md:text-[240px] font-black leading-none italic tracking-tighter opacity-5 select-none text-white pointer-events-none"
                    >
                        404
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-40 bg-zinc-900 rounded-[48px] border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-vibe-primary/20 via-transparent to-vibe-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Radio size={56} className="text-zinc-600 group-hover:text-vibe-primary transition-colors animate-pulse" strokeWidth={1} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mb-20">
                    <div className="flex items-center justify-center gap-3 text-vibe-primary mb-6">
                        <Activity size={18} className="animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">Signal Lost in Nexus</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter uppercase italic">
                        The frequency <br />
                        <span className="gradient-text">is offline.</span>
                    </h1>
                    <p className="text-zinc-500 font-medium max-w-md mx-auto leading-relaxed pt-2">
                        The requested location has either vanished into the void or never reached this node. We're recalibrating the network for you.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 w-full max-w-sm">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(-1)}
                        className="flex-1 px-8 py-5 border border-white/5 bg-white/5 rounded-2xl hover:bg-zinc-800 transition-all font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                    >
                        <ArrowLeft size={16} /> Revert Stream
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/")}
                        className="flex-1 btn-primary px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl shadow-vibe-primary/20"
                    >
                        Return Hub <Zap size={16} fill="currentColor" />
                    </motion.button>
                </div>

                <div className="mt-24 pt-8 border-t border-white/5 w-full flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700">
                    <span className="flex items-center gap-2 italic"><Fingerprint size={12} /> Sync Identity: Offline</span>
                    <span className="italic">Status: 0xf00404</span>
                </div>
            </motion.div>
        </div>
    );
}
