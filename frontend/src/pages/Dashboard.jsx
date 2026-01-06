import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { BASE_URL } from "../utils/constants";
import PageWrapper from "../components/PageWrapper";
import PostSkeleton from "../components/PostSkeleton";
import { Sparkles } from "lucide-react";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/posts`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error("Failed to fetch posts:", data);
          setPosts([]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper className="max-w-2xl mx-auto py-10 px-4 pb-24 md:pb-10">

      {/* Header with gradient text */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Sparkles className="text-accent animate-pulse" size={24} />
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-accent to-purple-600 bg-clip-text text-transparent">
          For You
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : (
          posts.map((post, i) => (
            <PostCard key={post._id || i} post={post} />
          ))
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 mx-4">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-xl font-bold mb-2">No posts yet</h2>
            <p className="text-gray-400">Be the first to share something amazing!</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
