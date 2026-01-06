import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import EditProfileModal from "../components/EditProfileModal";
import { Edit3, MapPin, Link as LinkIcon, Calendar } from "lucide-react";
import { BASE_URL } from "../utils/constants";
import PageWrapper from "../components/PageWrapper";
import PostSkeleton from "../components/PostSkeleton";

export default function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/profile`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(result => {
        if (result.user) {
          setData(result);
        } else {
          setData(null);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <PageWrapper className="max-w-2xl mx-auto py-10 px-4">
      <div className="h-64 w-full bg-white/5 rounded-3xl animate-pulse mb-8" />
      <PostSkeleton />
    </PageWrapper>
  );

  if (!data) return <div className="text-center py-20 text-red-400">Please login to view profile</div>;

  return (
    <PageWrapper className="max-w-2xl mx-auto py-10 px-4 pb-24 md:pb-10">
      {/* Profile Header */}
      <div className="glass p-8 rounded-3xl mb-8 flex flex-col items-center text-center relative overflow-hidden group">

        {/* Background Blur Effect */}
        <div className="absolute inset-0 bg-accent/5 blur-3xl group-hover:bg-accent/10 transition-colors duration-500" />

        <button
          onClick={() => setIsEditOpen(true)}
          className="absolute top-4 right-4 bg-white/5 hover:bg-accent hover:text-white p-2.5 rounded-full transition-all text-gray-300 z-10 backdrop-blur-md border border-white/10"
          title="Edit Profile"
        >
          <Edit3 size={18} />
        </button>

        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[3px] shadow-2xl">
            <img
              src={data.user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.name}`}
              alt="avatar"
              className="w-full h-full rounded-full border-4 border-[#121212] object-cover bg-white"
            />
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#121212] rounded-full" title="Online"></div>
        </div>

        <h1 className="text-3xl font-bold relative z-10">{data.user.name}</h1>
        <p className="text-gray-400 mt-1 relative z-10 font-mono text-sm">@{data.user.email?.split('@')[0]}</p>

        {data.user.about && <p className="text-gray-300 mt-4 text-sm max-w-md relative z-10 leading-relaxed">{data.user.about}</p>}

        <div className="flex gap-4 mt-6 w-full justify-center border-t border-white/5 pt-6 relative z-10">
          <div className="text-center px-4">
            <span className="block font-bold text-2xl">{data.posts.length}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Posts</span>
          </div>
          <div className="text-center px-4 border-l border-white/10">
            <span className="block font-bold text-2xl">0</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Followers</span>
          </div>
          <div className="text-center px-4 border-l border-white/10">
            <span className="block font-bold text-2xl">0</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Following</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 pl-2">
        <span>📌 Your Posts</span>
        <span className="bg-white/10 text-xs px-2.5 py-1 rounded-full text-gray-300">{data.posts.length}</span>
      </h2>

      <div className="flex flex-col gap-6">
        {data.posts.map((post, i) => (
          <PostCard key={post._id || i} post={{ ...post, user: data.user }} />
        ))}
        {data.posts.length === 0 && (
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5">
            <p className="text-gray-400">You haven't posted anything yet.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={data.user}
        onUpdate={(updatedUser) => setData(prev => ({ ...prev, user: updatedUser }))}
      />
    </PageWrapper>
  );
}
