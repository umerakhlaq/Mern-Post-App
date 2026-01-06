import { motion } from "framer-motion";

export default function Input({
    label,
    error,
    icon: Icon,
    className = "",
    ...props
}) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && <label className="text-xs font-medium text-gray-400 ml-1">{label}</label>}

            <div className="relative group">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors">
                        <Icon size={18} />
                    </div>
                )}

                <input
                    className={`
            w-full bg-[#18181B] border border-white/10 rounded-xl 
            ${Icon ? "pl-10" : "px-4"} pr-4 py-3
            text-sm text-white placeholder-gray-500
            transition-all duration-200
            focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
          `}
                    {...props}
                />
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 ml-1"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}
