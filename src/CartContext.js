import React, { createContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const savedCart = localStorage.getItem(`${user?.id}_cart`);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      localStorage.setItem(`${user.id}_cart`, JSON.stringify(cart));
      console.log('Cart saved to localStorage for user:', user.id);
    }
  }, [cart]);

  const addToCart = (product, quantity = 1, size = null) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct) {
        console.log(`Updating quantity for product ${product.id}`);
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity, size }
            : item
        );
      }
      console.log(`Adding new product ${product.id} to cart`);
      return [...prevCart, { ...product, quantity, size }];
    });
  };

  const removeFromCart = (productId) => {
    console.log(`Removing product ${productId} from cart`);
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCart((prevCart) =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
    console.log(`Quantity for product ${productId} updated to ${quantity}`);
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
