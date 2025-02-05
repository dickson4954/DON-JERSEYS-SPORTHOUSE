import React, { createContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const savedCart = localStorage.getItem(`${user?.id}_cart`);
    return savedCart ? JSON.parse(savedCart) : [];  // Return saved cart if available
  });

  const [cartCount, setCartCount] = useState(0);

  // Wrap updateCartCount with useCallback to prevent unnecessary re-renders
  const updateCartCount = useCallback(() => {
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
  }, [cart]);  // Only re-run the function when cart changes

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      localStorage.setItem(`${user.id}_cart`, JSON.stringify(cart));  // Save cart to localStorage
      console.log('Cart saved to localStorage for user:', user.id);
    }
    updateCartCount();  // Update cart count whenever cart changes
  }, [cart, updateCartCount]);  // Depend on cart and updateCartCount

  const addToCart = (product, quantity = 1, size = 'Default Size') => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity, size }
            : item
        );
      }
      return [...prevCart, { ...product, quantity, size }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity, size) => {
    setCart((prevCart) =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity, size } : item
      )
    );
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, setCart, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
