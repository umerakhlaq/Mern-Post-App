import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import MainLayout from "./layout/MainLayout";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

import UserProfile from "./pages/UserProfile";
import SinglePost from "./pages/SinglePost";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

import { Toaster } from "react-hot-toast";

import { ProtectedRoute, PublicRoute } from "./components/RouteGuards";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-center" toastOptions={{
          style: {
            background: '#09090b', // zinc-950
            color: '#fff',
            border: '1px solid #27272a', // zinc-800
          },
        }} />
        <BrowserRouter>
          <Routes>
          {/* Protected Routes - Only accessible when logged in */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/user/:id" element={<UserProfile />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/post/:id" element={<SinglePost />} />
            </Route>

            {/* Admin Terminal - Entirely Separate Page */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* Public Routes - Only accessible when NOT logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
export default App;
