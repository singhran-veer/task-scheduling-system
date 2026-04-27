import { motion, AnimatePresence, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedModalProps {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    className?: string;
}

const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const modalVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: 50,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring" as const,   // 👈 FIX
            stiffness: 300,
            damping: 30,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: 50,
    },
};

const AnimatedModal = ({
    children,
    isOpen,
    onClose,
    title,
    className = "",
}: AnimatedModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={onClose}
                >
                    <motion.div
                        className={`bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${className}`}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {title  && (
                            <div className="flex items-center justify-between px-6 py-4 border-b">
                                {title && (
                                    <h2 className="text-xl font-semibold">
                                        {title}
                                    </h2>
                                )}

                                <button
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-gray-800 text-xl"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <div className="p-6">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AnimatedModal;
