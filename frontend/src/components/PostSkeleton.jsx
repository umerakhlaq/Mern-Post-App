
export default function PostSkeleton() {
    return (
        <div className="bg-black/40 border-b border-white/5 p-6 animate-pulse backdrop-blur-sm">
            <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 shrink-0" />
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-32 bg-white/10 rounded-full" />
                        <div className="h-2 w-16 bg-white/5 rounded-full" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-white/5 rounded-full" />
                        <div className="h-2 w-4/5 bg-white/5 rounded-full" />
                    </div>
                    {/* Simulated Content Image */}
                    <div className="h-80 bg-white/5 rounded-[40px] w-full mt-6 border border-white/5" />
                    
                    <div className="flex items-center gap-12 mt-8 px-4">
                        <div className="h-4 w-4 bg-white/5 rounded-lg" />
                        <div className="h-4 w-4 bg-white/5 rounded-lg" />
                        <div className="h-4 w-4 bg-white/5 rounded-lg" />
                        <div className="h-4 w-4 bg-white/5 rounded-lg ml-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PostSkeletonList({ count = 3 }) {
    return (
        <div className="flex flex-col">
            {Array.from({ length: count }).map((_, i) => (
                <PostSkeleton key={i} />
            ))}
        </div>
    );
}
