import React from 'react';
import { motion } from 'framer-motion';

const DeliveryBikeAnimation = () => {
  return (
    <div className="relative w-48 h-20">
      {/* Road/Path */}
      <div className="absolute bottom-0 w-full h-1 bg-gray-300" />
      
      {/* Animated Bike GIF */}
      <motion.div
        className="absolute bottom-4 left-0"
        animate={{
          x: [0, 150, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <img 
          src="/trackeranime/dispatch.gif" 
          alt="Animated delivery bike" 
          className="w-16 h-16 object-contain"
        />
      </motion.div>
    </div>
  );
};

export default DeliveryBikeAnimation;

