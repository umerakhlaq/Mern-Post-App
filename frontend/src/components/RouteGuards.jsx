import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./ui/Spinner";

export const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-black">
                <Spinner size="lg" className="border-t-blue-500 border-zinc-800" />
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-black">
                <Spinner size="lg" className="border-t-blue-500 border-zinc-800" />
            </div>
        );
    }

    return user ? <Navigate to="/" replace /> : <Outlet />;
};
