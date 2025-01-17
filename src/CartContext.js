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
      localStorage.setItem(`${user.id}_cart`, JSON.stringify(cart));  // Size should be part of the product data
      console.log('Cart saved to localStorage for user:', user.id);
    }
  }, [cart]);
  

  const addToCart = (product, quantity = 1, size = 'Default Size') => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct) {
        console.log(`Updating quantity and size for product ${product.id}`);
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity, size } // Update size if necessary
            : item
        );
      }
      console.log(`Adding new product ${product.id} to cart with size ${size}`);
      return [...prevCart, { ...product, quantity, size }];  // Add the size to the new product
    });
  };
  

  const removeFromCart = (productId) => {
    console.log(`Removing product ${productId} from cart`);
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity, size) => {  // Accept size as a parameter
    setCart((prevCart) =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity, size } : item  // Keep size when updating quantity
      )
    );
    console.log(`Quantity for product ${productId} updated to ${quantity} with size ${size}`);
  };
  

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
