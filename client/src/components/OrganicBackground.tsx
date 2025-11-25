import { motion } from 'framer-motion';

export const OrganicBackground = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-page">
            {/* Abstract Natural Lines - Non-repeating, Asymmetrical */}
            <svg
                className="absolute inset-0 w-full h-full opacity-[0.12]"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Large Flowing Curve 1 */}
                <motion.path
                    d="M-10,20 C 30,50 50,0 90,30 S 110,80 110,80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.3"
                    className="text-navy"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 3, ease: "easeOut" }}
                />

                {/* Large Flowing Curve 2 */}
                <motion.path
                    d="M-10,60 C 20,40 60,90 110,50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.3"
                    className="text-navy"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 3.5, ease: "easeOut", delay: 0.5 }}
                />

                {/* Vertical Meander */}
                <motion.path
                    d="M30,-10 C 20,30 50,50 40,110"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.3"
                    className="text-navy"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 4, ease: "easeOut", delay: 1 }}
                />

                {/* Crossing Curve */}
                <motion.path
                    d="M80,-10 C 90,40 60,60 70,110"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.2"
                    className="text-navy"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 4.5, ease: "easeOut", delay: 1.5 }}
                />
            </svg>

            {/* Subtle Texture for Grain */}
            <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`
                }}
            />
        </div>
    );
};
