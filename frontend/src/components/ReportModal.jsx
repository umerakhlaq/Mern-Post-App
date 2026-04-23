import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";

const REASONS = [
    { value: "spam", label: "Spam", icon: "🚫", desc: "Unwanted or repetitive content" },
    { value: "harassment", label: "Harassment", icon: "😤", desc: "Bullying or targeted abuse" },
    { value: "hate_speech", label: "Hate Speech", icon: "⚠️", desc: "Discriminatory or hateful content" },
    { value: "nudity", label: "Nudity / Sexual Content", icon: "🔞", desc: "Explicit or inappropriate material" },
    { value: "fake_info", label: "Fake Information", icon: "❌", desc: "Misleading or false claims" },
    { value: "other", label: "Other", icon: "💬", desc: "Something else not listed above" },
];

export default function ReportModal({ isOpen, onClose, postId }) {
    const [selectedReason, setSelectedReason] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [alreadyReported, setAlreadyReported] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen && postId) {
            setSelectedReason("");
            setDescription("");
            setSubmitted(false);
            setCheckingStatus(true);

            // Check if already reported
            fetch(`${BASE_URL}/post/${postId}/report/check`, {
                credentials: "include"
            })
                .then(res => res.json())
                .then(data => {
                    setAlreadyReported(data.reported);
                    setCheckingStatus(false);
                })
                .catch(() => setCheckingStatus(false));
        }
    }, [isOpen, postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedReason) return toast.error("Please select a reason");
        if (selectedReason === "other" && !description.trim()) {
            return toast.error("Please describe the issue");
        }

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/post/${postId}/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ reason: selectedReason, description })
            });
            const data = await res.json();

            if (res.ok) {
                setSubmitted(true);
            } else if (res.status === 409) {
                setAlreadyReported(true);
            } else if (res.status === 429) {
                toast.error(data.message); // Daily limit reached
                onClose();
            } else {
                toast.error(data.message || "Failed to submit report");
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
                    className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-red-500/15 rounded-xl flex items-center justify-center">
                                <Flag size={15} className="text-red-400" />
                            </div>
                            <h2 className="font-bold text-white text-[16px]">Report Post</h2>
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
                        {checkingStatus ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 size={28} className="animate-spin text-zinc-500" />
                            </div>
                        ) : alreadyReported ? (
                            // Already Reported State
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-yellow-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle size={32} className="text-yellow-400" />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">Already Reported</h3>
                                <p className="text-zinc-400 text-sm">You have already submitted a report for this post. Our team will review it soon.</p>
                                <button
                                    onClick={onClose}
                                    className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-semibold transition-all text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        ) : submitted ? (
                            // Success State
                            <div className="text-center py-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 15 }}
                                    className="w-16 h-16 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4"
                                >
                                    <CheckCircle size={32} className="text-green-400" />
                                </motion.div>
                                <h3 className="text-white font-bold text-lg mb-2">Report Submitted</h3>
                                <p className="text-zinc-400 text-sm">Thank you for helping keep our community safe. Our team will review this post.</p>
                                <button
                                    onClick={onClose}
                                    className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-semibold transition-all text-sm"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            // Report Form
                            <form onSubmit={handleSubmit}>
                                <p className="text-zinc-400 text-sm mb-5">
                                    Why are you reporting this post? Select a reason below.
                                </p>

                                {/* Reason Buttons */}
                                <div className="space-y-2 mb-5">
                                    {REASONS.map((r) => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setSelectedReason(r.value)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
                                                selectedReason === r.value
                                                    ? "border-red-500/50 bg-red-500/10"
                                                    : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                                            }`}
                                        >
                                            <span className="text-xl leading-none">{r.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold text-sm ${selectedReason === r.value ? "text-red-400" : "text-white"}`}>
                                                    {r.label}
                                                </p>
                                                <p className="text-zinc-500 text-xs mt-0.5 truncate">{r.desc}</p>
                                            </div>
                                            {/* Radio dot */}
                                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                                selectedReason === r.value ? "border-red-500 bg-red-500" : "border-zinc-600"
                                            }`}>
                                                {selectedReason === r.value && (
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Description (only for "Other") */}
                                <AnimatePresence>
                                    {selectedReason === "other" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-5 overflow-hidden"
                                        >
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Please describe the issue in detail..."
                                                maxLength={500}
                                                rows={3}
                                                autoFocus
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-red-500/50 resize-none transition-all"
                                            />
                                            <p className="text-zinc-600 text-xs mt-1 text-right">{description.length}/500</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!selectedReason || loading}
                                    className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Flag size={16} />
                                    )}
                                    {loading ? "Submitting..." : "Submit Report"}
                                </button>

                                <p className="text-zinc-600 text-xs text-center mt-3">
                                    False reports may result in restrictions on your account.
                                </p>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
