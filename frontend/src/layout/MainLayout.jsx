import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-vibe-primary/30">
            <div className="max-w-7xl mx-auto flex justify-center">
                {/* Left Sidebar - Hidden on mobile, sticky on desktop */}
                <div className="hidden md:block sticky top-0 h-screen w-[80px] xl:w-[275px] shrink-0">
                    <Sidebar />
                </div>

                {/* Main Content - Full width on mobile, 600px on desktop */}
                <main className="flex-1 w-full md:max-w-[600px] border-x border-white/5 min-h-screen pb-20 md:pb-0">
                    <Outlet />
                </main>

                {/* Right Sidebar - Hidden on tablet/mobile, hidden lg:block already in component */}
                <div className="hidden lg:block w-[350px] shrink-0 sticky top-0 h-screen overflow-y-auto scrollbar-hide">
                    <RightSidebar />
                </div>
                
                {/* Mobile Bottom Sidebar - Bottom bar shown only on mobile */}
                <div className="md:hidden">
                    <Sidebar />
                </div>
            </div>
        </div>
    );
}

