import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CartContext from '../CartContext'; // Ensure the correct import path
import AuthModal from '../user/AuthModal'; // Ensure the correct import path
import Modal from 'react-bootstrap/Modal';

function Header() {
  const { cart, removeFromCart, updateQuantity, setCart } = useContext(CartContext);
  const [openedDrawer, setOpenedDrawer] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  const toggleDrawer = () => setOpenedDrawer(!openedDrawer);
  const openLoginModal = () => { setIsSignup(false); setShowAuthModal(true); };
  const openSignupModal = () => { setIsSignup(true); setShowAuthModal(true); };
  const closeModal = () => setShowAuthModal(false);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);

  const toggleCartModal = () => setShowCartModal(!showCartModal);
  
  function navigateToCart() {
    navigate("/cart");
  }

  const handleQuantityChange = (productId, newQuantity, stock) => {
    if (newQuantity > stock) {
      alert(`You can only order up to ${stock} units.`);
    } else if (newQuantity < 1) {
      alert('Quantity must be at least 1.');
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

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

  return (
    <>
      <header>
        <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-white border-bottom">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/" onClick={() => setOpenedDrawer(false)}>
              {/* <FontAwesomeIcon icon={['fab', 'bootstrap']} className="ms-1" size="lg" /> */}
              <span className="ms-2 h5">Don Jerseys</span>
            </Link>
    
            {/* Cart & User/Admin Section */}
            <div className="d-flex align-items-center ms-auto">
              
              {/* Cart Icon */}
              <div className="position-relative me-3">
                <button type="button" className="btn btn-outline-dark position-relative" onClick={navigateToCart}>
                  <FontAwesomeIcon icon={['fas', 'shopping-cart']} />
                  {totalItems > 0 && (
                    <span className="badge bg-danger rounded-circle position-absolute top-0 end-0">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>

              {/* User/Admin Dropdown */}
              <div className="dropdown">
                <button className="btn dropdown-toggle" id="userDropdown" role="button" data-bs-toggle="dropdown">
                  <FontAwesomeIcon icon={['fas', 'user-alt']} />
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  {user ? (
                    <>
                      <li><p className="dropdown-item">Welcome, {user.username}</p></li>
                      {user.role === "admin" && (
                        <li>
                          <Link className="dropdown-item" to="/admin-dashboard">
                            <FontAwesomeIcon icon={['fas', 'user-shield']} className="me-2" />
                            Admin Dashboard
                          </Link>
                        </li>
                      )}
                      <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                    </>
                  ) : (
                    <>
                      <li><button className="dropdown-item" onClick={openLoginModal}>Login</button></li>
                      <li><button className="dropdown-item" onClick={openSignupModal}>Sign Up</button></li>
                    </>
                  )}
                </ul>
              </div>

            </div>
    {/* Mobile Menu Toggle Button */}
    <button className="navbar-toggler ms-3" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span className="navbar-toggler-icon"></span>
    </button>

    {/* Collapsible Menu */}
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <Link to="/products" className="nav-link" onClick={() => setOpenedDrawer(false)}>Explore</Link>
        </li>
      </ul>
    </div>
  

            <div className={"navbar-collapse offcanvas-collapse " + (openedDrawer ? "open" : "")}>
              <ul className="navbar-nav me-auto mb-lg-0">
                <li className="nav-item">
                  <Link to="/products" className="nav-link" onClick={() => setOpenedDrawer(false)}>
                    Explore
                  </Link>
                  
                </li>
              </ul>

              <div className="d-flex align-items-center">
                {/* Cart Icon with Badge */}
                <div className="position-relative me-3">
                  <button
                    type="button"
                    className="btn btn-outline-dark position-relative"
                    onClick={navigateToCart}
                  >
                    <FontAwesomeIcon icon={['fas', 'shopping-cart']} />
                    {totalItems > 0 && (
                      <span className="badge bg-danger rounded-circle position-absolute top-0 end-0">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </div>

               {/* User Icon and Auth Controls */}
<ul className="navbar-nav mb-2 mb-lg-0">
  <li className="nav-item dropdown">
    <button
      className="nav-link dropdown-toggle btn"
      id="userDropdown"
      role="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <FontAwesomeIcon icon={['fas', 'user-alt']} />
    </button>
    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
      {user ? (
        <>
          <li>
            <p className="dropdown-item">Welcome, {user.username}</p>
          </li>
          {user.role === "admin" && ( // Check if the user is an admin
            <li>
              <Link className="dropdown-item" to="/admin-dashboard">
                Admin Dashboard
              </Link>
            </li>
          )}
          <li>
            <button className="dropdown-item" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </>
      ) : (
        <>
          <li>
            <button className="dropdown-item" onClick={openLoginModal}>
              Login
            </button>
          </li>
          <li>
            <button className="dropdown-item" onClick={openSignupModal}>
              Sign Up
            </button>
          </li>
        </>
      )}
    </ul>
  </li>
</ul>

              </div>
            </div>

            {/* Mobile Menu */}
            <div className="d-inline-block d-lg-none">
              <button className="navbar-toggler p-0 border-0 ms-3" type="button" onClick={toggleDrawer}>
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>
          </div>
        </nav>

        {/* Cart Modal */}
        {/* <Modal show={showCartModal} onHide={toggleCartModal}>
  <Modal.Header closeButton>
    <Modal.Title>Your Cart</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {cart.length > 0 ? (
      <ul className="list-group">
        {cart.map((item, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div>{item.name}</div>
              <div>
                Quantity: 
                <input 
                  type="number" 
                  value={item.quantity} 
                  min="1" 
                  max={item.stock} 
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value), item.stock)} 
                />
              </div>
              <div>Price: ${item.price}</div>
              <div>
                Size:
                <input
                  type="text"
                  value={item.size || ''}
                  placeholder="Enter size"
                  required
                  onChange={(e) => handleSizeChange(item.id, e.target.value)}
                />
              </div>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => removeFromCart(item.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p>Your cart is empty.</p>
    )}
  </Modal.Body>
  <Modal.Footer>
    <div className="me-auto">
      <h5>Total: ${cartTotal.toFixed(2)}</h5>
    </div>
    <button className="btn btn-success" onClick={handleOrderClick}>
      Order Now
    </button>
    <button className="btn btn-secondary" onClick={toggleCartModal}>
      Close
    </button>
  </Modal.Footer>
</Modal> */}


      </header>

      <AuthModal isOpen={showAuthModal} onClose={closeModal} isSignup={isSignup} />
    </>
  );
}

export default Header;
