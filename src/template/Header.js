import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart, faUserAlt } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CartContext from '../CartContext';
import AuthModal from '../user/AuthModal';

function Header() {
  const { cart } = useContext(CartContext);
  const [openedDrawer, setOpenedDrawer] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Load user from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  
    if (value.trim() === '') {
      navigate('/'); // Reset the product list when search is cleared
    }
  };
  

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${searchTerm.trim()}`);
    } else {
      navigate('/');
    }
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
    <header>
      <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-white border-bottom">
        <div className="container-fluid d-flex align-items-center justify-content-between">
          
          {/* Left Side - Brand & Explore */}
          <div className="d-flex align-items-center gap-3">
            <Link className="navbar-brand m-0 p-0" to="/">
              <span className="h5">Don Jerseys Sporthouse</span>
            </Link>
            <Link to="/products" className="nav-link d-none d-lg-block">Explore</Link>
          </div>

          {/* Right Side - Icons Section */}
          <div className="d-flex align-items-center gap-3">
            
            {/* Search Button */}
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={() => setShowSearchBar(!showSearchBar)}
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>

            {showSearchBar && (
              <input
              type="text"
              className="form-control"
              placeholder="Search for product"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
            />
            )}

            {/* Cart Button */}
            <button
              type="button"
              className="btn btn-outline-dark position-relative"
              onClick={() => navigate('/cart')}
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              {totalItems > 0 && (
                <span className="badge bg-danger rounded-circle position-absolute top-0 end-0">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="dropdown d-none d-lg-block">
              <button
                className="btn btn-outline-dark dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <FontAwesomeIcon icon={faUserAlt} />
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                {user ? (
                  <>
                    <li><p className="dropdown-item">Welcome, {user.username}</p></li>
                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                  </>
                ) : (
                  <>
                    <li><button className="dropdown-item" onClick={() => setShowAuthModal(true)}>Login</button></li>
                    <li><button className="dropdown-item" onClick={() => { setIsSignup(true); setShowAuthModal(true); }}>Sign Up</button></li>
                  </>
                )}
              </ul>
            </div>

            {/* Navbar Toggle (for Mobile) */}
            <button className="navbar-toggler d-lg-none" type="button" onClick={() => setOpenedDrawer(!openedDrawer)}>
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Offcanvas Menu (Mobile) */}
      <div className={`offcanvas offcanvas-end ${openedDrawer ? 'show' : ''}`} style={{ width: '250px' }}>
        <div className="offcanvas-header">
          <button type="button" className="btn-close" onClick={() => setOpenedDrawer(false)}></button>
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
              <button className="dropdown-item" onClick={() => setShowAuthModal(true)}>Login</button>
              <button className="dropdown-item" onClick={() => { setIsSignup(true); setShowAuthModal(true); }}>Sign Up</button>
            </>
          )}
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} isSignup={isSignup} />
    </header>
  );
}

export default Header;
