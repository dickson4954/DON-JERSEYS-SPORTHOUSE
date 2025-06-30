import React, { createContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // ✅ Get user from localStorage (if exists)
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  };

  // ✅ Generate cart key for localStorage
  const getCartKey = () => {
    const user = getUser();
    return user ? `${user.id}_cart` : 'guest_cart';
  };

  // ✅ Initialize cart from localStorage
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem(getCartKey());
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const [cartCount, setCartCount] = useState(0);

  // ✅ Update cart count when cart changes
  const updateCartCount = useCallback(() => {
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
  }, [cart]);

  // ✅ Save cart to localStorage when cart changes
  useEffect(() => {
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    console.log('✅ Cart saved to localStorage:', getCartKey());
    updateCartCount();
  }, [cart, updateCartCount]);

  // ✅ Restore cart if context loses data (e.g., refresh)
  useEffect(() => {
    if (cart.length === 0) {
      const storedCart = localStorage.getItem(getCartKey());
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (parsedCart.length > 0) {
          setCart(parsedCart);
          console.log('🔄 Cart restored from localStorage.');
        }
      }
    }
  }, []);

  // ✅ Add product to cart (merge by id, size, edition)
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

  // ✅ Remove product by ID
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // ✅ Update quantity of an item
  const updateQuantity = (productId, newQuantity) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, newQuantity) }
            : item
        )
        .filter((item) => item.quantity > 0) // Remove items with 0 quantity
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
