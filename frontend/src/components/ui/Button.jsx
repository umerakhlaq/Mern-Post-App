import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Button({
    children,
    onClick,
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled = false,
    type = "button",
    className = ""
}) {

    const baseStyles = "relative inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-accent hover:bg-red-600 text-white shadow-lg shadow-accent/20 border border-transparent",
        secondary: "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10",
        outline: "bg-transparent border-2 border-white/20 hover:border-white text-white",
        ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3.5 text-base"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </motion.button>
    );
}
