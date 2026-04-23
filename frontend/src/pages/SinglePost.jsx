
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import { ArrowLeft, MessageCircle, Smile, Image as ImageIcon, Zap, SendHorizontal, Activity, Layers, Sparkles } from "lucide-react";
import { BASE_URL } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";
import Spinner from "../components/ui/Spinner";
import PostSkeleton from "../components/PostSkeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function SinglePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const { socket } = useSocket() || {};

  const fetchPostAndComments = async () => {
    try {
      setLoading(true);
      const [postRes, commentsRes] = await Promise.all([
        fetch(`${BASE_URL}/post/${id}`, { credentials: "include" }),
        fetch(`${BASE_URL}/post/${id}/comments`, { credentials: "include" })
      ]);

      if (!postRes.ok) {
        toast.error("Post not found");
        navigate("/");
        return;
      }

      const postData = await postRes.json();
      const commentsData = await commentsRes.json();

      setPost(postData);
      setComments(commentsData);
    } catch (err) {
      toast.error("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndComments();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewComment = (data) => {
      if (data.postId === id) {
        setComments(prev => {
          // Prevent duplicates if author's own request already added it
          if (prev.some(c => c._id === data.comment._id)) return prev;
          return [data.comment, ...prev];
        });
      }
    };
    
    socket.on('new-comment', handleNewComment);
    return () => socket.off('new-comment', handleNewComment);
  }, [socket, id]);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    if (!user) return navigate("/login");

    setPostingComment(true);
    try {
      const res = await fetch(`${BASE_URL}/post/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: commentText })
      });

      if (res.ok) {
        const data = await res.json();
        setComments([data.comment, ...comments]);
        setCommentText("");
        toast.success("Comment posted!");
      }
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) return <div className="p-8 max-w-2xl mx-auto"><PostSkeleton /></div>;

  return (
    <div className="min-h-screen bg-transparent text-white pb-32 font-display">
      {/* Vibe Broadcast Header */}
      <div className="sticky top-0 z-30 bg-[#030303]/40 backdrop-blur-2xl px-6 py-4 flex items-center gap-8 border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="p-3 -ml-3 text-zinc-500 hover:text-white rounded-2xl hover:bg-white/5 transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black tracking-tighter leading-none">Post Thread</h2>
            <div className="px-2 py-0.5 bg-vibe-primary/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-vibe-primary border border-vibe-primary/20 animate-pulse">Active</div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mt-1 flex items-center gap-1.5">
            <Activity size={10} className="text-vibe-accent" /> Viewing conversation
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-6">
        {/* Main Post Expansion */}
        {post && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 px-4"
          >
            <PostCard post={post} onUpdate={fetchPostAndComments} />
          </motion.div>
        )}

        {/* Dynamic Reply Hub */}
        <div className="mx-4 mb-10 p-8 rounded-[40px] bg-white/[0.02] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-vibe-primary/10 group-focus-within:text-vibe-primary/20 transition-colors pointer-events-none">
             <Layers size={48} />
          </div>
          <div className="flex gap-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-xl flex-shrink-0 group-focus-within:border-vibe-primary/40 transition-colors">
              <img 
                src={user?.photoUrl || `https://ui-avatars.com/api/?name=${user?.name || 'V'}&background=8B5CF6&color=fff&bold=true`} 
                alt="Me" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment..."
                className="w-full bg-transparent text-xl text-white placeholder-zinc-700 outline-none resize-none pt-2 font-light min-h-[100px] scrollbar-hide"
              />
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
                <div className="flex gap-3">
                  <button className="p-3 text-zinc-600 hover:text-vibe-primary hover:bg-white/5 rounded-2xl transition-all"><ImageIcon size={20} strokeWidth={1.5} /></button>
                  <button className="p-3 text-zinc-600 hover:text-vibe-accent hover:bg-white/5 rounded-2xl transition-all"><Smile size={20} strokeWidth={1.5} /></button>
                </div>
                <button
                  onClick={handleComment}
                  disabled={postingComment || !commentText.trim()}
                  className="btn-primary px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 group shadow-xl shadow-vibe-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  {postingComment ? (
                     <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Post Comment <SendHorizontal size={14} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vibe Thread Space */}
        <div className="pb-12 px-4 space-y-4">
            <div className="px-6 pb-4 opacity-40 flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-vibe-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Replies</span>
            </div>
            <AnimatePresence mode="popLayout">
                {comments.map((comment, i) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={comment._id} 
                        className="p-8 rounded-[40px] bg-white/[0.01] border border-white/5 flex gap-6 hover:bg-white/[0.02] hover:border-white/10 transition-all group relative"
                    >
                        <Link to={`/user/${comment.user?._id}`} className="shrink-0 pt-1">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 group-hover:border-vibe-primary/30 transition-colors shadow-lg">
                                <img
                                    src={comment.user?.photoUrl || `https://ui-avatars.com/api/?name=${comment.user?.name}&background=8B5CF6&color=fff&bold=true`}
                                    alt={comment.user?.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-2">
                                <Link to={`/user/${comment.user?._id}`} className="font-black text-white text-[15px] hover:text-vibe-primary transition-colors tracking-tight">
                                    {comment.user?.name}
                                </Link>
                                <span className="text-vibe-primary/40 text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-60">@{comment.user?.username || "unknown"}</span>
                                <span className="ml-auto text-zinc-700 text-[9px] font-black tracking-widest uppercase">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            
                            <p className="text-zinc-300 text-[16px] leading-[1.6] break-words font-light">
                                {comment.content}
                            </p>
                            
                            <div className="flex items-center gap-8 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="flex items-center gap-2.5 text-zinc-600 hover:text-vibe-accent transition-colors text-[10px] font-black uppercase tracking-widest"><Zap size={14} /> Like</button>
                                <button className="flex items-center gap-2.5 text-zinc-600 hover:text-vibe-primary transition-colors text-[10px] font-black uppercase tracking-widest"><MessageCircle size={14} /> Reply</button>
                            </div>
                        </div>

                        {/* Thread connection line simulation */}
                        <div className="absolute left-14 top-24 bottom-0 w-px bg-white/5 z-0" />
                    </motion.div>
                ))}
            </AnimatePresence>

            {comments.length === 0 && !loading && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-32 text-center flex flex-col items-center gap-8"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-vibe-primary/10 blur-3xl rounded-full" />
                        <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center border border-white/10 relative z-10">
                            <MessageCircle size={40} className="text-zinc-800" strokeWidth={1} />
                        </div>
                    </div>
                    <div className="max-w-xs mx-auto">
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">NO COMMENTS</h3>
                        <p className="text-zinc-500 font-medium">No one has commented on this post yet. Be the first!</p>
                    </div>
                    <button 
                        onClick={() => document.querySelector('textarea')?.focus()}
                        className="bg-vibe-primary/10 border border-vibe-primary/20 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-vibe-primary hover:bg-vibe-primary/20 transition-all"
                    >
                        Write a comment
                    </button>
                </motion.div>
            )}
        </div>
      </div>
    </div>
  );
}