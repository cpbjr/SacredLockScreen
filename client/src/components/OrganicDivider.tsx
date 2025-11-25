import { motion } from 'framer-motion';

interface OrganicDividerProps {
    className?: string;
}

export const OrganicDivider = ({ className = '' }: OrganicDividerProps) => {
    return (
        <div className={`flex justify-center items-center ${className}`}>
            <motion.svg
                width="120"
                height="12"
                viewBox="0 0 120 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            >
                <path
                    d="M2 6C20 6 30 2 50 2C70 2 80 10 118 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary/40"
                />
            </motion.svg>
        </div>
    );
};
