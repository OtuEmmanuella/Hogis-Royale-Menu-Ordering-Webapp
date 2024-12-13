import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const ShoppingCartContext = createContext(null);

export const ShoppingCartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadCartFromFirebase(currentUser.uid);
      } else {
        setUser(null);
        setCartItems([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadCartFromFirebase = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCartItems(userData.cart || []);
        if (userData.selectedBranch) {
          setSelectedBranch(userData.selectedBranch);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCartToFirebase = async (updatedCart) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          cart: updatedCart,
          selectedBranch
        });
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }
  };

  const addToCart = async (item) => {
    const cartItemId = `${item.id}-${Date.now()}`;
    const newItem = { ...item, cartItemId, quantity: 1, specifications: '' };
    const updatedCart = [...cartItems, newItem];
    setCartItems(updatedCart);
    await saveCartToFirebase(updatedCart);
  };


  const incrementQuantity = async (cartItemId) => {
    const updatedCart = cartItems.map(item =>
      item.cartItemId === cartItemId
        ? { ...item, quantity: (item.quantity || 1) + 1 }
        : item
    );
    setCartItems(updatedCart);
    await saveCartToFirebase(updatedCart);
  };

  const decrementQuantity = async (cartItemId) => {
    const item = cartItems.find(item => item.cartItemId === cartItemId);
    if (item && item.quantity > 1) {
      const updatedCart = cartItems.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      setCartItems(updatedCart);
      await saveCartToFirebase(updatedCart);
    } else {
      await removeItem(cartItemId);
    }
  };

  const removeItem = async (cartItemId) => {
    const updatedCart = cartItems.filter(item => item.cartItemId !== cartItemId);
    setCartItems(updatedCart);
    await saveCartToFirebase(updatedCart);
  };

  const clearCart = async () => {
    setCartItems([]);
    await saveCartToFirebase([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const quantity = item.quantity || 1;
      return total + (itemPrice * quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
  };

  const updateItemSpecifications = async (cartItemId, specifications) => {
    const updatedCart = cartItems.map(item =>
      item.cartItemId === cartItemId
        ? { ...item, specifications }
        : item
    );
    setCartItems(updatedCart);
    await saveCartToFirebase(updatedCart);
  };

  return (
    <ShoppingCartContext.Provider
      value={{
        cartItems,
        updateItemSpecifications,
        selectedBranch,
        setSelectedBranch,
        addToCart,
        incrementQuantity,
        decrementQuantity,
        removeItem,
        clearCart,
        getCartTotal,
        getCartCount,
        user
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
};

export const useShoppingCart = () => {
  const context = useContext(ShoppingCartContext);
  if (!context) {
    throw new Error('useShoppingCart must be used within ShoppingCartProvider');
  }
  return context;
};