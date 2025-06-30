import React, { createContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // ✅ Load user and determine cart key (user or guest)
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  };

  const getCartKey = () => {
    const user = getUser();
    return user ? `${user.id}_cart` : 'guest_cart';
  };

  // ✅ Initialize cart from localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(getCartKey());
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [cartCount, setCartCount] = useState(0);

  // ✅ Update cart count using useCallback
  const updateCartCount = useCallback(() => {
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
  }, [cart]);

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    console.log('Cart saved to localStorage with key:', getCartKey());
    updateCartCount();
  }, [cart, updateCartCount]);

  // ✅ Add product to cart (check for size/edition match)
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(
        (item) =>
          item.id === product.id &&
          item.size === product.size &&
          item.edition === product.edition
      );

      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id &&
          item.size === product.size &&
          item.edition === product.edition
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  // ✅ Restore cart on mount if lost due to reload
  useEffect(() => {
    if (!cart || cart.length === 0) {
      const storedCart = localStorage.getItem(getCartKey());
      if (storedCart) {
        setCart(JSON.parse(storedCart));
        console.log('Restored cart from localStorage');
      }
    }
  }, []); // Only run once on mount

  // ✅ Remove product from cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // ✅ Update quantity for a cart item
  const updateQuantity = (id, newQuantity) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
        )
        .filter((item) => item.quantity > 0)
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
