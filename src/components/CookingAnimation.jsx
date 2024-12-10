import React from 'react';
import { motion } from 'framer-motion';

const CookingAnimation = () => {
  return (
    <div className="relative w-16 h-16">
      <motion.div
        className="absolute inset-0 border-4 border-blue-500 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-2 bg-blue-500 rounded-full"
        animate={{
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-2 h-8 bg-white rounded-full origin-bottom"
        style={{ translateX: "-50%" }}
        animate={{
          rotate: [0, 60, -60, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default CookingAnimation;

