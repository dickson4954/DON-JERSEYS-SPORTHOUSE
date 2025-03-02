import React, { createContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const savedCart = localStorage.getItem(`${user?.id}_cart`);
    return savedCart ? JSON.parse(savedCart) : []; // Return saved cart if available
  });

  const [cartCount, setCartCount] = useState(0);

  // Wrap updateCartCount with useCallback to prevent unnecessary re-renders
  const updateCartCount = useCallback(() => {
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
  }, [cart]); // Only re-run the function when cart changes

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      localStorage.setItem(`${user.id}_cart`, JSON.stringify(cart)); // Save cart to localStorage
      console.log('Cart saved to localStorage for user:', user.id);
    }
    updateCartCount(); // Update cart count whenever cart changes
  }, [cart, updateCartCount]); // Depend on cart and updateCartCount

  const addToCart = (product, quantity = 1) => { // 🚀 Removed extra parameters
    setCart((prevCart) => {
      const existingProduct = prevCart.find(
        (item) =>
          item.id === product.id &&
          item.size === product.size && // ✅ Compare using product.size
          item.edition === product.edition // ✅ Compare using product.edition
      );
  
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id && item.size === product.size && item.edition === product.edition
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  };
  useEffect(() => {
    console.log("Updated Cart:", cart);
  }, [cart]);
    

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (id, newQuantity) => {
    setCart((cart) =>
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
        )
        .filter((item) => item.quantity > 0) // Removes items with 0 quantity
    );
  };

  return (
    <CartContext.Provider
      value={{ cart, cartCount, setCart, addToCart, removeFromCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;