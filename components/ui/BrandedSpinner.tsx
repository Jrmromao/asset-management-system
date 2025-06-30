import clsx from "clsx";

export default function BrandedSpinner({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "flex items-center justify-center py-12",
        "animate-fade-in",
        className
      )}
    >
      <svg
        className="w-14 h-14 animate-spin-slow drop-shadow-lg"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-20"
          cx="25"
          cy="25"
          r="20"
          stroke="#3B82F6"
          strokeWidth="6"
        />
        <path
          d="M45 25c0-11.046-8.954-20-20-20"
          stroke="url(#spinner-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="spinner-gradient" x1="45" y1="5" x2="5" y2="45" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Tailwind CSS (add to your global styles if not present):
// .animate-spin-slow { animation: spin 1.2s cubic-bezier(0.4,0,0.2,1) infinite; }
// .animate-fade-in { animation: fadeIn 0.5s ease-in; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } 