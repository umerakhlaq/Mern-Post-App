import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
    return (
        <div className="bg-black min-h-screen text-white">
            <Sidebar />
            <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
                <Outlet />
            </main>
        </div>
    );
}
