import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CartContext from '../../CartContext'; 
import Modal from 'react-bootstrap/Modal';

function ProductDetailsHeader() {
  const { cart, removeFromCart, updateQuantity, setCart } = useContext(CartContext); 
  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState(null);
  const [showBackButton, setShowBackButton] = useState(false);
  const [previousPath, setPreviousPath] = useState(null);
  const [openedDrawer, setOpenedDrawer] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const location = useLocation(); 
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser && !user) { 
      setUser(JSON.parse(storedUser));
    }
  
    if (location.pathname !== "/") {
      setShowBackButton(true);
    } else {
      setShowBackButton(false);
    }
  
    const previousLocation = location.state?.from || "/";
    if (location.pathname !== previousLocation) {
      setPreviousPath(previousLocation);
    }
  }, [location]);

  function navigateToCart() {
    navigate("/cart");
  }

  function handleQuantityChange(productId, newQuantity, stock) {
    if (newQuantity > stock) {
      alert(`You can only order up to ${stock} units.`);
    } else if (newQuantity < 1) {
      alert('Quantity must be at least 1.');
    } else {
      updateQuantity(productId, newQuantity);
      // console.log(`Updated quantity for product ${productId} to ${newQuantity}`);
    }
  }
  function handleBackClick() {
    if (location.pathname === "/shipping-page") {
      navigate("/cart");
    } else if (location.pathname === "/cart") {
      navigate("/");
    } else if (location.pathname === "/ondelivery"){
      navigate("/cart")
    }else if (previousPath) {
      navigate(previousPath);
    } else {
      navigate("/");
    }
  }
  
  function handleOrderClick() {
    // Check if all cart items have a size selected
    const allSizesSelected = cart.every(item => item.size && item.size.trim() !== "");
  
    if (!allSizesSelected) {
      alert("Please select a size for each item in the cart.");
      console.error("Order attempt with missing sizes.");
      return;
    }
  
    if (cart.length === 0) {
      alert("Cart is empty. Add items before proceeding.");
      console.error("Order attempt with empty cart.");
      return;
    }
    
    setShowCart(false); 
    navigate("/order-form", { state: { cart } }); 
    console.log("Navigated to OrderForm with cart contents:", cart);
  }
  

  function handleSizeChange(productId, newSize) {
    setCart((prevCart) =>
      prevCart.map(item =>
        item.id === productId ? { ...item, size: newSize } : item
      )
    );
    console.log(`Updated size for product ${productId} to ${newSize}`);
  }

  const cartTotal = cart.reduce((total, item) => total + item.quantity * item.price, 0);
  // console.log('Current cart contents:', cart);

  return (
    <header>
    <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <FontAwesomeIcon icon={["fab", "bootstrap"]} className="ms-1" size="lg" />
          <span className="ms-2 h5">Don Jerseys Sporthouse</span>
        </Link>

        <div className="ms-auto">
  {/* Always show the back button on the ShippingPage */}
  {location.pathname === "/shipping-page" ? (
    <button type="button" className="btn btn-outline-secondary me-3" onClick={handleBackClick}>
      <FontAwesomeIcon icon={['fas', 'arrow-left']} />
      Back
    </button>
  ) : (
    showBackButton && (
      <button type="button" className="btn btn-outline-secondary me-3" onClick={handleBackClick}>
        <FontAwesomeIcon icon={['fas', 'arrow-left']} />
        Back
      </button>
    )
  )}

  {/* Always show the cart button */}
  <button type="button" className="btn btn-outline-dark" onClick={() => navigate("/cart")}>
    <FontAwesomeIcon icon={["fas", "shopping-cart"]} />
    <span className="ms-3 badge rounded-pill bg-dark">
      {cart.length || 0}
    </span>
  </button>
</div>

      </div>
    </nav>
    </header>
  );
}

export default ProductDetailsHeader;
