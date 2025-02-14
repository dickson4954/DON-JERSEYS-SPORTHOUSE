import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CartContext from '../../CartContext';
import './ProductDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';

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
    fetch(`https://donjerseyssporthouseserver-5-cmus.onrender.com/products/${id}`)
      .then(response => response.json())
      .then(data => {
        console.log("Fetched Product:", data);
        
        const sizes = data.variants ? data.variants.flatMap(v => 
          v.size.includes('-') ? v.size.split('-').map(Number) : v.size.split(',')
        ) : [];
        
  
        const editions = typeof data.editions === 'string' 
  ? data.editions.split(',').map(e => e.trim()) 
  : (Array.isArray(data.editions) ? data.editions : []);

      
  
        console.log("Extracted Sizes:", sizes);
        console.log("Extracted Editions:", editions);
  
        // Store updated product data with split sizes and editions
        setProduct({ ...data, sizes, editions });
        setLoading(false);
      })
      .catch(error => {
        setError('Failed to load product details.');
        setLoading(false);
        console.error(error);
      });
  }, [id]);
  
  
  
  const categoryName = product?.category?.name;
  console.log("Category:", product?.category);
 



  
  
  if (loading) return <div className="text-center my-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!product) return <div className="text-center my-5">Product not found</div>;

  const { name, image_url, price, description, stock, category, variants } = product;

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
    setSelectedBadge(prevBadge => prevBadge === badge ? '' : badge);
  };

  const canAddToCart = selectedSize && (category.name === 'Jersey' ? selectedEdition : true);

  const handleAddToCart = () => {
    if (!canAddToCart) {
      setShowWarning(true);
      selectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  
    const hasCustomization = customOptions.printName || customOptions.printNumber || customOptions.fontType || selectedBadge;
  
    // Pass the selectedSize to the addToCart function
    addToCart({
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
    }, quantity, selectedSize); // Pass size here
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
    backgroundColor: canAddToCart ? '#008C95' : (stock > 0 ? '#A7E1E3' : '#ccc'),
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
  console.log('Category:', category?.name);
  console.log('Selected Edition:', selectedEdition);
  console.log('Custom Options:', customOptions);
  
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
            <div className="size-selection mt-4">
  <h5>* Select Size</h5>
  <div className="size-box-container">
    {product.sizes?.map((size, index) => (
      <div 
        key={index} 
        className={clsx("size-box", { "selected": selectedSize === size })} // Apply 'selected' class
        onClick={() => setSelectedSize(size)} // Set selected size
      >
        {size}
      </div>
    ))}
  </div>
</div>


           {/* Jersey Category: Edition and Customization Options */}
{category?.name === 'Jerseys' && (
  <>
     {/* Kit Edition Section */}
     <h5 className={clsx('required-label', { 'warning-text': !selectedEdition && showWarning })}>
      * Select Kit Edition
    </h5>
    <div className="edition-selection mt-4">
      {(typeof product.editions === 'string' ? product.editions.split(',') : product.editions)?.map((edition) => {
        const trimmedEdition = edition.trim(); // Ensure no spaces affect selection
        return (
          <div 
            key={trimmedEdition}
            className={clsx('edition-box', { selected: selectedEdition === trimmedEdition, 'warning-border': !selectedEdition && showWarning })}
            onClick={() => {
              console.log(`Edition selected: ${trimmedEdition}`);  // Debugging
              setSelectedEdition(trimmedEdition);
            }}
          >
            {trimmedEdition}
          </div>
        );
      })}
    </div>


    {/* Customization options */}
    <div className="custom-options mt-3">
      <h5>Customization</h5>
      <div className="d-flex align-items-center">
        <label className="me-3">
          <input 
            type="checkbox" 
            checked={customOptions.printName} 
            onChange={() => {
              const newCustomOptions = { ...customOptions, printName: !customOptions.printName };
              console.log('Updated Custom Options:', newCustomOptions);  // Debugging
              setCustomOptions(newCustomOptions);
            }} 
          />
          Print Name + Ksh 200
        </label>
        {customOptions.printName && (
          <input 
            type="text" 
            className="form-control me-3" 
            placeholder="Enter Name" 
            value={customOptions.nameText} 
            onChange={(e) => {
              const updatedOptions = { ...customOptions, nameText: e.target.value };
              setCustomOptions(updatedOptions);
            }} 
          />
        )}
      </div>
      <div className="d-flex align-items-center mt-2">
        <label className="me-3">
          <input 
            type="checkbox" 
            checked={customOptions.printNumber} 
            onChange={() => {
              const updatedOptions = { ...customOptions, printNumber: !customOptions.printNumber };
              setCustomOptions(updatedOptions);
            }} 
          />
          Print Number + Ksh 200
        </label>
        {customOptions.printNumber && (
          <input 
            type="text" 
            className="form-control me-3" 
            placeholder="Enter Number" 
            value={customOptions.numberText} 
            onChange={(e) => {
              const updatedOptions = { ...customOptions, numberText: e.target.value };
              setCustomOptions(updatedOptions);
            }} 
          />
        )}
      </div>
      <div className="font-options mt-3">
        <h5>Font Type </h5>
        <label>
          <input type="radio" name="fontType" value="League Font" onChange={() => {
            const updatedOptions = { ...customOptions, fontType: 'League Font' };
            setCustomOptions(updatedOptions);
          }} /> 
          LEAGUE FONT + Ksh 0
        </label>
        <label>
          <input type="radio" name="fontType" value="Team Font" onChange={() => {
            const updatedOptions = { ...customOptions, fontType: 'Team Font' };
            setCustomOptions(updatedOptions);
          }} /> 
          TEAM FONT + Ksh 0
        </label>
      </div>

      {/* Badge options */}
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

            {/* Add to Cart Button */}
            <div className="d-flex flex-column mt-3">
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button
                  className="btn btn-sm"
                  style={buttonStyle}
                  disabled={!canAddToCart || stock <= 0}
                  onClick={handleAddToCart}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  Add to Cart
                </button>

                <button
                  className="btn btn-sm"
                  onClick={() => navigate('/cart')} // Navigate to cart page
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
