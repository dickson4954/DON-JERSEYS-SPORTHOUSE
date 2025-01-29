import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CartContext from '../../CartContext';
import './ProductDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

import clsx from 'clsx';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
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
    fontType: '',
    nameText: '',
    numberText: '',
  });
  const [showWarning, setShowWarning] = useState(false);

  // Reference to scroll back to the selection options
  const selectionRef = useRef(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/products/${id}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch product details.');
        return response.json();
      })
      .then(data => {
        console.log(data);
        // Extract sizes and total stock from variants
        const sizes = data.variants.map(variant => variant.size);
        const totalStock = data.variants.reduce((sum, variant) => sum + variant.stock, 0);
  
        setProduct({ ...data, sizes, stock: totalStock });
        setLoading(false);
      })
      .catch(error => {
        setError('Failed to load product details.');
        setLoading(false);
        console.error(error);
      });
  }, [id]);
  
  if (loading) return <div className="text-center my-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!product) return <div className="text-center my-5">Product not found</div>;

  const { name, image_url, price, description, stock, category } = product;

  // Calculate the total price
  const additionalPrice = 
    (customOptions.printName ? 200 : 0) + 
    (customOptions.printNumber ? 200 : 0) + 
    (selectedBadge ? 100 : 0);

  const totalPrice = quantity * (price + additionalPrice);

  const handleCustomOptionChange = (option) => {
    setCustomOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount)); // Prevent quantity from going below 1
  };

  const handleBadgeChange = (badge) => {
    setSelectedBadge(prevBadge => prevBadge === badge ? '' : badge);
  };

  const canAddToCart = selectedEdition && selectedSize;

  const handleAddToCart = () => {
    if (!canAddToCart) {
      setShowWarning(true);
      selectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  
    addToCart({
      id: product.id,
      name: product.name,
      price: totalPrice,
      quantity,
      image_url: product.image_url,
      edition: selectedEdition,
      size: selectedSize,
      badge: selectedBadge,
      customName: customOptions.nameText,
      customNumber: customOptions.numberText,
      fontType: customOptions.fontType,
    });
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

  return (
    <div className="product-details-container">
      <div className="container product-details mt-5">
        <div className="row">
          <div className="col-lg-6">
            <div className="product-image">
              {stock === 0 && <div className="sold-out-badge">Out of Stock</div>}
              <img src={image_url} alt={name} className="img-fluid" />
            </div>
          </div>
          <div className="col-lg-6">
            <h1 className="product-name">{name}</h1>
            <p>{description}</p>

            {category?.name === 'Jerseys' && (
              <>
                <div className="selection-options mt-4" ref={selectionRef}>
{/* Kit Edition Section */}
<div className="selection-options mt-4" ref={selectionRef}>
  <h5 
    className={clsx('required-label', {
      'warning-text': !selectedEdition && showWarning,
    })}
  >
    * Select Kit Edition
  </h5>
  <div className="d-flex">
    {['Fan Edition', 'Player Edition'].map((edition) => (
      <button 
        key={edition}
        className={clsx('btn', 'btn-edition', 'mx-1', {
          selected: selectedEdition === edition,
          'warning-border': !selectedEdition && showWarning,
        })}
        onClick={() => setSelectedEdition(edition)}
      >
        {edition}
      </button>
    ))}
  </div>
</div>

{/* Size Selection Section */}
<div className="size-selection mt-4">
  <h5
    className={clsx('required-label', {
      'warning-text': !selectedSize && showWarning,
    })}
  >
    * Select Jersey Size
  </h5>
  <div className="size-box-container">
    {/* Static size options */}
    {['S', 'M', 'L', 'XL', '2XL','3XL'].map((size) => (
      <div
        key={size}
        className={clsx('size-box', {
          selected: selectedSize === size,
        })}
        onClick={() => setSelectedSize(size)}
      >
        {size}
      </div>
    ))}
  </div>
</div>



</div>

                {/* Customization options */}
                <div className="custom-options mt-3">
                  <h5>Customization </h5>
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
                        onChange={(e) => setCustomOptions(prev => ({ ...prev, nameText: e.target.value }))}
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
                        onChange={(e) => setCustomOptions(prev => ({ ...prev, numberText: e.target.value }))}
                      />
                    )}
                  </div>
                  <div className="font-options mt-3">
                    <h5>Font Type </h5>
                    <label>
                      <input type="radio" name="fontType" value="League Font" onChange={() => setCustomOptions(prev => ({ ...prev, fontType: 'League Font' }))} /> 
                      LEAGUE FONT + Ksh 0
                    </label>
                    <label>
                      <input type="radio" name="fontType" value="Team Font" onChange={() => setCustomOptions(prev => ({ ...prev, fontType: 'Team Font' }))} /> 
                      TEAM FONT + Ksh 0
                    </label>
                  </div>

                  <div className="badge-options mt-3">
                    <h5>Badge </h5>
                    {visibleBadges.map(badge => (
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

            {/* Quantity and price section */}
            <div className="quantity-controls mt-4">
  <h5>Quantity</h5>
  <div className="d-flex align-items-center">
    <button 
      className="btn btn-secondary" 
      onClick={() => handleQuantityChange(-1)} 
      disabled={quantity <= 1}
    >
      -
    </button>
    <input 
      type="number" 
      className="form-control mx-2" 
      value={quantity} 
      readOnly
    />
    <button 
      className="btn btn-secondary" 
      onClick={() => handleQuantityChange(1)}
    >
      +
    </button>
  </div>

            </div>

            {/* Price Calculation */}
            <div className="price-summary mt-4">
  <h5>Total Stock: {product.stock}</h5>
  <h5>Total Price: Ksh {totalPrice}</h5>
</div>


            <div className="d-grid gap-2 my-4">
  {showWarning && !canAddToCart && (
    <p className="warning-text">Please select all available variations.</p>
  )}
  <button
    className={`btn btn-sm ${canAddToCart ? 'btn-primary' : 'btn-dark'}`}
    disabled={stock <= 0}
    onClick={handleAddToCart}
    style={{ fontSize: '0.9rem', padding: '8px 12px' }} // Smaller size
  >
    {stock > 0 ? (
      <>
        <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
      </>
    ) : (
      'Out of Stock'
    )}
  </button>
</div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
