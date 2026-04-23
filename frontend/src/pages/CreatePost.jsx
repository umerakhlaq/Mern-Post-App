import { useState, useRef } from "react";
import { Image, Send, X, Link as LinkIcon, Smile, Hash, Globe, UserPlus, Video, ArrowLeft, Zap, Sparkles, Activity, Layers, Radio, Check } from "lucide-react";
import { BASE_URL } from "../utils/constants";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [postFile, setPostFile] = useState(null);
  const [fileType, setFileType] = useState("image");
  const [loading, setLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [audience, setAudience] = useState("public");
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);
  const maxChars = 280;
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const handleContentChange = (e) => {
    const text = e.target.value;
    setContent(text);
    setCharCount(text.length);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const createPost = async () => {
    if (!content && !postUrl) {
      toast.error("Post content required");
      return;
    }

    if (charCount > maxChars) {
      toast.error(`Post is too long (max ${maxChars} characters)`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (postFile) {
        formData.append("image", postFile);
      } else if (postUrl) {
        formData.append("postUrl", postUrl);
      }
      formData.append("isPublic", audience === "public");

      const res = await fetch(`${BASE_URL}/post`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Post created successfully! 🚀");
        setContent("");
        setPostUrl("");
        setPostFile(null);
        setFileType("image");
        setShowUrlInput(false);
        setCharCount(0);
        navigate("/");
      } else {
        toast.error("Failed to create post: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      toast.error("Something went wrong while posting");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostFile(file);
      setFileType(file.type.startsWith("video") ? "video" : "image");
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-display pb-32">
      {/* Immersive Header */}
      <div className="sticky top-0 z-30 bg-[#030303]/60 backdrop-blur-2xl px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate(-1)} 
                className="p-2.5 -ml-2 hover:bg-white/5 rounded-2xl transition-all text-zinc-500 hover:text-white"
            >
                <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
                <h2 className="text-xl font-black tracking-tighter leading-none uppercase">Post</h2>
                <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-vibe-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Syncing to network</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-3">
             <button className="p-2 text-zinc-600 hover:text-white transition-colors"><Sparkles size={18} /></button>
        </div>
      </div>

      <div className="p-4 md:p-12 max-w-2xl mx-auto">
        <div className="relative">
            {/* Thread Line Simulation */}
            <div className="absolute left-7 top-20 bottom-0 w-px bg-white/5" />

            <div className="flex gap-5 relative z-10">
                {/* Identity Column */}
                <div className="shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 overflow-hidden border border-white/10 shadow-xl">
                        <img 
                            src={user?.photoUrl || `https://ui-avatars.com/api/?name=${user?.name || 'V'}&background=8B5CF6&color=fff&bold=true`} 
                            alt="Me" 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                </div>

                {/* Synthesis Hub */}
                <div className="flex-1 min-w-0 pt-1">
                    {/* Channel Permissions */}
                    <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-vibe-primary/20 bg-vibe-primary/5 cursor-pointer hover:bg-vibe-primary/10 transition-colors group">
                        <select
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="bg-transparent text-vibe-primary text-[10px] font-black uppercase tracking-widest appearance-none focus:outline-none cursor-pointer pr-4"
                        >
                            <option value="public" className="bg-[#0a0a0a]">Everyone</option>
                            <option value="followers" className="bg-[#0a0a0a]">Followers</option>
                        </select>
                        <div className="pointer-events-none -ml-3 mr-0.5 text-vibe-primary">
                            {audience === 'public' ? <Globe size={11} strokeWidth={3} /> : <UserPlus size={11} strokeWidth={3} />}
                        </div>
                    </div>

                    <textarea
                        ref={textareaRef}
                        className="w-full min-h-[140px] bg-transparent text-white text-xl md:text-2xl placeholder-zinc-800 resize-none border-0 focus:outline-none focus:ring-0 p-0 leading-relaxed font-light mt-2 overflow-hidden"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={handleContentChange}
                        maxLength={maxChars}
                        autoFocus
                    />

                    {/* Media Matrix */}
                    <AnimatePresence>
                        {postUrl && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="mt-6 relative group"
                            >
                                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#050505] shadow-2xl ring-1 ring-white/5">
                                    {fileType === "video" ? (
                                        <video
                                            src={postUrl}
                                            controls
                                            className="w-full max-h-[450px] object-contain block mx-auto outline-none"
                                        />
                                    ) : (
                                        <img
                                            src={postUrl}
                                            alt="Preview"
                                            className="w-full max-h-[450px] object-contain block mx-auto"
                                        />
                                    )}
                                    <button
                                        onClick={() => {
                                            setPostUrl("");
                                            setPostFile(null);
                                            setFileType("image");
                                        }}
                                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 p-2.5 rounded-xl text-white transition-all shadow-xl active:scale-90"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Meta Input Surface */}
                    <AnimatePresence>
                        {showUrlInput && !postUrl && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-8"
                            >
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 focus-within:border-vibe-primary/40 transition-all">
                                    <LinkIcon size={18} className="text-zinc-500" />
                                    <input
                                        type="text"
                                        className="flex-1 bg-transparent text-white text-sm border-0 focus:outline-none placeholder-zinc-700 font-medium"
                                        placeholder="Paste resource URL..."
                                        value={postUrl}
                                        onChange={(e) => setPostUrl(e.target.value)}
                                        autoFocus
                                    />
                                    <button onClick={() => setShowUrlInput(false)} className="text-zinc-600 hover:text-white"><X size={16} /></button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Toolbelt & Execution */}
                    <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5 ml-[-10px]">
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                className="p-3 hover:bg-vibe-primary/10 text-vibe-primary rounded-2xl transition-all"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*,video/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <Image size={22} strokeWidth={1.5} />
                            </button>

                            <button onClick={() => fileInputRef.current.click()} className="p-3 hover:bg-vibe-secondary/10 text-vibe-secondary rounded-2xl transition-all">
                                <Video size={22} strokeWidth={1.5} />
                            </button>

                            <button className="p-3 hover:bg-vibe-accent/10 text-vibe-accent rounded-2xl transition-all">
                                <Smile size={22} strokeWidth={1.5} />
                            </button>

                            <button
                                onClick={() => setShowUrlInput(!showUrlInput)}
                                className={`p-3 rounded-2xl transition-all ${showUrlInput ? "bg-white/10 text-white" : "hover:bg-white/5 text-zinc-500"}`}
                            >
                                <LinkIcon size={22} strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            {charCount > 0 && (
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-black tabular-nums transition-colors ${charCount > maxChars ? 'text-red-500' : 'text-zinc-600'}`}>
                                        {maxChars - charCount}
                                    </span>
                                    <div className="w-5 h-5 relative">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                                            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray={50} strokeDashoffset={50 - (Math.min(charCount / maxChars, 1) * 50)} className={`transition-all duration-300 ${charCount > maxChars ? 'text-red-500' : 'text-vibe-primary'}`} />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={createPost}
                                disabled={loading || (!content && !postUrl) || charCount > maxChars}
                                className="bg-vibe-primary hover:bg-vibe-primary/90 disabled:bg-zinc-800 disabled:text-zinc-600 px-10 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 shadow-xl transition-all active:scale-95 text-white"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Post <Check size={16} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}