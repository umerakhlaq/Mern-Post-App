// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { BASE_URL } from "../utils/constants";
// import { useAuth } from "../context/AuthContext";
// import Input from "../components/ui/Input";
// import Button from "../components/ui/Button";
// import { Mail, Lock, LogIn } from "lucide-react";
// import toast from "react-hot-toast";

// export default function Login() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const { checkAuth } = useAuth();

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     if (!form.email || !form.password) {
//       toast.error("Please fill in both fields.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch(`${BASE_URL}/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         await checkAuth();
//         toast.success("Welcome back!");
//         navigate("/");
//       } else {
//         toast.error(data?.message || "Login failed");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       toast.error("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
//       {/* Background Ambience */}
//       <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
//       <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse delay-1000" />

//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, ease: "easeOut" }}
//         className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10"
//       >
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
//             Welcome Back
//           </h1>
//           <p className="text-gray-400">Enter your credentials to access your account</p>
//         </div>

//         <form onSubmit={handleLogin} className="space-y-6">
//           <Input
//             label="Email"
//             type="email"
//             placeholder="hello@example.com"
//             icon={Mail}
//             value={form.email}
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//           />

//           <Input
//             label="Password"
//             type="password"
//             placeholder="••••••••"
//             icon={Lock}
//             value={form.password}
//             onChange={(e) => setForm({ ...form, password: e.target.value })}
//           />

//           <Button
//             type="submit"
//             variant="primary"
//             className="w-full"
//             size="lg"
//             isLoading={loading}
//           >
//             <LogIn size={18} className="mr-2" /> Login
//           </Button>
//         </form>

//         <p className="text-center mt-8 text-gray-400 text-sm">
//           Don't have an account?{" "}
//           <Link className="text-accent hover:underline font-medium" to="/signup">
//             Sign up
//           </Link>
//         </p>
//       </motion.div>
//     </div>
//   );
// }



import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BASE_URL } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Brand from "../components/Brand";
import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles, Shield, Zap, Layers, Star,Globe   } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        await checkAuth();
        toast.success("Welcome back!");
        navigate("/");
      } else {
        toast.error(data?.message || "Login failed");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-vibe-primary/30 text-white bg-[#030303] overflow-hidden">
      {/* Left side: Immersive Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-16 overflow-hidden bg-black"
      >
        {/* Abstract Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-vibe-primary/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-vibe-secondary/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-vibe-accent/5 rounded-full blur-[100px]"></div>

        <div className="relative z-10">
          <Brand className="scale-125 origin-left mb-24" />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h2 className="text-7xl font-display font-black leading-[1.05] tracking-tight mb-8">
              Experience the <br />
              <span className="gradient-text">Next Wave</span> of <br />
              Digital Connection.
            </h2>
            <p className="text-zinc-400 text-xl max-w-xl font-light leading-relaxed">
              Step into a sanctuary of creativity and conversation. Vibe is more than a social network—it's where stories come alive.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8 mt-12">
          <div className="flex items-start gap-4 p-6 glass-card border-white/5">
            <div className="bg-vibe-primary/20 p-3 rounded-2xl"><Zap className="text-vibe-primary" size={24} /></div>
            <div>
              <h4 className="font-bold text-lg">Instant Sync</h4>
              <p className="text-zinc-500 text-sm">Real-time updates, everywhere.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 glass-card border-white/5">
            <div className="bg-vibe-accent/20 p-3 rounded-2xl"><Layers className="text-vibe-accent" size={24} /></div>
            <div>
              <h4 className="font-bold text-lg">Deep Flow</h4>
              <p className="text-zinc-500 text-sm">Focus-driven social design.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-zinc-600 text-sm font-medium">
          © 2026 Vibe Space Inc. Built with love and light.
        </div>
      </motion.div>

      {/* Right side: Auth Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-8 bg-[#050505] border-l border-white/5">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[420px]"
        >
          <div className="lg:hidden mb-12 flex justify-center"><Brand /></div>
          
          <div className="mb-10">
            <h1 className="text-4xl font-display font-bold mb-3 tracking-tight">Welcome Back</h1>
            <p className="text-zinc-500 text-lg">Enter your details to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 ml-1">Email Address</label>
              <Input
                type="email"
                placeholder="email@vibe.space"
                icon={Mail}
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-vibe w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-zinc-400">Password</label>
                <Link to="/forgot" className="text-xs text-vibe-primary hover:underline font-bold">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  icon={Lock}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-vibe w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-lg btn-primary mt-4"
              isLoading={loading}
            >
              Login
            </Button>

            <div className="relative py-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <span className="relative px-4 bg-[#050505] text-zinc-600 text-xs font-black uppercase tracking-widest">Connect with</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-2 py-3 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-zinc-800 transition-all font-bold text-sm">
                <Globe size={16} className="text-blue-400" /> Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 py-3 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-zinc-800 transition-all font-bold text-sm">
                <Shield size={16} className="text-zinc-100" /> Apple
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-zinc-500 font-medium">
            Don't have an account? <Link to="/signup" className="text-vibe-accent hover:underline font-black">Sign Up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
