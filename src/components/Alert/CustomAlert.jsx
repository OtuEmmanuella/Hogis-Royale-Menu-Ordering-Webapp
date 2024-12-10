import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

const CustomAlert = ({
  isVisible,
  onClose,
  message,
  duration = 3000,
  type = 'success',
}) => {
  useEffect(() => {
    console.log('CustomAlert - Render Details:', { isVisible, message, type });
  }, [isVisible, message, type]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        console.log('CustomAlert - Auto-closing after duration');
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <X className="w-6 h-6 text-red-500" />;
      default:
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '100%' }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -50, x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 999999, // Very high z-index to ensure visibility
            width: '300px', // Fixed width to ensure visibility
          }}
          className={`flex items-center p-4 rounded-lg shadow-lg ${getBackgroundColor()} max-w-sm`}
        >
          <div className="flex-shrink-0 mr-3">{getIcon()}</div>
          <div className="flex-grow mr-2 text-sm font-medium text-gray-900">
            {message}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-auto text-gray-400 hover:text-gray-900 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomAlert;
