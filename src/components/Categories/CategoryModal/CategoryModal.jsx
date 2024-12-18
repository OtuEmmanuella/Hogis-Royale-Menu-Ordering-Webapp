import React, { useState, useCallback, useMemo } from 'react';
import './CategoryModal.css';
import { IoClose, IoCartOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { useShoppingCart } from '../../ShoppingCart/ShoppingCartContext';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';

const CategoryModal = ({ category, items, onClose, onLoadMore }) => {
  const { addToCart, removeFromCart } = useShoppingCart();
  const [selectedItems, setSelectedItems] = useState({});

  const formatPrice = (price) => {
    return price.toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Create a debounced version of the item click handler
  const debouncedHandleItemClick = useMemo(() => 
    debounce((item) => {
      setSelectedItems(prev => {
        const newState = { ...prev };
        const toastId = `${item.id}-toast`;

        if (newState[item.id]) {
          delete newState[item.id];
          
          removeFromCart(`${item.id}-${Date.now()}`);
          toast.info(`${item.name} removed from cart`, { toastId });
        } else {
          newState[item.id] = true;
          
          addToCart(item);
          toast.success(`${item.name} added to cart!`, { toastId });
        }
        return newState;
      });
    }, 300), // 300ms debounce to prevent rapid multiple clicks
    [addToCart, removeFromCart]
  );

  const handleItemClick = useCallback((item) => {
    // Prevent multiple rapid calls
    debouncedHandleItemClick(item);
  }, [debouncedHandleItemClick]);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="category-modal-overlay" 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="category-modal-content" 
          onClick={e => e.stopPropagation()}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <IoClose className="category-modal-close-icon" onClick={onClose} />
          <h2 className='category-modal-title'>{category}</h2>
          {items && items.length > 0 ? (
            <ul className="category-modal-list">
              {items.map((item, index) => (
                <motion.li
                  key={`${item.id || item.name}-${index}`}
                  className={`category-modal-item ${selectedItems[item.id] ? 'selected' : ''}`}
                  onClick={() => handleItemClick(item)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="category-modal-item-name">{item.name}</span>
                  <span className="category-modal-item-price">{formatPrice(parseFloat(item.price))}</span>
                  <IoCartOutline
                    className={`category-modal-add-to-cart-icon ${selectedItems[item.id] ? 'selected' : ''}`}
                  />
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="category-modal-empty-message">Fetching...</p>
          )}
          {onLoadMore && <button className="category-modal-load-more" onClick={onLoadMore}>Load More</button>}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CategoryModal;