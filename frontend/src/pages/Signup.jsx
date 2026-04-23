// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { BASE_URL } from "../utils/constants";
// import Input from "../components/ui/Input";
// import Button from "../components/ui/Button";
// import { User, Mail, Lock, UserPlus } from "lucide-react";
// import toast from "react-hot-toast";

// export default function Signup() {
//   const [form, setForm] = useState({ name: "", email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSignup = async (e) => {
//     e.preventDefault();

//     if (!form.name || !form.email || !form.password) {
//       toast.error("Please fill in all fields.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch(`${BASE_URL}/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         toast.success("Account created! Redirecting...");
//         setTimeout(() => navigate("/login"), 1500);
//       } else {
//         toast.error(data?.message || "Signup failed");
//       }
//     } catch (error) {
//       console.error("Signup error:", error);
//       toast.error("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
//       {/* Background Ambience */}
//       <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
//       <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse delay-1000" />

//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.4 }}
//         className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10"
//       >
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
//             Create Account
//           </h1>
//           <p className="text-gray-400">Join our community today</p>
//         </div>

//         <form onSubmit={handleSignup} className="space-y-6">
//           <Input
//             label="Name"
//             type="text"
//             placeholder="John Doe"
//             icon={User}
//             value={form.name}
//             onChange={(e) => setForm({ ...form, name: e.target.value })}
//           />

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
//             <UserPlus size={18} className="mr-2" /> Signup
//           </Button>
//         </form>

//         <p className="text-center mt-8 text-gray-400 text-sm">
//           Already have an account?{" "}
//           <Link className="text-accent hover:underline font-medium" to="/login">
//             Login
//           </Link>
//         </p>
//       </motion.div>
//     </div>
//   );
// }



import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BASE_URL } from "../utils/constants";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Brand from "../components/Brand";
import { User, Mail, Lock, UserPlus, Eye, EyeOff, Sparkles, CheckCircle, Globe, Users, Zap, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please enter your name, email, and password.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Your password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Account created successfully!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(data?.message || "Signup failed");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-vibe-primary/30 text-white bg-[#030303] overflow-hidden">
      {/* Left side: Immersive Onboarding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:flex lg:w-[50%] relative flex-col justify-between p-16 overflow-hidden bg-black"
      >
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-vibe-primary/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-vibe-secondary/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>

        <div className="relative z-10">
          <Brand className="scale-125 origin-left mb-20" />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h2 className="text-6xl font-display font-black leading-tight tracking-tight mb-8">
              Join the <span className="gradient-text">Community</span> of <br />
              Modern Creators.
            </h2>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-8">
          {[
            { icon: Zap, title: "Pure Speed", desc: "Built on high-performance architecture.", color: "text-vibe-primary" },
            { icon: Shield, title: "Total Privacy", desc: "Your data, your account, your rules.", color: "text-vibe-accent" },
            { icon: Users, title: "Global Reach", desc: "Connect with minds across 150+ countries.", color: "text-indigo-400" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              className="flex items-center gap-5 p-5 glass-card border-white/5"
            >
              <div className="bg-white/5 p-3 rounded-2xl"><item.icon className={item.color} size={24} /></div>
              <div>
                <h4 className="font-bold text-lg">{item.title}</h4>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 flex gap-12 mt-8">
          <div className="text-center font-display">
            <div className="text-3xl font-black gradient-text italic">2M+</div>
            <div className="text-xs text-zinc-600 font-bold uppercase tracking-widest mt-1">Users</div>
          </div>
          <div className="text-center font-display">
            <div className="text-3xl font-black text-white italic">99.9%</div>
            <div className="text-xs text-zinc-600 font-bold uppercase tracking-widest mt-1">Uptime</div>
          </div>
          <div className="text-center font-display">
            <div className="text-3xl font-black text-vibe-accent italic">∞</div>
            <div className="text-xs text-zinc-600 font-bold uppercase tracking-widest mt-1">Posts</div>
          </div>
        </div>
      </motion.div>

      {/* Right side: Signup Form */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center items-center p-8 bg-[#050505] border-l border-white/5 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[440px] py-12"
        >
          <div className="lg:hidden mb-12 flex justify-center"><Brand /></div>
          
          <div className="mb-10">
            <h1 className="text-4xl font-display font-bold mb-3 tracking-tight">Create Account</h1>
            <p className="text-zinc-500 text-lg">Join the community today.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 ml-1">Display Name</label>
              <Input
                type="text"
                placeholder="What should we call you?"
                icon={User}
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-vibe w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 ml-1">Email Address</label>
              <Input
                type="email"
                placeholder="you@vibe.space"
                icon={Mail}
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-vibe w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 ml-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
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

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                By creating an account, you agree to our <span className="text-zinc-300 underline cursor-pointer">Terms of Service</span> and <span className="text-zinc-300 underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-lg btn-primary mt-2"
              isLoading={loading}
            >
              Sign Up
            </Button>
          </form>

          <p className="mt-10 text-center text-zinc-500 font-medium tracking-tight">
            Already have an account? <Link to="/login" className="text-vibe-primary hover:underline font-black">Login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}