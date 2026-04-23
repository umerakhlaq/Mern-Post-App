export default function Spinner({ size = "md", className = "" }) {
    const sizes = {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-2",
        lg: "h-12 w-12 border-4",
        xl: "h-16 w-16 border-4"
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div
                className={`animate-spin rounded-full border-t-blue-500 border-zinc-800 ${sizes[size]}`}
            />
        </div>
    );
}
