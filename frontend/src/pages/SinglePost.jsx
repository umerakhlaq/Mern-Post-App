import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import { ArrowLeft } from "lucide-react";
import { BASE_URL } from "../utils/constants";
import PageWrapper from "../components/PageWrapper";
import PostSkeleton from "../components/PostSkeleton";

export default function SinglePost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${BASE_URL}/post/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          setError("Post not found");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setPost(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load post");
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <PageWrapper className="max-w-2xl mx-auto py-10 px-4">
        <div className="flex items-center gap-2 text-gray-400 mb-6 w-fit animate-pulse">
          <div className="w-20 h-4 bg-white/10 rounded" />
        </div>
        <PostSkeleton />
      </PageWrapper>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-xl mb-4">{error || "Post not found"}</p>
        <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
      </div>
    );
  }

  return (
    <PageWrapper className="max-w-2xl mx-auto py-10 px-4 pb-24 md:pb-10">
      {/* Back Button */}
      <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors w-fit group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Feed
      </Link>

      {/* Premium PostCard */}
      <PostCard post={post} />
    </PageWrapper>
  );
}
