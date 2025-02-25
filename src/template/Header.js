import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CartContext from '../CartContext';
import AuthModal from '../user/AuthModal';
import Modal from 'react-bootstrap/Modal';

function Header() {
  const { cart, removeFromCart, updateQuantity, setCart } = useContext(CartContext);
  const [openedDrawer, setOpenedDrawer] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Handle real-time search as the user types
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    navigate(`/?search=${value}`); // Update the URL with the search term
  };

  // Scroll to products section when searchTerm changes
  useEffect(() => {
    if (searchTerm) {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchTerm]);

  return (
    <>
      <header>
        <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-white border-bottom">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/" onClick={() => setOpenedDrawer(false)}>
              <span className="ms-2 h5">Don Jerseys Sporthouse</span>
            </Link>
            
            <div className={"navbar-collapse offcanvas-collapse " + (openedDrawer ? "open" : "")}>
              <ul className="navbar-nav me-auto mb-lg-0">
                <li className="nav-item">
                  <Link to="/products" className="nav-link" onClick={() => setOpenedDrawer(false)}>
                    Explore
                  </Link>
                </li>
              </ul>

              <div className="d-flex align-items-center">
                {/* Search Icon and Search Bar */}
                <div className="me-3">
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => setShowSearchBar(!showSearchBar)}
                  >
                    <FontAwesomeIcon icon={['fas', 'search']} />
                  </button>
                  {showSearchBar && (
                    <div className="d-inline-block ms-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search for desired product"
                        value={searchTerm}
                        onChange={handleSearchChange} // Handle real-time search
                      />
                    </div>
                  )}
                </div>

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
                    <a
                      href="#"
                      className="nav-link dropdown-toggle"
                      id="userDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <FontAwesomeIcon icon={['fas', 'user-alt']} />
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                      {user ? (
                        <>
                          <li>
                            <p className="dropdown-item">Welcome, {user.username}</p>
                          </li>
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
      </header>

      <AuthModal isOpen={showAuthModal} onClose={closeModal} isSignup={isSignup} />
    </>
  );
}

export default Header;