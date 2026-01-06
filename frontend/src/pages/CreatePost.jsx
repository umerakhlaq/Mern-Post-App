import { useState } from "react";
import { Image, Send, X, Link as LinkIcon } from "lucide-react";
import { BASE_URL } from "../utils/constants";
import PageWrapper from "../components/PageWrapper";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const createPost = async () => {
    if (!content && !postUrl) return toast.error("Please add content or an image");

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content,
          postUrl,
          isPublic: true
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Published! 🚀");
        setContent("");
        setPostUrl("");
        setShowUrlInput(false);
      } else {
        toast.error("Failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      toast.error("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#18181B] border border-white/10 p-6 rounded-3xl shadow-2xl relative">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Post</h1>

        {/* Text Area */}
        <div className="relative">
          <textarea
            className="w-full h-40 p-5 bg-black/20 rounded-2xl mb-4 text-white resize-none border border-white/5 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder:text-gray-500 text-lg leading-relaxed"
            placeholder="What is happening?!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Image Preview */}
        {postUrl && (
          <div className="relative mb-6 rounded-2xl overflow-hidden group border border-white/10">
            <img src={postUrl} alt="Preview" className="w-full max-h-60 object-cover" />
            <button
              onClick={() => setPostUrl("")}
              className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 p-2 rounded-full text-white transition-all backdrop-blur-sm"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* URL Input Toggle */}
        {showUrlInput && !postUrl && (
          <div className="flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
            <LinkIcon size={18} className="text-gray-400" />
            <input
              type="text"
              className="flex-1 p-3 bg-black/40 rounded-xl text-white border border-white/5 focus:border-accent focus:outline-none text-sm placeholder-gray-500"
              placeholder="Paste Image URL here..."
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              autoFocus
            />
            <button onClick={() => setShowUrlInput(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="flex gap-2">
            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className={`p-3 rounded-xl transition-all flex items-center gap-2 ${showUrlInput || postUrl ? "bg-accent/10 text-accent" : "hover:bg-white/5 text-gray-400 hover:text-white"}`}
            >
              <Image size={24} />
              <span className="text-sm font-medium hidden sm:inline">Add Photo</span>
            </button>
          </div>

          <Button
            onClick={createPost}
            isLoading={loading}
            disabled={!content && !postUrl}
            className="rounded-full px-8"
          >
            <Send size={18} className="mr-2" /> Post
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
