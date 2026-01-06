export default function PostSkeleton() {
    return (
        <div className="w-full max-w-xl mx-auto bg-[#18181B] rounded-3xl overflow-hidden mb-6 border border-white/5 shadow-xl animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="flex flex-col gap-2">
                        <div className="w-32 h-4 rounded-full bg-white/10" />
                        <div className="w-20 h-3 rounded-full bg-white/5" />
                    </div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="px-3">
                <div className="w-full h-64 bg-white/5 rounded-2xl" />
            </div>

            {/* Footer Skeleton */}
            <div className="px-5 py-4 mt-2">
                <div className="flex gap-4">
                    <div className="w-16 h-4 rounded-full bg-white/10" />
                    <div className="w-16 h-4 rounded-full bg-white/10" />
                </div>
            </div>
        </div>
    );
}
