import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CartContext from '../../CartContext';
import './ProductDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import Swal from 'sweetalert2';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);
  const [showMoreBadges, setShowMoreBadges] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedEdition, setSelectedEdition] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('');
  const [customOptions, setCustomOptions] = useState({
    printName: false,
    printNumber: false,
    nameText: '',
    numberText: '',
    fontType: 'League Font',
  });
  const [showWarning, setShowWarning] = useState(false);
  const selectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/products/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched Product:", data);

        if (!data.variants || !Array.isArray(data.variants)) {
          throw new Error("Invalid product data format.");
        }

     // Process size_stock data
     const sizesWithStock = Object.entries(data.size_stock).flatMap(([size, editions]) => {
      return Object.entries(editions).map(([edition, stock]) => ({
        size,
        edition,
        stock,
      }));
    });

    setProduct({ ...data, sizesWithStock });
    setLoading(false);
  })
  .catch(error => {
    console.error("Error fetching product:", error);
    setError("Failed to load product details. Please try again.");
    setLoading(false);
  });
}, [id]);

  if (loading) return <div className="text-center my-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!product) return <div className="text-center my-5">Product not found</div>;

  const { name, image_url, price, description, category, variants, sizesWithStock } = product;

  // Process editions to split them into individual items
  const editions = Array.isArray(product.editions)
    ? product.editions.flatMap(edition => 
        typeof edition === 'string' ? edition.split(',').map(e => e.trim()) : edition
      )
    : [];

  const additionalPrice =
    (customOptions.printName ? 200 : 0) +
    (customOptions.printNumber ? 200 : 0) +
    (selectedBadge ? 100 : 0);

  const totalPrice = quantity * (price + additionalPrice);

  const handleCustomOptionChange = (option) => {
    setCustomOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const handleBadgeChange = (badge) => {
    setSelectedBadge(prevBadge => (prevBadge === badge ? '' : badge));
  };

  const canAddToCart = selectedSize && (category.name === 'Jersey' ? selectedEdition : true);

  const handleAddToCart = () => {
    if (!canAddToCart) {
      setShowWarning(true);
      selectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  
    const hasCustomization = customOptions.printName || customOptions.printNumber || customOptions.fontType || selectedBadge;
  
    // Find the selected variant based on the selected size and edition
    const selectedVariant = sizesWithStock.find(v => v.size === selectedSize && v.edition === selectedEdition);
  
    if (!selectedVariant || selectedVariant.stock < quantity) {
      Swal.fire({ icon: 'error', title: 'Out of Stock', text: `Not enough stock for size ${selectedSize}.` });
      return;
    }
  
    // Add the product to the cart with the selected size
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: price,
        image_url: product.image_url,
        edition: selectedEdition,
        badge: selectedBadge,
        customName: customOptions.nameText,
        customNumber: customOptions.numberText,
        fontType: customOptions.fontType,
        additionalPrice,
        hasCustomization,
        size: selectedSize, // Pass the selected size here
      },
      quantity
    );
  
    // Update stock in the backend
    fetch(`https://donjerseyssporthouseserver-71ee.onrender.com/products/${id}/update-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ size: selectedSize, edition: selectedEdition, quantity }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setProduct(prev => {
            if (!prev) return prev; // Prevents errors if `prev` is null
            return {
              ...prev,
              sizesWithStock: prev.sizesWithStock.map(v =>
                v.size === selectedSize && v.edition === selectedEdition
                  ? { ...v, stock: Math.max(0, v.stock - quantity) } // Ensures stock never goes negative
                  : v
              ),
            };
          });
        } else {
          console.warn("Stock update failed:", data);
        }
      })
      .catch(error => {
        console.error("Error updating stock:", error);
      });
  
    // Update cart count only after stock update
    setCartCount(prevCount => prevCount + quantity);
  };

  const badges = [
    { name: 'Europa', description: 'Europa Badge with Foundation + Ksh 100' },
    { name: 'Champions', description: 'Champions Badge with Foundation + Ksh 100' },
    { name: 'Premier League', description: 'Premier League Badge + Ksh 100' },
    { name: 'La Liga', description: 'La Liga Badge + Ksh 100' },
    { name: 'Serie A', description: 'Serie A Badge + Ksh 100' },
    { name: 'MLS', description: 'MLS Badge + Ksh 100' },
  ];

  const visibleBadges = showMoreBadges ? badges : badges.slice(0, 2);

  const buttonStyle = {
    backgroundColor: canAddToCart ? '#008C95' : '#A7E1E3',
    color: '#ffffff',
    fontWeight: 'bold',
    padding: '8px 16px',
    minWidth: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '5px',
  };

  return (
    <div className="product-details-container">
      <div className="container product-details mt-5">
        <div className="row">
          <div className="col-lg-6">
            <div className="product-image">
              <img src={image_url} alt={name} className="img-fluid" />
            </div>
          </div>
          <div className="col-lg-6">
            <h1 className="product-name">{name}</h1>
            <p>{description}</p>
            <div className="size-selection mt-4" ref={selectionRef}>
                <h5>* Select Size</h5>
                <div className="size-box-container">
                  {[...new Set(sizesWithStock.map(variant => variant.size))].map((size, index) => {
                    const isOutOfStock = sizesWithStock.filter(v => v.size === size).every(v => v.stock <= 0);

                    return (
                      <div
                        key={index}
                        className={clsx('size-box', {
                          selected: selectedSize === size,
                          'out-of-stock': isOutOfStock,
                        })}
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedSize(size);
                          }
                        }}
                        style={{
                          opacity: isOutOfStock ? 0.5 : 1,
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        }}
                        disabled={isOutOfStock}
                      >
                        {size}
                        {isOutOfStock && <span className="sold-out-text">Sold Out</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

            {category.name === 'Jerseys' && (
              <>
                <h5 className={clsx('required-label', { 'warning-text': !selectedEdition && showWarning })}>
                  * Select Kit Edition
                </h5>
                <div className="edition-selection mt-4">
                  {[...new Set(sizesWithStock.map(variant => variant.edition))].map((edition, index) => {
                    const isOutOfStock = sizesWithStock.filter(v => v.edition === edition).every(v => v.stock <= 0);

                    return (
                      <div
                        key={index}
                        className={clsx('edition-box', {
                          selected: selectedEdition === edition,
                          'out-of-stock': isOutOfStock,
                        })}
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedEdition(edition);
                          }
                        }}
                        style={{
                          opacity: isOutOfStock ? 0.5 : 1,
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        }}
                        disabled={isOutOfStock}
                      >
                        <span
                          style={{
                            textDecoration: isOutOfStock ? 'line-through' : 'none',
                          }}
                        >
                          {edition}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="custom-options mt-3">
                  <h5>Customization</h5>
                  <div className="d-flex align-items-center">
                    <label className="me-3">
                      <input
                        type="checkbox"
                        checked={customOptions.printName}
                        onChange={() => handleCustomOptionChange('printName')}
                      />
                      Print Name + Ksh 200
                    </label>
                    {customOptions.printName && (
                      <input
                        type="text"
                        className="form-control me-3"
                        placeholder="Enter Name"
                        value={customOptions.nameText}
                        onChange={(e) =>
                          setCustomOptions(prev => ({
                            ...prev,
                            nameText: e.target.value.replace(/[^A-Za-z ]/g, ''),
                          }))
                        }
                      />
                    )}
                  </div>
                  <div className="d-flex align-items-center mt-2">
                    <label className="me-3">
                      <input
                        type="checkbox"
                        checked={customOptions.printNumber}
                        onChange={() => handleCustomOptionChange('printNumber')}
                      />
                      Print Number + Ksh 200
                    </label>
                    {customOptions.printNumber && (
                      <input
                        type="text"
                        className="form-control me-3"
                        placeholder="Enter Number"
                        value={customOptions.numberText}
                        onChange={(e) =>
                          setCustomOptions(prev => ({
                            ...prev,
                            numberText: e.target.value.replace(/[^0-9]/g, ''),
                          }))
                        }
                      />
                    )}
                  </div>
                  <div className="font-options mt-3">
                    <h5>Font Type</h5>
                    <label>
                      <input
                        type="radio"
                        name="fontType"
                        value="League Font"
                        checked={customOptions.fontType === 'League Font'}
                        onChange={() =>
                          setCustomOptions(prev => ({ ...prev, fontType: 'League Font' }))
                        }
                      />
                      LEAGUE FONT + Ksh 0
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="fontType"
                        value="Team Font"
                        checked={customOptions.fontType === 'Team Font'}
                        onChange={() =>
                          setCustomOptions(prev => ({ ...prev, fontType: 'Team Font' }))
                        }
                      />
                      TEAM FONT + Ksh 0
                    </label>
                  </div>

                  <div className="badge-options mt-3">
                    <h5>Badge</h5>
                    {visibleBadges.map((badge) => (
                      <label key={badge.name}>
                        <input
                          type="radio"
                          name="badge"
                          checked={selectedBadge === badge.name}
                          onChange={() => handleBadgeChange(badge.name)}
                        />
                        {badge.description}
                      </label>
                    ))}
                    <button
                      onClick={() => setShowMoreBadges(!showMoreBadges)}
                      className="btn btn-link"
                    >
                      {showMoreBadges ? 'Show Less' : 'Show More'}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="quantity-selection mt-4">
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span className="mx-3">{quantity}</span>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => handleQuantityChange(1)}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
              <div className="mt-3">
                <strong>Total Price: Ksh {totalPrice}</strong>
              </div>
            </div>

            <div className="d-flex flex-column mt-3">
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button
                  className="btn btn-sm"
                  style={buttonStyle}
                  disabled={!canAddToCart}
                  onClick={handleAddToCart}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  Add to Cart
                </button>

                <button
                  className="btn btn-sm"
                  onClick={() => navigate('/cart')}
                  style={{
                    border: '1px solid #A7E1E3',
                    color: '#008C95',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    minWidth: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  View Cart
                  {cartCount > 0 && (
                    <span
                      style={{
                        backgroundColor: '#008C95',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        top: '-12px',
                        left: '12px',
                      }}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;