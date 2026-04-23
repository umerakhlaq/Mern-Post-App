import React from 'react';

export default function Brand({ className = "", isCompact = false }) {
    return (
        <div className={`flex items-center gap-2.5 font-display select-none ${className}`}>
            <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-vibe-primary to-vibe-secondary rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-vibe-primary/20 to-vibe-secondary/20"></div>
                    <span className="text-xl font-black text-white italic tracking-tighter">V</span>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-vibe-accent rounded-full blur-[6px] animate-pulse"></div>
                </div>
            </div>
            {!isCompact && (
                <span className="text-2xl font-bold tracking-tight text-white">
                    Vibe<span className="text-vibe-primary">.</span>
                </span>
            )}
        </div>
    );
}
