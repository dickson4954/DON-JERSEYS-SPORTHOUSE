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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    navigate(`/?search=${value}`);
  };

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
          <div className="container-fluid d-flex justify-content-between align-items-center">
            {/* Left side: Brand Name and Explore */}
            <div className="d-flex align-items-center">
              <Link className="navbar-brand" to="/" onClick={() => setOpenedDrawer(false)}>
                <span className="ms-2 h5">Don Jerseys Sporthouse</span>
              </Link>
              <Link to="/products" className="nav-link d-none d-lg-block">Explore</Link>
            </div>

            {/* Right side: Search, Cart, User Icon, and Toggle Menu */}
            <div className="d-flex align-items-center">
              {/* Search Icon */}
              <button
                type="button"
                className="btn btn-outline-dark me-2"
                onClick={() => setShowSearchBar(!showSearchBar)}
              >
                <FontAwesomeIcon icon={['fas', 'search']} />
              </button>
              {showSearchBar && (
                <form className="d-inline-block me-3" onSubmit={handleSearchChange}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search for product"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </form>
              )}

              {/* Cart Icon */}
              <button
                type="button"
                className="btn btn-outline-dark position-relative me-3"
                onClick={navigateToCart}
              >
                <FontAwesomeIcon icon={['fas', 'shopping-cart']} />
                {totalItems > 0 && (
                  <span className="badge bg-danger rounded-circle position-absolute top-0 end-0">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Icon */}
              <div className="d-none d-lg-block dropdown">
                <button
                  className="btn btn-outline-dark dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FontAwesomeIcon icon={['fas', 'user-alt']} />
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  {user ? (
                    <>
                      <li><p className="dropdown-item">Welcome, {user.username}</p></li>
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

            {/* Mobile Menu */}
            <button
              className="navbar-toggler d-lg-none"
              type="button"
              onClick={toggleDrawer}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          {/* Collapsible Menu (Small Screens) */}
          {openedDrawer && (
            <div className="offcanvas offcanvas-end show" style={{ width: '250px' }}>
              <div className="offcanvas-header">
                <button type="button" className="btn-close" onClick={toggleDrawer}></button>
              </div>
              <div className="offcanvas-body">
                <Link to="/products" className="nav-link" onClick={() => setOpenedDrawer(false)}>Explore</Link>
                <hr />
                {user ? (
                  <>
                    <p className="dropdown-item">Welcome, {user.username}</p>
                    <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <>
                    <button className="dropdown-item" onClick={openLoginModal}>Login</button>
                    <button className="dropdown-item" onClick={openSignupModal}>Sign Up</button>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={closeModal} isSignup={isSignup} />
    </>
  );
}

export default Header;
